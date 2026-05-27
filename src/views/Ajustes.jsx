import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { Globe, FolderOpen, Plus, Trash2, LogOut, Check, User, Save, Sparkles } from 'lucide-react';

const LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'uk', label: 'Українська' },
];

export default function Ajustes({
  lang,
  setLang,
  activeProfile,
  onSelectProfile,
  profiles,
  onAddProfile,
  onDeleteProfile,
  setView
}) {
  const { user, logout, updateUserDisplayName } = useAuth();
  const [newProfileName, setNewProfileName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');
  const [error, setError] = useState('');

  const t = translations[lang].ajustes;
  const common = translations[lang].common;

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  const handleCreateProfile = (e) => {
    e.preventDefault();
    setError('');
    const name = newProfileName.trim();
    if (!name) return;

    if (profiles.some(p => p.toLowerCase() === name.toLowerCase())) {
      setError(lang === 'es' ? 'El perfil ya existe.' : 'Profile already exists.');
      return;
    }

    onAddProfile(name);
    setNewProfileName('');
  };

  const handleDelete = (profileName) => {
    if (profileName === 'Principal') {
      alert(t.cannot_delete_main);
      return;
    }

    const confirmMsg = lang === 'es' 
      ? `¿Estás seguro de que deseas eliminar el perfil "${profileName}" y TODOS sus hábitos? Esta acción es irreversible.`
      : `Are you sure you want to delete profile "${profileName}" and ALL of its habits? This cannot be undone.`;

    if (window.confirm(confirmMsg)) {
      onDeleteProfile(profileName);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameSuccess('');
    if (!displayName.trim()) return;
    try {
      await updateUserDisplayName(displayName.trim());
      setNameSuccess(lang === 'es' ? 'Nombre actualizado correctamente' : 'Name updated successfully');
      setTimeout(() => setNameSuccess(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 md:pb-0">
      {/* Header */}
      <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <span className="text-purple-400 text-xs font-bold uppercase tracking-widest font-outfit">Configuración</span>
        <h2 className="text-3xl font-extrabold text-white mt-1 font-outfit">{t.title}</h2>
        <p className="text-slate-400 text-sm mt-1">{t.subtitle}</p>
      </div>

      {nameSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold text-center">
          {nameSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Profile Name & Language Selector */}
        <div className="space-y-6">
          {/* User Name Update */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
              <User className="w-5 h-5 text-purple-400" />
              {lang === 'es' ? 'Perfil de Usuario' : 'User Profile'}
            </h3>

            <form onSubmit={handleUpdateName} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-400">
                {lang === 'es' ? 'Tu Nombre de Pantalla' : 'Your Display Name'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={lang === 'es' ? 'Ingresa tu nombre...' : 'Enter your name...'}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-purple-500 text-slate-100 text-sm placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl transition flex items-center gap-1.5 cursor-pointer active:scale-95 text-xs font-bold"
                >
                  <Save className="w-4 h-4" />
                  {common.save}
                </button>
              </div>
            </form>
          </div>

          {/* Language Selector */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
              <Globe className="w-5 h-5 text-purple-400" />
              {t.language}
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {LANGUAGES.map((langItem) => {
                const isSelected = lang === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    onClick={() => setLang(langItem.code)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition duration-200 text-sm font-medium cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 text-purple-400 font-bold'
                        : 'bg-slate-950/20 border-slate-800 hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{langItem.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Profiles Management */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
              <FolderOpen className="w-5 h-5 text-purple-400" />
              {t.profiles}
            </h3>

            <p className="text-slate-400 text-xs leading-relaxed">
              {t.profiles_desc}
            </p>

            <form onSubmit={handleCreateProfile} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={t.new_profile}
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-purple-500 text-slate-100 placeholder:text-slate-600 text-sm"
                  maxLength="20"
                />
                <button
                  type="submit"
                  className="px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl transition flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {error && <p className="text-rose-400 text-xs">{error}</p>}
            </form>

            <div className="space-y-2 pt-2">
              {profiles.map((profile) => {
                const isActive = profile === activeProfile;
                return (
                  <div
                    key={profile}
                    className={`flex items-center justify-between p-3 border rounded-2xl transition duration-200 ${
                      isActive
                        ? 'bg-purple-500/10 border-purple-500/40 text-purple-400 font-bold'
                        : 'bg-slate-950/20 border-slate-800 hover:bg-slate-800/20 text-slate-400'
                    }`}
                  >
                    <button
                      onClick={() => onSelectProfile(profile)}
                      className="flex-1 text-left py-1 text-sm font-semibold truncate cursor-pointer"
                    >
                      {profile} {isActive && '✓'}
                    </button>
                    {profile !== 'Principal' && (
                      <button
                        onClick={() => handleDelete(profile)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                        title={common.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Routine Importer Entrance (Only visible on mobile inside Settings) */}
          <div className="md:hidden bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-purple-500/15 rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4">
            <div>
              <h4 className="text-white font-bold text-base font-outfit">✨ ¿Buscas inspiración?</h4>
              <p className="text-slate-400 text-xs mt-1">
                Puedes importar rutinas predefinidas o explorar rutinas creadas por otros usuarios en la comunidad para agregarlas a tus perfiles.
              </p>
            </div>
            <button
              onClick={() => setView('importar')}
              className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-purple-400 border border-purple-500/20 hover:border-purple-500/40 font-bold rounded-2xl text-xs transition tracking-wide cursor-pointer"
            >
              Explorar e Importar Rutinas
            </button>
          </div>

          {/* Mobile Logout */}
          <div className="md:hidden bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <button
              onClick={logout}
              className="w-full py-3.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold rounded-2xl text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              {t.logout}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
