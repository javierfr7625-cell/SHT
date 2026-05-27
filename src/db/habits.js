import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  query, 
  where,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

const isDemoUser = (user) => {
  return !user || user.isDemo === true;
};

// --- DEMO MODE STATE MANAGEMENT ---
const getInitialDemoData = () => {
  const habits = [
    {
      id: 'demo-habit-1',
      userId: 'demo-user',
      perfilId: 'Principal',
      nombre: 'Beber 2L de agua',
      dias: [0, 1, 2, 3, 4, 5, 6],
      horaSugerida: '08:00',
      createdAt: '2026-05-01'
    },
    {
      id: 'demo-habit-2',
      userId: 'demo-user',
      perfilId: 'Principal',
      nombre: 'Hacer ejercicio (Gym/Cardio)',
      dias: [1, 3, 5],
      horaSugerida: '18:30',
      createdAt: '2026-05-01'
    },
    {
      id: 'demo-habit-3',
      userId: 'demo-user',
      perfilId: 'Principal',
      nombre: 'Leer 15 páginas',
      dias: [1, 2, 3, 4, 5],
      horaSugerida: '22:00',
      createdAt: '2026-05-01'
    }
  ];

  const registry = {
    'demo-habit-1': {
      '2026-05-20': { completado: true, justificado: false, nota: '' },
      '2026-05-21': { completado: true, justificado: false, nota: '' },
      '2026-05-22': { completado: false, justificado: true, nota: 'Viaje de trabajo' },
      '2026-05-23': { completado: true, justificado: false, nota: '' },
      '2026-05-24': { completado: true, justificado: false, nota: '' },
      '2026-05-25': { completado: true, justificado: false, nota: '' },
      '2026-05-26': { completado: false, justificado: false, nota: '' },
    },
    'demo-habit-2': {
      '2026-05-20': { completado: true, justificado: false, nota: '' },
      '2026-05-22': { completado: true, justificado: false, nota: '' },
      '2026-05-25': { completado: false, justificado: true, nota: 'Dolor de rodilla' },
    },
    'demo-habit-3': {
      '2026-05-20': { completado: true, justificado: false, nota: '' },
      '2026-05-21': { completado: true, justificado: false, nota: '' },
      '2026-05-22': { completado: false, justificado: false, nota: '' },
      '2026-05-25': { completado: true, justificado: false, nota: '' },
      '2026-05-26': { completado: true, justificado: false, nota: '' },
    }
  };

  const userProfiles = ['Principal', 'Trabajo', 'Vacaciones'];
  const publicRoutines = [
    {
      id: 'pub-routine-1',
      autor: 'Entrenador Personal',
      nombre: 'Rutina Fitness Básica',
      habitos: [
        { nombre: 'Estiramientos corporales', dias: [0,1,2,3,4,5,6], horaSugerida: '07:30' },
        { nombre: 'Cardio ligero 30 min', dias: [1,3,5], horaSugerida: '08:00' },
        { nombre: 'Entrenamiento de fuerza', dias: [2,4], horaSugerida: '19:00' }
      ]
    },
    {
      id: 'pub-routine-2',
      autor: 'Coach Mindfulness',
      nombre: 'Enfoque Mental Diario',
      habitos: [
        { nombre: 'Meditación matutina', dias: [0,1,2,3,4,5,6], horaSugerida: '07:00' },
        { nombre: 'Escribir en diario de gratitud', dias: [1,2,3,4,5], horaSugerida: '22:30' }
      ]
    }
  ];

  return { habits, registry, userProfiles, publicRoutines };
};

const getDemoStore = () => {
  let data = localStorage.getItem('sht_demo_store');
  if (!data) {
    const initial = getInitialDemoData();
    localStorage.setItem('sht_demo_store', JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const saveDemoStore = (store) => {
  localStorage.setItem('sht_demo_store', JSON.stringify(store));
};

// --- USER PROFILES FUNCTIONS ---

export const getUserProfiles = async (user) => {
  if (isDemoUser(user)) {
    const store = getDemoStore();
    return store.userProfiles || ['Principal'];
  }

  // Firestore Implementation
  const userDocRef = doc(db, 'usuarios', user.uid);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists() && userDoc.data().perfiles) {
    return userDoc.data().perfiles;
  }
  
  // Initialize default profile list if none exists
  const initialProfiles = ['Principal'];
  await setDoc(userDocRef, { perfiles: initialProfiles }, { merge: true });
  return initialProfiles;
};

export const saveUserProfiles = async (user, profiles) => {
  if (isDemoUser(user)) {
    const store = getDemoStore();
    store.userProfiles = profiles;
    saveDemoStore(store);
    return;
  }

  // Firestore Implementation
  const userDocRef = doc(db, 'usuarios', user.uid);
  await setDoc(userDocRef, { perfiles: profiles }, { merge: true });
};

// --- CORE EXPORTED DATABASE ACTIONS (BY PROFILE) ---

export const getHabits = async (user, profileId = 'Principal') => {
  if (isDemoUser(user)) {
    const store = getDemoStore();
    // Support legacy habits that don't have perfilId by defaulting to 'Principal'
    return store.habits.filter(h => (h.perfilId || 'Principal') === profileId);
  }

  // Firestore Implementation
  const habitsRef = collection(db, 'habitos');
  const q = query(
    habitsRef, 
    where('userId', '==', user.uid),
    where('perfilId', '==', profileId)
  );
  
  const querySnapshot = await getDocs(q);
  const habits = [];
  querySnapshot.forEach((doc) => {
    habits.push({ id: doc.id, ...doc.data() });
  });

  // Backward compatibility: If no habits found, query all user habits and see if any have no perfilId
  if (habits.length === 0 && profileId === 'Principal') {
    const legacyQ = query(habitsRef, where('userId', '==', user.uid));
    const legacySnapshot = await getDocs(legacyQ);
    const legacyHabits = [];
    legacySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.perfilId) {
        legacyHabits.push({ id: doc.id, ...data, perfilId: 'Principal' });
        // Update document asynchronously to set profileId
        updateDoc(doc.ref, { perfilId: 'Principal' });
      }
    });
    if (legacyHabits.length > 0) return legacyHabits;
  }

  return habits;
};

export const createHabit = async (user, habitData, profileId = 'Principal') => {
  const newHabit = {
    userId: user.uid,
    perfilId: profileId,
    nombre: habitData.nombre,
    dias: habitData.dias,
    horaSugerida: habitData.horaSugerida || '08:00',
    createdAt: new Date().toISOString().split('T')[0]
  };

  if (isDemoUser(user)) {
    const store = getDemoStore();
    const id = 'demo-habit-' + Date.now();
    const created = { id, ...newHabit };
    store.habits.push(created);
    saveDemoStore(store);
    return created;
  }

  // Firestore
  const habitsRef = collection(db, 'habitos');
  const docRef = await addDoc(habitsRef, newHabit);
  return { id: docRef.id, ...newHabit };
};

export const updateHabit = async (user, habitId, habitData) => {
  if (isDemoUser(user)) {
    const store = getDemoStore();
    store.habits = store.habits.map(h => 
      h.id === habitId 
        ? { ...h, nombre: habitData.nombre, dias: habitData.dias, horaSugerida: habitData.horaSugerida } 
        : h
    );
    saveDemoStore(store);
    return { id: habitId, ...habitData };
  }

  // Firestore
  const habitRef = doc(db, 'habitos', habitId);
  await updateDoc(habitRef, {
    nombre: habitData.nombre,
    dias: habitData.dias,
    horaSugerida: habitData.horaSugerida
  });
  return { id: habitId, ...habitData };
};

export const deleteHabit = async (user, habitId) => {
  if (isDemoUser(user)) {
    const store = getDemoStore();
    store.habits = store.habits.filter(h => h.id !== habitId);
    if (store.registry[habitId]) {
      delete store.registry[habitId];
    }
    saveDemoStore(store);
    return habitId;
  }

  // Firestore
  const habitRef = doc(db, 'habitos', habitId);
  await deleteDoc(habitRef);
  return habitId;
};

// Retrieve registration log for a specific habit
export const getHabitHistory = async (user, habitId) => {
  if (isDemoUser(user)) {
    const store = getDemoStore();
    return store.registry[habitId] || {};
  }

  const registryRef = collection(db, 'habitos', habitId, 'registro');
  const querySnapshot = await getDocs(registryRef);
  const history = {};
  querySnapshot.forEach((doc) => {
    history[doc.id] = doc.data();
  });
  return history;
};

// Save completion status for a specific day
export const saveHabitDay = async (user, habitId, dateStr, statusData) => {
  const data = {
    completado: statusData.completado,
    justificado: statusData.justificado,
    nota: statusData.nota || '',
    fecha: dateStr
  };

  if (isDemoUser(user)) {
    const store = getDemoStore();
    if (!store.registry[habitId]) {
      store.registry[habitId] = {};
    }
    store.registry[habitId][dateStr] = data;
    saveDemoStore(store);
    return data;
  }

  const dayDocRef = doc(db, 'habitos', habitId, 'registro', dateStr);
  await setDoc(dayDocRef, data);
  return data;
};

export const getHabitsWithHistory = async (user, profileId = 'Principal') => {
  const habits = await getHabits(user, profileId);
  const habitsWithHistory = await Promise.all(
    habits.map(async (habit) => {
      const history = await getHabitHistory(user, habit.id);
      return { ...habit, history };
    })
  );
  return habitsWithHistory;
};

// --- PUBLIC SHARING AND COMMUNITY ROUTINES ---

export const getCommunityRoutines = async (user) => {
  if (isDemoUser(user)) {
    const store = getDemoStore();
    return store.publicRoutines || [];
  }

  // Firestore
  const routinesRef = collection(db, 'rutinas_publicas');
  const querySnapshot = await getDocs(routinesRef);
  const routines = [];
  querySnapshot.forEach((doc) => {
    routines.push({ id: doc.id, ...doc.data() });
  });
  return routines;
};

export const shareRoutineToCommunity = async (user, profileName, habits) => {
  // Strip history and personal IDs from sharing
  const templateHabits = habits.map(h => ({
    nombre: h.nombre,
    dias: h.dias,
    horaSugerida: h.horaSugerida || '08:00'
  }));

  const payload = {
    autor: user.displayName || user.email.split('@')[0],
    nombre: profileName,
    habitos: templateHabits,
    createdAt: new Date().toISOString()
  };

  if (isDemoUser(user)) {
    const store = getDemoStore();
    const id = 'pub-routine-' + Date.now();
    store.publicRoutines.push({ id, ...payload });
    saveDemoStore(store);
    return { id, ...payload };
  }

  // Firestore
  const routinesRef = collection(db, 'rutinas_publicas');
  const docRef = await addDoc(routinesRef, payload);
  return { id: docRef.id, ...payload };
};
