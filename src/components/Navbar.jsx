import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, ListTodo, LayoutGrid, BarChart3, Settings, LogOut, User, Sparkles } from 'lucide-react';
import Logo from './Logo';
import { translations } from '../utils/translations';

export default function Navbar({ activeTab, setActiveTab, lang = 'es' }) {
  const { user, logout } = useAuth();
  const t = translations[lang].nav;

  const navItems = [
    { id: 'tareas', label: t.tareas, icon: Calendar },
    { id: 'gestionar', label: t.gestionar, icon: ListTodo },
    { id: 'resumen', label: t.resumen, icon: LayoutGrid },
    { id: 'analizar', label: t.analizar, icon: BarChart3 },
    { id: 'ajustes', label: t.ajustes, icon: Settings },
  ];

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--bg-panel)] border-r border-[var(--border-color)] h-screen sticky top-0 p-6 justify-between shrink-0 transition-colors duration-200">
        <div className="space-y-6">
          {/* App Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white shadow-md shadow-purple-600/20">
              <Logo className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-200">
              GOHABITS
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-400 border-l-4 border-purple-500 pl-3'
                      : 'text-[var(--text-muted)] hover:bg-[var(--bg-panel-hover)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-[var(--text-muted)]'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Inspiration Card in Desktop Sidebar */}
          <div className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl p-4.5 space-y-2 pt-4">
            <h4 className="text-[var(--text-title)] font-bold text-xs flex items-center gap-1.5 font-outfit uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              ¿Inspiración?
            </h4>
            <p className="text-[var(--text-muted)] text-[10px] leading-relaxed">
              {lang === 'es' ? 'Importa rutinas de la comunidad.' : 'Import routines from the community.'}
            </p>
            <button
              onClick={() => setActiveTab('importar')}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer active:scale-95"
            >
              {lang === 'es' ? 'Explorar' : 'Explore'}
            </button>
          </div>
        </div>

        {/* User profile & logout */}
        <div className="border-t border-[var(--border-color)] pt-6 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-purple-400 border border-[var(--border-color)]">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-[var(--text-title)] truncate">
                {user?.displayName || 'Usuario'}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Bottom Bar Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-panel)] border-t border-[var(--border-color)] px-3 py-2 flex justify-around items-center z-50 shadow-2xl transition-colors duration-200">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-xl transition-all duration-200 relative cursor-pointer ${
                isActive ? 'text-purple-400 font-semibold scale-110' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] tracking-wide font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 bg-purple-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
