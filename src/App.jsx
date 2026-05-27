import React, { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Tareas from './views/Tareas';
import GestionarTareas from './views/GestionarTareas';
import Resumen from './views/Resumen';
import Analizar from './views/Analizar';
import Ajustes from './views/Ajustes';
import ImportarRutinas from './views/ImportarRutinas';
import { 
  getHabitsWithHistory, 
  createHabit, 
  updateHabit, 
  deleteHabit, 
  saveHabitDay,
  getUserProfiles,
  saveUserProfiles,
  getHabits
} from './db/habits';
import { RefreshCw, Sparkles } from 'lucide-react';
import { translations } from './utils/translations';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  
  // App routing views state
  const [activeTab, setActiveTab] = useState('tareas'); 
  const [subView, setSubView] = useState(null); // 'importar'

  // Language state (loaded from local storage)
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('sht_lang') || 'es';
  });

  // Profiles state
  const [profiles, setProfiles] = useState(['Principal']);
  const [activeProfile, setActiveProfile] = useState('Principal');
  
  // Habits state
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync language preferences to localStorage
  const handleSetLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('sht_lang', newLang);
  };

  // Load user profiles and active habits on mount / profile change
  const loadProfileData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userProfilesList = await getUserProfiles(user);
      setProfiles(userProfilesList);

      const data = await getHabitsWithHistory(user, activeProfile);
      setHabits(data);
    } catch (e) {
      console.error("Error loading profile data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user, activeProfile]);

  // Profile management handlers
  const handleAddProfile = async (newProfileName) => {
    const updatedProfiles = [...profiles, newProfileName];
    setProfiles(updatedProfiles);
    await saveUserProfiles(user, updatedProfiles);
    setActiveProfile(newProfileName);
  };

  const handleDeleteProfile = async (profileToDelete) => {
    const profileHabits = await getHabits(user, profileToDelete);
    for (const h of profileHabits) {
      await deleteHabit(user, h.id);
    }

    const updatedProfiles = profiles.filter(p => p !== profileToDelete);
    setProfiles(updatedProfiles);
    await saveUserProfiles(user, updatedProfiles);
    
    setActiveProfile('Principal');
  };

  const handleSelectProfile = (profileName) => {
    setActiveProfile(profileName);
  };

  // --- CRUD HANDLERS WITH CACHE UPDATE ---

  const handleSaveDay = async (habitId, dateStr, statusData) => {
    try {
      await saveHabitDay(user, habitId, dateStr, statusData);
      setHabits(prevHabits => 
        prevHabits.map(h => {
          if (h.id === habitId) {
            return {
              ...h,
              history: {
                ...h.history,
                [dateStr]: {
                  fecha: dateStr,
                  ...statusData
                }
              }
            };
          }
          return h;
        })
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateHabit = async (habitData) => {
    try {
      const newHabit = await createHabit(user, habitData, activeProfile);
      setHabits(prev => [...prev, { ...newHabit, history: {} }]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickCreate = async (name) => {
    const defaultData = {
      nombre: name,
      dias: [0, 1, 2, 3, 4, 5, 6],
      horaSugerida: '08:00'
    };
    await handleCreateHabit(defaultData);
  };

  const handleUpdateHabit = async (habitId, habitData) => {
    try {
      await updateHabit(user, habitId, habitData);
      setHabits(prev => 
        prev.map(h => h.id === habitId ? { ...h, ...habitData } : h)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      await deleteHabit(user, habitId);
      setHabits(prev => prev.filter(h => h.id !== habitId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportComplete = (newActiveProfile) => {
    setActiveProfile(newActiveProfile);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  // Views Router
  const renderView = () => {
    // If routing through tab selection 'importar' or subview 'importar'
    if (subView === 'importar' || activeTab === 'importar') {
      return (
        <ImportarRutinas
          lang={lang}
          setView={(target) => {
            setSubView(null);
            setActiveTab(target === 'ajustes' ? 'ajustes' : 'tareas');
          }}
          activeProfile={activeProfile}
          profiles={profiles}
          onAddProfile={handleAddProfile}
          onImportComplete={handleImportComplete}
          activeProfileHabits={habits}
        />
      );
    }

    switch (activeTab) {
      case 'tareas':
        return (
          <Tareas 
            habits={habits} 
            loading={loading}
            onSaveDay={handleSaveDay} 
            onQuickCreate={handleQuickCreate}
            lang={lang}
          />
        );
      case 'gestionar':
        return (
          <GestionarTareas 
            habits={habits}
            onCreateHabit={handleCreateHabit}
            onUpdateHabit={handleUpdateHabit}
            onDeleteHabit={handleDeleteHabit}
            lang={lang}
          />
        );
      case 'resumen':
        return <Resumen habits={habits} lang={lang} />;
      case 'analizar':
        return <Analizar habits={habits} lang={lang} />;
      case 'ajustes':
        return (
          <Ajustes
            lang={lang}
            setLang={handleSetLang}
            activeProfile={activeProfile}
            onSelectProfile={handleSelectProfile}
            profiles={profiles}
            onAddProfile={handleAddProfile}
            onDeleteProfile={handleDeleteProfile}
            setView={setSubView}
          />
        );
      default:
        return <Tareas habits={habits} onSaveDay={handleSaveDay} onQuickCreate={handleQuickCreate} lang={lang} />;
    }
  };

  const handleTabChange = (tabId) => {
    setSubView(null);
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative">
      {/* Top Banner indicating Demo Mode */}
      {user.isDemo && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-600/90 to-amber-500/90 text-slate-950 text-[10px] font-extrabold uppercase py-1 text-center tracking-widest z-50 flex items-center justify-center gap-1.5 shadow-md">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          {translations[lang].ajustes.demo_alert}
        </div>
      )}

      {/* Main navigation */}
      <Navbar activeTab={subView ? 'importar' : activeTab} setActiveTab={handleTabChange} lang={lang} />

      {/* Primary content area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen pt-10 md:pt-8 bg-slate-950">
        {renderView()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </React.StrictMode>
  );
}
