import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedDemo = localStorage.getItem('sht_demo_user');
    if (savedDemo) {
      setUser(JSON.parse(savedDemo));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    localStorage.removeItem('sht_demo_user');
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password, displayName) => {
    localStorage.removeItem('sht_demo_user');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    // Update local state copy
    setUser({ ...userCredential.user });
    return userCredential;
  };

  const loginWithGoogle = async () => {
    localStorage.removeItem('sht_demo_user');
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const loginDemo = () => {
    const demoUser = { uid: 'demo-user', email: 'demo@tracker.com', displayName: 'Usuario Demo', isDemo: true };
    setUser(demoUser);
    localStorage.setItem('sht_demo_user', JSON.stringify(demoUser));
  };

  const logout = async () => {
    localStorage.removeItem('sht_demo_user');
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("SignOut error ignored during mock/unconfigured environment.");
    }
    setUser(null);
  };

  const updateUserDisplayName = async (newName) => {
    if (user?.isDemo) {
      const updated = { ...user, displayName: newName };
      setUser(updated);
      localStorage.setItem('sht_demo_user', JSON.stringify(updated));
      return;
    }
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: newName });
      setUser({ ...auth.currentUser });
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    loginDemo,
    logout,
    updateUserDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
