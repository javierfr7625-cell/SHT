import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, UserPlus, LogIn, Sparkles, AlertCircle, BarChart3, Calendar, ShieldCheck, ArrowLeft, Globe } from 'lucide-react';
import Logo from './Logo';
import { translations } from '../utils/translations';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LANDING_TRANSLATIONS = {
  es: {
    tagline: "100% Minimalista y Eficiente",
    hero_title: "Construye una mejor versión de ti,",
    hero_title_span: "un hábito a la vez.",
    hero_desc: "Define rutinas, monitoriza tus compromisos cotidianos, analiza tus rachas y visualiza tu constancia con un elegante calendario de contribuciones anuales.",
    start: "Comenzar Ahora",
    have_account: "Tengo una cuenta",
    feat1_title: "Hábitos Flexibles",
    feat1_desc: "Programa tareas para días laborables, toda la semana o configura calendarios personalizados especificando horas sugeridas.",
    feat2_title: "Análisis de Rachas",
    feat2_desc: "Calcula automáticamente tus rachas actuales, máximas históricas y porcentajes de constancia a través de gráficos informativos.",
    feat3_title: "Aislamiento por Perfiles",
    feat3_desc: "Crea diferentes perfiles para separar tus rutinas (ej. Gimnasio, Vacaciones, Trabajo). Cada perfil mantiene hábitos y progresos completamente independientes.",
    back: "Volver",
    nickname: "Nombre Completo / Apodo",
    your_name: "Tu Nombre",
    or_also: "O también",
    google_btn: "Iniciar sesión con Google",
    error_username: "El nombre de usuario es obligatorio para registrarse.",
    error_credentials: "Credenciales inválidas. Por favor, compruébalas.",
    error_email_in_use: "El correo electrónico ya está registrado.",
    error_weak_pass: "La contraseña debe tener al menos 6 caracteres.",
    error_cancel: "Inicio de sesión cancelado.",
    error_generic: "Error al autenticar. ¿Habilitaste Correo/Google en la consola de Firebase?",
    error_domain: "Dominio no autorizado. Debes agregar tu dominio de Vercel en la consola de Firebase."
  },
  en: {
    tagline: "100% Minimalist and Efficient",
    hero_title: "Build a better version of yourself,",
    hero_title_span: "one habit at a time.",
    hero_desc: "Define routines, monitor daily commitments, analyze streaks, and visualize consistency with an elegant annual contributions calendar.",
    start: "Get Started Now",
    have_account: "I have an account",
    feat1_title: "Flexible Habits",
    feat1_desc: "Schedule tasks for weekdays, the entire week, or configure custom calendars specifying suggested times.",
    feat2_title: "Streak Analysis",
    feat2_desc: "Automatically calculate current streaks, historical records, and consistency percentages via informative charts.",
    feat3_title: "Profile Isolation",
    feat3_desc: "Create different profiles to separate routines (e.g. Gym, Vacation, Work). Each profile maintains completely independent habits and progress.",
    back: "Back",
    nickname: "Full Name / Nickname",
    your_name: "Your Name",
    or_also: "Or also",
    google_btn: "Sign in with Google",
    error_username: "Username is required to register.",
    error_credentials: "Invalid credentials. Please double-check them.",
    error_email_in_use: "Email is already registered.",
    error_weak_pass: "Password must be at least 6 characters.",
    error_cancel: "Login cancelled.",
    error_generic: "Error authenticating. Did you enable Email/Google in Firebase console?",
    error_domain: "Unauthorized domain. You must add your Vercel domain in Firebase console."
  },
  fr: {
    tagline: "100% Minimaliste et Efficace",
    hero_title: "Devenez une meilleure version de vous,",
    hero_title_span: "une habitude à la fois.",
    hero_desc: "Définissez des routines, suivez vos engagements quotidiens, analysez vos séries et visualisez votre constance avec un calendrier annuel élégant.",
    start: "Commencer Maintenant",
    have_account: "J'ai un compte",
    feat1_title: "Habitudes Flexibles",
    feat1_desc: "Planifiez des tâches pour les jours ouvrables, toute la semaine ou configurez des calendriers personnalisés.",
    feat2_title: "Analyse des Séries",
    feat2_desc: "Calculez automatiquement vos séries actuelles, records historiques et pourcentages de constance via des graphiques.",
    feat3_title: "Isolation par Profils",
    feat3_desc: "Créez différents profils pour séparer vos routines (ex. Sport, Vacances, Travail) avec un suivi indépendant.",
    back: "Retour",
    nickname: "Nom Complet / Pseudo",
    your_name: "Votre Nom",
    or_also: "Ou également",
    google_btn: "Se connecter avec Google",
    error_username: "Le nom d'utilisateur est requis pour s'inscrire.",
    error_credentials: "Identifiants invalides. Veuillez les vérifier.",
    error_email_in_use: "L'e-mail est déjà enregistré.",
    error_weak_pass: "Le mot de passe doit comporter au moins 6 caractères.",
    error_cancel: "Connexion annulée.",
    error_generic: "Erreur d'authentification. Avez-vous activé E-mail/Google dans Firebase ?",
    error_domain: "Domaine non autorisé. Veuillez ajouter votre domaine Vercel dans Firebase."
  },
  it: {
    tagline: "100% Minimalista ed Efficiente",
    hero_title: "Costruisci una versione migliore di te,",
    hero_title_span: "un'abitudine alla volta.",
    hero_desc: "Definisci routine, monitora gli impegni quotidiani, analizza le serie e visualizza la costanza con un elegante calendario annuale.",
    start: "Inizia Ora",
    have_account: "Ho un account",
    feat1_title: "Abitudini Flessibili",
    feat1_desc: "Pianifica le attività per i giorni feriali, l'intera settimana o configura calendari personalizzati.",
    feat2_title: "Analisi delle Serie",
    feat2_desc: "Calcola automaticamente le serie attuali, i record storici e le percentuali di costanza tramite grafici.",
    feat3_title: "Isolamento per Profili",
    feat3_desc: "Crea profili diversi per separare le routine (es. Palestra, Vacanze, Lavoro) con progressi indipendenti.",
    back: "Indietro",
    nickname: "Nome Completo / Soprannome",
    your_name: "Il Tuo Nome",
    or_also: "Oppure",
    google_btn: "Accedi con Google",
    error_username: "Il nome utente è richiesto per registrarsi.",
    error_credentials: "Credenziali non valide. Per favore controllale.",
    error_email_in_use: "L'e-mail è già registrata.",
    error_weak_pass: "La password deve contenere almeno 6 caratteri.",
    error_cancel: "Accesso annullato.",
    error_generic: "Errore di autenticazione. Hai abilitato E-mail/Google su Firebase?",
    error_domain: "Dominio non autorizzato. Aggiungi il tuo dominio Vercel su Firebase."
  },
  ru: {
    tagline: "100% Минималистично и Эффективно",
    hero_title: "Становитесь лучшей версией себя,",
    hero_title_span: "по одной привычке за раз.",
    hero_desc: "Создавайте рутины, отслеживайте ежедневные задачи, анализируйте серии и визуализируйте стабильность с помощью годового календаря.",
    start: "Начать Сейчас",
    have_account: "У меня есть аккаунт",
    feat1_title: "Гибкие Привычки",
    feat1_desc: "Планируйте задачи на рабочие дни, всю неделю или настраивайте расписание с указанием времени.",
    feat2_title: "Анализ Серий",
    feat2_desc: "Автоматически рассчитывайте текущие и максимальные серии, а также процент стабильности с помощью графиков.",
    feat3_title: "Разделение по Профилям",
    feat3_desc: "Создавайте профили для разделения рутин (напр., Спорт, Отпуск, Работа) с независимым прогрессом.",
    back: "Назад",
    nickname: "Полное имя / Никнейм",
    your_name: "Ваше Имя",
    or_also: "Или также",
    google_btn: "Войти через Google",
    error_username: "Имя пользователя обязательно для регистрации.",
    error_credentials: "Неверные учетные данные. Пожалуйста, проверьте их.",
    error_email_in_use: "Этот адрес электронной почты уже зарегистрирован.",
    error_weak_pass: "Пароль должен состоять минимум из 6 символов.",
    error_cancel: "Вход отменен.",
    error_generic: "Ошибка аутентификации. Вы включили Email/Google в консоли Firebase?",
    error_domain: "Неавторизованный домен. Добавьте ваш домен Vercel в консоли Firebase."
  },
  zh: {
    tagline: "100% 极简与高效",
    hero_title: "一次一个习惯，",
    hero_title_span: "塑造更好的自己。",
    hero_desc: "规划日常、跟踪每日承诺、分析连续天数，并通过优雅的年度贡献日历直观呈现您的坚持。",
    start: "立即开始",
    have_account: "我已有账号",
    feat1_title: "弹性习惯",
    feat1_desc: "为工作日、整周安排任务，或自定义日程并指定建议时间。",
    feat2_title: "连续天数分析",
    feat2_desc: "通过直观的图表自动计算当前连续天数、历史最高纪录以及整体坚持百分比。",
    feat3_title: "独立配置文件",
    feat3_desc: "创建不同的配置文件以区分日程（例如：健身、度假、工作）。每个配置文件独立维护习惯与进度。",
    back: "返回",
    nickname: "全名 / 昵称",
    your_name: "您的姓名",
    or_also: "或者使用",
    google_btn: "使用 Google 登录",
    error_username: "注册必须填写用户名。",
    error_credentials: "凭据无效。请检查您的凭据。",
    error_email_in_use: "该邮箱已被注册。",
    error_weak_pass: "密码必须至少为 6 位字符。",
    error_cancel: "登录已取消。",
    error_generic: "认证错误。您是否在 Firebase 控制台中启用了邮箱/Google？",
    error_domain: "未授权的域名。您必须在 Firebase 控制台中添加您的 Vercel 域名。"
  },
  uk: {
    tagline: "100% Мінімалістично та Ефективно",
    hero_title: "Ставайте кращою версією себе,",
    hero_title_span: "по одній звичці за раз.",
    hero_desc: "Створюйте рутини, відстежуйте щоденні завдання, аналізуйте серії та візуалізуйте стабільність за допомогою річного календаря.",
    start: "Розпочати Зараз",
    have_account: "Я маю акаунт",
    feat1_title: "Гнучкі Звички",
    feat1_desc: "Плануйте завдання на робочі дні, весь тиждень або налаштовуйте розклад із зазначенням часу.",
    feat2_title: "Аналіз Серій",
    feat2_desc: "Автоматично розраховуйте поточні та максимальні серії, а також відсоток стабільності за допомогою графіків.",
    feat3_title: "Розподіл за Профілями",
    feat3_desc: "Створюйте профілі для розділення рутин (напр., Спорт, Відпустка, Робота) із незалежним прогресом.",
    back: "Назад",
    nickname: "Повне ім'я / Нікнейм",
    your_name: "Ваше Ім'я",
    or_also: "Або також",
    google_btn: "Увійти через Google",
    error_username: "Ім'я користувача є обов'язковим для реєстрації.",
    error_credentials: "Невірні облікові дані. Будь ласка, перевірте їх.",
    error_email_in_use: "Ця електронна адреса вже зареєстрована.",
    error_weak_pass: "Пароль має містити щонайменше 6 символів.",
    error_cancel: "Вхід скасовано.",
    error_generic: "Помилка автентифікації. Ви увімкнули Email/Google в консолі Firebase?",
    error_domain: "Неавторизований домен. Додайте ваш домен Vercel в консолі Firebase."
  }
};

export default function Auth({ lang = 'es', setLang }) {
  const [showLanding, setShowLanding] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, loginWithGoogle } = useAuth();
  
  const lt = LANDING_TRANSLATIONS[lang] || LANDING_TRANSLATIONS['es'];
  const t = translations[lang].auth;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorDetails('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError(lt.error_username);
          setLoading(false);
          return;
        }
        await signup(email, password, displayName.trim());
      }
    } catch (err) {
      console.error(err);
      setErrorDetails(err.message || '');
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError(lt.error_credentials);
      } else if (err.code === 'auth/email-already-in-use') {
        setError(lt.error_email_in_use);
      } else if (err.code === 'auth/weak-password') {
        setError(lt.error_weak_pass);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError(lt.error_cancel);
      } else {
        setError(lt.error_generic);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setErrorDetails('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      setErrorDetails(err.message || '');
      if (err.code === 'auth/popup-closed-by-user') {
        setError(lt.error_cancel);
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(lt.error_domain);
      } else {
        setError(lt.error_generic);
      }
    } finally {
      setLoading(false);
    }
  };

  const LANGUAGES = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
    { code: 'ru', label: 'Русский' },
    { code: 'zh', label: '中文' },
    { code: 'uk', label: 'Українська' },
  ];

  const LanguageSelector = () => (
    <div className="flex items-center gap-1.5 bg-[var(--bg-panel)] border border-[var(--border-color)] px-2.5 py-1.5 rounded-2xl">
      <Globe className="w-3.5 h-3.5 text-purple-400" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="bg-transparent text-xs text-[var(--text-main)] focus:outline-none cursor-pointer font-semibold"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="bg-[var(--bg-panel)] text-[var(--text-main)]">
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );

  // --- LANDING SCREEN COMPONENT ---
  if (showLanding) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col justify-between p-6 relative overflow-hidden transition-colors duration-200">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

        {/* Logo / Header */}
        <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl text-white">
              <Logo className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-200">
              GOHABITS
            </span>
          </div>
          
          <div className="flex items-center">
            <LanguageSelector />
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 py-12 relative z-10 my-auto">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <span className="inline-flex px-3 py-1 bg-purple-500/10 border border-purple-500/25 rounded-full text-xs font-bold text-purple-400 tracking-wide uppercase">
              {lt.tagline}
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-[var(--text-title)] leading-tight font-outfit">
              {lt.hero_title}{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400">
                {lt.hero_title_span}
              </span>
            </h1>
            <p className="text-[var(--text-muted)] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
              {lt.hero_desc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={() => { setShowLanding(false); setIsLogin(false); }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/25 text-sm"
              >
                {lt.start} <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setShowLanding(false); setIsLogin(true); }}
                className="px-8 py-4 bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-hover)] border border-[var(--border-color)] hover:border-slate-700 text-[var(--text-main)] font-bold rounded-2xl transition cursor-pointer text-sm"
              >
                {t.login}
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-6 rounded-3xl space-y-3 hover:border-purple-500/20 transition duration-300">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 w-fit">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-[var(--text-title)] font-bold text-lg font-outfit">{lt.feat1_title}</h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed font-light">
                {lt.feat1_desc}
              </p>
            </div>

            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-6 rounded-3xl space-y-3 hover:border-purple-500/20 transition duration-300">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 w-fit">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-[var(--text-title)] font-bold text-lg font-outfit">{lt.feat2_title}</h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed font-light">
                {lt.feat2_desc}
              </p>
            </div>

            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-6 rounded-3xl space-y-3 hover:border-purple-500/20 transition duration-300 col-span-1 sm:col-span-2">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-[var(--text-title)] font-bold text-lg font-outfit">{lt.feat3_title}</h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed font-light">
                {lt.feat3_desc}
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto w-full py-4 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] relative z-10">
          &copy; {new Date().getFullYear()} GoHabits.
        </footer>
      </div>
    );
  }

  // --- STANDARD AUTHENTICATION CARD ---
  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-[var(--bg-main)] text-[var(--text-main)] relative overflow-hidden transition-colors duration-200">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-md bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border-color)] rounded-3xl p-5 sm:p-8 shadow-2xl relative z-10">
        
        {/* Back to landing */}
        <div className="absolute top-6 left-6">
          <button
            onClick={() => { setShowLanding(true); setError(''); setErrorDetails(''); }}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> {lt.back}
          </button>
        </div>

        <div className="text-center mb-8 mt-6">
          <div className="inline-flex p-3 bg-purple-500/10 rounded-2xl text-purple-400 mb-4 border border-purple-500/20">
            <Logo className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-title)] mb-2 font-outfit">
            GoHabits
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            {isLogin ? t.welcome_back : t.welcome_new}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm text-center flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            {errorDetails && <p className="text-[10px] text-rose-500/80 mt-1">{errorDetails}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                {lt.nickname}
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
                  placeholder={lt.your_name}
                  className="w-full pl-11 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] transition-colors placeholder:text-[var(--text-muted)] text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              {t.email}
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
                className="w-full pl-11 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] transition-colors placeholder:text-[var(--text-muted)] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              {t.password}
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
                className="w-full pl-11 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] transition-colors placeholder:text-[var(--text-muted)] text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition duration-300 transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 mt-6 cursor-pointer text-sm"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : isLogin ? (
              <>
                {t.login} <LogIn className="w-5 h-5" />
              </>
            ) : (
              <>
                {t.signup} <UserPlus className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border-color)]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[var(--bg-panel)] px-3 text-[var(--text-muted)] font-medium">{lt.or_also}</span>
          </div>
        </div>

        <div>
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl transition duration-300 flex items-center justify-center gap-3 cursor-pointer shadow active:scale-95 disabled:opacity-50 text-sm"
          >
            <GoogleIcon />
            {lt.google_btn}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium cursor-pointer"
          >
            {isLogin ? t.no_account : t.has_account}
          </button>
        </div>
      </div>
    </div>
  );
}
