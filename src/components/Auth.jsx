import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, CheckCircle, ArrowRight, UserPlus, LogIn, Sparkles, AlertCircle, BarChart3, Calendar, ShieldCheck, ArrowLeft } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Auth() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError('El nombre de usuario es obligatorio para registrarse.');
          setLoading(false);
          return;
        }
        await signup(email, password, displayName.trim());
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Credenciales inválidas. Por favor, compruébalas.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('El correo electrónico ya está registrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Inicio de sesión cancelado.');
      } else {
        setError('Error al autenticar. ¿Habilitaste Correo/Google en la consola de Firebase?');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Ventana de acceso con Google cerrada por el usuario.');
      } else {
        setError('Error al iniciar sesión con Google. Revisa la consola de Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- LANDING SCREEN COMPONENT ---
  if (showLanding) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

        {/* Logo / Header */}
        <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-200">
              SIMPLE HABIT TRACKER
            </span>
          </div>
          <button
            onClick={() => { setShowLanding(false); setIsLogin(true); }}
            className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            Iniciar Sesión
          </button>
        </header>

        {/* Hero Section */}
        <main className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 py-12 relative z-10 my-auto">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <span className="inline-flex px-3 py-1 bg-purple-500/10 border border-purple-500/25 rounded-full text-xs font-bold text-purple-400 tracking-wide uppercase">
              100% Minimalista y Eficiente
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight font-outfit">
              Construye una mejor versión de ti,{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400">
                un hábito a la vez.
              </span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              Define rutinas, monitoriza tus compromisos cotidianos, analiza tus rachas y visualiza tu constancia con un elegante calendario de contribuciones anuales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={() => { setShowLanding(false); setIsLogin(false); }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/25"
              >
                Comenzar Ahora <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setShowLanding(false); setIsLogin(true); }}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-2xl transition cursor-pointer"
              >
                Tengo una cuenta
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-3 hover:border-slate-800 transition duration-300">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 w-fit">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg font-outfit">Hábitos Flexibles</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Programa tareas para días laborables, toda la semana o configura calendarios personalizados especificando horas sugeridas.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-3 hover:border-slate-800 transition duration-300">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 w-fit">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg font-outfit">Análisis de Rachas</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Calcula automáticamente tus rachas actuales, máximas históricas y porcentajes de constancia a través de gráficos informativos.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-3 hover:border-slate-800 transition duration-300 col-span-1 sm:col-span-2">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold text-lg font-outfit">Aislamiento por Perfiles</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Crea diferentes perfiles para separar tus rutinas (ej. Gimnasio, Vacaciones, Trabajo). Cada perfil mantiene hábitos y progresos completamente independientes.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto w-full py-4 border-t border-slate-900 text-center text-xs text-slate-600 relative z-10">
          &copy; {new Date().getFullYear()} Simple Habit Tracker. Todos los derechos reservados.
        </footer>
      </div>
    );
  }

  // --- STANDARD AUTHENTICATION CARD ---
  return (
    <div className="min-height-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* Back to landing */}
        <button
          onClick={() => { setShowLanding(true); setError(''); }}
          className="absolute top-6 left-6 text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="inline-flex p-3 bg-purple-500/10 rounded-2xl text-purple-400 mb-4 border border-purple-500/20">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-outfit">
            Simple Habit Tracker
          </h1>
          <p className="text-slate-400 text-sm">
            {isLogin ? 'Bienvenido de nuevo. Sigue mejorando hoy.' : 'Comienza a monitorizar tus hábitos de forma simple.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Nombre Completo / Apodo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu Nombre"
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/40 border border-slate-700 rounded-2xl focus:outline-none focus:border-purple-500 text-slate-100 transition-colors placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/40 border border-slate-700 rounded-2xl focus:outline-none focus:border-purple-500 text-slate-100 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/40 border border-slate-700 rounded-2xl focus:outline-none focus:border-purple-500 text-slate-100 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-2xl transition duration-300 transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : isLogin ? (
              <>
                Iniciar Sesión <LogIn className="w-5 h-5" />
              </>
            ) : (
              <>
                Registrarse <UserPlus className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3 text-slate-500">O también</span>
          </div>
        </div>

        <div>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-2xl transition duration-300 flex items-center justify-center gap-3 cursor-pointer shadow active:scale-95 disabled:opacity-50"
          >
            <GoogleIcon />
            Iniciar sesión con Google
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium cursor-pointer"
          >
            {isLogin ? '¿No tienes cuenta? Registrate gratis' : '¿Ya tienes una cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
