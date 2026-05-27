import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { Globe, FolderOpen, Plus, Trash2, LogOut, User, Save, Palette } from 'lucide-react';

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
  setView,
  theme,
  setTheme
}) {
  const { user, logout, updateUserDisplayName } = useAuth();
  const [newProfileName, setNewProfileName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [nameSuccess, setNameSuccess] = useState('');
  const [error, setError] = useState('');

  const t = translations[lang].ajustes;
  const common = translations[lang].common;

  const THEMES = [
    { code: 'default', label: lang === 'es' ? 'Predeterminado (Slate)' : 'Default (Slate)' },
    { code: 'classic-dark', label: lang === 'es' ? 'Oscuro Clásico (#333)' : 'Classic Dark (#333)' },
    { code: 'light', label: lang === 'es' ? 'Blanco / Claro' : 'White / Light' },
    { code: 'emerald', label: lang === 'es' ? 'Bosque Esmeralda' : 'Emerald Forest' },
  ];

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
      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-6 rounded-3xl backdrop-blur-md">
        <span className="text-purple-400 text-xs font-bold uppercase tracking-widest font-outfit">Configuración</span>
        <h2 className="text-3xl font-extrabold text-[var(--text-title)] mt-1 font-outfit">{t.title}</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">{t.subtitle}</p>
      </div>

      {nameSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold text-center">
          {nameSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: User Profile, Language & Theme Selector */}
        <div className="space-y-6">
          {/* User Name Update */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[var(--text-title)] flex items-center gap-2 font-outfit">
              <User className="w-5 h-5 text-purple-400" />
              {lang === 'es' ? 'Perfil de Usuario' : 'User Profile'}
            </h3>

            <form onSubmit={handleUpdateName} className="space-y-3">
              <label className="block text-xs font-semibold text-[var(--text-muted)]">
                {lang === 'es' ? 'Tu Nombre de Pantalla' : 'Your Display Name'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={lang === 'es' ? 'Ingresa tu nombre...' : 'Enter your name...'}
                  className="w-full px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)]"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-xs font-bold shrink-0"
                >
                  <Save className="w-4 h-4" />
                  {common.save}
                </button>
              </div>
            </form>
          </div>

          {/* Preferences (Language & Theme Dropdowns) */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-5">
            {/* Language Selector Dropdown */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[var(--text-title)] flex items-center gap-2 font-outfit">
                <Globe className="w-4 h-4 text-purple-400" />
                {t.language}
              </h3>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] text-sm cursor-pointer bg-[var(--bg-input)]"
              >
                {LANGUAGES.map((langItem) => (
                  <option key={langItem.code} value={langItem.code} className="bg-[var(--bg-panel)] text-[var(--text-main)]">
                    {langItem.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Selector Dropdown */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[var(--text-title)] flex items-center gap-2 font-outfit">
                <Palette className="w-4 h-4 text-purple-400" />
                {lang === 'es' ? 'Tema de la Aplicación' : 'App Theme'}
              </h3>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] text-sm cursor-pointer bg-[var(--bg-input)]"
              >
                {THEMES.map((themeItem) => (
                  <option key={themeItem.code} value={themeItem.code} className="bg-[var(--bg-panel)] text-[var(--text-main)]">
                    {themeItem.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Profiles Management */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[var(--text-title)] flex items-center gap-2 font-outfit">
              <FolderOpen className="w-5 h-5 text-purple-400" />
              {t.profiles}
            </h3>

            <p className="text-[var(--text-muted)] text-xs leading-relaxed">
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
                  className="flex-1 px-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] placeholder:text-[var(--text-muted)] text-sm"
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
                        : 'bg-[var(--bg-input)] border border-[var(--border-color)] hover:bg-[var(--bg-panel-hover)] text-[var(--text-muted)]'
                    }`}
                  >
                    <button
                      onClick={() => onSelectProfile(profile)}
                      className="flex-1 text-left py-1 text-sm font-semibold truncate cursor-pointer text-[var(--text-main)]"
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

          {/* Routine Importer Entrance (Mobile only) */}
          <div className="md:hidden bg-gradient-to-r from-purple-950/20 to-indigo-950/20 border border-[var(--border-color)] rounded-3xl p-6 shadow-xl flex flex-col justify-between gap-4">
            <div>
              <h4 className="text-[var(--text-title)] font-bold text-base font-outfit">✨ ¿Buscas inspiración?</h4>
              <p className="text-[var(--text-muted)] text-xs mt-1">
                Puedes importar rutinas predefinidas o de la comunidad para agregarlas a tus perfiles.
              </p>
            </div>
            <button
              onClick={() => setView('importar')}
              className="w-full py-2.5 px-4 bg-[var(--bg-panel-hover)] text-purple-400 border border-purple-500/20 hover:border-purple-500/40 font-bold rounded-2xl text-xs transition tracking-wide cursor-pointer"
            >
              Explorar e Importar Rutinas
            </button>
          </div>

          {/* Mobile Logout */}
          <div className="md:hidden bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-5 shadow-xl">
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
