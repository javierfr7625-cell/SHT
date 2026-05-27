import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { 
  getCommunityRoutines, 
  shareRoutineToCommunity, 
  createHabit 
} from '../db/habits';
import { ArrowLeft, BookOpen, Share2, Users, Import, Check, AlertCircle, Plus, X } from 'lucide-react';

const DEFAULT_ROUTINES = [
  {
    id: 'def-routine-1',
    autor: 'Predeterminada',
    nombre: 'Productividad Diaria',
    habitos: [
      { nombre: 'Planificar el día', dias: [0, 1, 2, 3, 4, 5, 6], horaSugerida: '08:00' },
      { nombre: 'Revisión y Limpieza Inbox', dias: [1, 2, 3, 4, 5], horaSugerida: '09:00' },
      { nombre: 'Revisión semanal', dias: [5], horaSugerida: '17:00' }
    ]
  },
  {
    id: 'def-routine-2',
    autor: 'Predeterminada',
    nombre: 'Fuerza & Cardio (Fitness)',
    habitos: [
      { nombre: 'Entrenamiento de Fuerza', dias: [1, 3, 5], horaSugerida: '18:30' },
      { nombre: 'Cardio ligero', dias: [2, 4], horaSugerida: '08:00' },
      { nombre: 'Sesión de Estiramientos', dias: [0, 1, 2, 3, 4, 5, 6], horaSugerida: '07:00' }
    ]
  },
  {
    id: 'def-routine-3',
    autor: 'Predeterminada',
    nombre: 'Mindfulness & Gratitud',
    habitos: [
      { nombre: 'Meditación matutina', dias: [0, 1, 2, 3, 4, 5, 6], horaSugerida: '07:30' },
      { nombre: 'Ejercicios de respiración profunda', dias: [1, 2, 3, 4, 5], horaSugerida: '14:00' },
      { nombre: 'Escribir diario de gratitud', dias: [0, 1, 2, 3, 4, 5, 6], horaSugerida: '22:30' }
    ]
  }
];

export default function ImportarRutinas({
  lang,
  setView,
  activeProfile,
  profiles,
  onAddProfile,
  onImportComplete,
  activeProfileHabits
}) {
  const { user } = useAuth();
  const [communityRoutines, setCommunityRoutines] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  
  // Import settings
  const [importTarget, setImportTarget] = useState('current');
  const [newProfileName, setNewProfileName] = useState('');
  const [importing, setImporting] = useState(false);
  
  // Share routine modal settings
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [shareRoutineName, setShareRoutineName] = useState('');
  const [sharingError, setSharingError] = useState('');
  const [sharing, setSharing] = useState(false);

  // Feedback notifications
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const t = translations[lang].importar;
  const common = translations[lang].common;

  const loadCommunity = async () => {
    setLoadingCommunity(true);
    try {
      const data = await getCommunityRoutines(user);
      setCommunityRoutines(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCommunity(false);
    }
  };

  useEffect(() => {
    loadCommunity();
  }, []);

  const openShareModal = () => {
    if (activeProfileHabits.length === 0) {
      setFeedbackError(lang === 'es' ? 'No puedes compartir un perfil que no tiene hábitos.' : 'Cannot share a profile with no habits.');
      return;
    }
    setShareRoutineName(activeProfile);
    setSharingError('');
    setIsSharingModalOpen(true);
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setSharingError('');
    const nameToPublish = shareRoutineName.trim();

    if (!nameToPublish) {
      setSharingError(lang === 'es' ? 'Por favor ingresa un nombre para la rutina.' : 'Please enter a name for the routine.');
      return;
    }

    // Validate that the routine name does not already exist in the community gallery (case-insensitive)
    const exists = communityRoutines.some(
      r => r.nombre.toLowerCase() === nameToPublish.toLowerCase()
    );

    if (exists) {
      setSharingError(
        lang === 'es' 
          ? 'Ya existe una rutina con ese nombre en la comunidad. Por favor, elige otro.' 
          : 'A community routine with that name already exists. Please choose a different name.'
      );
      return;
    }

    setSharing(true);
    try {
      await shareRoutineToCommunity(user, nameToPublish, activeProfileHabits);
      setFeedbackMsg(t.share_success);
      setIsSharingModalOpen(false);
      loadCommunity();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setSharingError(lang === 'es' ? 'Error al publicar la rutina.' : 'Error publishing routine.');
    } finally {
      setSharing(false);
    }
  };

  const handleImport = async () => {
    if (!selectedRoutine) return;
    setImporting(true);
    setFeedbackError('');

    try {
      let targetProfileName = activeProfile;

      if (importTarget === 'new') {
        const pName = newProfileName.trim();
        if (!pName) {
          setFeedbackError(lang === 'es' ? 'Introduce un nombre válido.' : 'Please enter a valid name.');
          setImporting(false);
          return;
        }
        if (profiles.some(p => p.toLowerCase() === pName.toLowerCase())) {
          setFeedbackError(lang === 'es' ? 'El perfil ya existe.' : 'Profile already exists.');
          setImporting(false);
          return;
        }
        await onAddProfile(pName);
        targetProfileName = pName;
      }

      for (const h of selectedRoutine.habitos) {
        await createHabit(user, h, targetProfileName);
      }

      setFeedbackMsg(t.import_success);
      setSelectedRoutine(null);
      setNewProfileName('');
      
      onImportComplete(targetProfileName);
      
      setTimeout(() => {
        setFeedbackMsg('');
        setView('tareas');
      }, 1500);

    } catch (e) {
      console.error(e);
      setFeedbackError(lang === 'es' ? 'Error al importar.' : 'Import error.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 md:pb-0 relative">
      {/* Header and Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('ajustes')}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest font-outfit">Librería</span>
          <h2 className="text-3xl font-extrabold text-white font-outfit">{t.title}</h2>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-sm font-bold text-center flex items-center justify-center gap-2 animate-fadeIn">
          <Check className="w-5 h-5" /> {feedbackMsg}
        </div>
      )}

      {feedbackError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm font-bold text-center flex items-center justify-center gap-2 animate-fadeIn">
          <AlertCircle className="w-5 h-5" /> {feedbackError}
        </div>
      )}

      {/* Share Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-white text-lg flex items-center gap-2 font-outfit">
            <Share2 className="w-5 h-5 text-purple-400" />
            {t.share_routine}
          </h3>
          <p className="text-slate-400 text-xs max-w-xl">
            {t.share_desc}
          </p>
        </div>
        <button
          onClick={openShareModal}
          className="w-full sm:w-auto px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs transition duration-200 cursor-pointer shadow-lg shadow-purple-600/10"
        >
          {t.share_btn} ("{activeProfile}")
        </button>
      </div>

      {/* Default Routines */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
          <BookOpen className="w-5 h-5 text-purple-400" />
          {t.default_routines}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEFAULT_ROUTINES.map((routine) => (
            <div
              key={routine.id}
              className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  {routine.autor}
                </span>
                <h4 className="font-bold text-white text-base font-outfit mt-1">{routine.nombre}</h4>
                <ul className="mt-3.5 space-y-1.5 text-xs text-slate-400 font-light list-disc pl-4">
                  {routine.habitos.map((h, i) => (
                    <li key={i}>
                      <span className="font-medium text-slate-200">{h.nombre}</span> ({h.horaSugerida})
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedRoutine(routine)}
                className="w-full mt-5 py-2 bg-slate-800 hover:bg-slate-700/80 text-purple-400 hover:text-purple-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/50"
              >
                <Import className="w-4 h-4" /> {t.import_btn}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Community Shared Routines */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
            <Users className="w-5 h-5 text-purple-400" />
            {t.community_routines}
          </h3>
          <button 
            onClick={loadCommunity}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
          >
            {lang === 'es' ? 'Actualizar' : 'Refresh'}
          </button>
        </div>

        {loadingCommunity ? (
          <p className="text-center py-10 text-slate-500 text-sm">Cargando galería comunitaria...</p>
        ) : communityRoutines.length === 0 ? (
          <p className="text-center py-10 text-slate-500 text-sm">No hay rutinas públicas todavía. ¡Sé el primero en compartir!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {communityRoutines.map((routine) => (
              <div
                key={routine.id}
                className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    Por: {routine.autor}
                  </span>
                  <h4 className="font-bold text-white text-base font-outfit mt-1">{routine.nombre}</h4>
                  <ul className="mt-3.5 space-y-1.5 text-xs text-slate-400 font-light list-disc pl-4">
                    {routine.habitos.map((h, i) => (
                      <li key={i}>
                        <span className="font-medium text-slate-200">{h.nombre}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setSelectedRoutine(routine)}
                  className="w-full mt-5 py-2 bg-slate-800 hover:bg-slate-700/80 text-purple-400 hover:text-purple-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/50"
                >
                  <Import className="w-4 h-4" /> {t.import_btn}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Routine Modal */}
      {isSharingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleShareSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-scaleIn space-y-5"
          >
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-xl font-bold text-white font-outfit">
                {lang === 'es' ? 'Publicar Rutina' : 'Publish Routine'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSharingModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400 text-sm">
              {lang === 'es' 
                ? 'Elige un nombre descriptivo único para tu rutina pública. Los demás usuarios la verán en la galería.'
                : 'Choose a unique descriptive name for your public routine. Other users will see it in the gallery.'}
            </p>

            {sharingError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{sharingError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {lang === 'es' ? 'Nombre de la Rutina' : 'Routine Name'}
              </label>
              <input
                type="text"
                required
                value={shareRoutineName}
                onChange={(e) => setShareRoutineName(e.target.value)}
                placeholder="Ej. Mi rutina de musculación, Enfoque Mañanero..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-purple-500 text-slate-100 text-sm placeholder:text-slate-600"
                maxLength="40"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsSharingModalOpen(false)}
                className="px-4 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                {common.cancel}
              </button>
              <button
                type="submit"
                disabled={sharing}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-purple-600/10 flex items-center gap-1.5 disabled:opacity-50"
              >
                {sharing ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    {lang === 'es' ? 'Publicar' : 'Publish'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import Modal */}
      {selectedRoutine && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-scaleIn space-y-5">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-xl font-bold text-white font-outfit">
                {t.import_modal_title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRoutine(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400 text-sm">
              {t.import_modal_desc}
            </p>

            <div className="space-y-3">
              {/* Current Profile */}
              <label className="flex items-center gap-3 p-3.5 bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 rounded-2xl cursor-pointer transition select-none">
                <input
                  type="radio"
                  name="importTarget"
                  checked={importTarget === 'current'}
                  onChange={() => setImportTarget('current')}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div className="text-sm font-semibold text-slate-200">
                  {t.current_profile.replace('{name}', activeProfile)}
                </div>
              </label>

              {/* New Profile */}
              <label className="flex flex-col gap-3 p-3.5 bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 rounded-2xl cursor-pointer transition select-none">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="importTarget"
                    checked={importTarget === 'new'}
                    onChange={() => setImportTarget('new')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div className="text-sm font-semibold text-slate-200">
                    {t.new_profile_option}
                  </div>
                </div>

                {importTarget === 'new' && (
                  <input
                    type="text"
                    required
                    placeholder={t.new_profile_name}
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-purple-500 text-slate-100 text-xs placeholder:text-slate-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setSelectedRoutine(null)}
                className="px-4 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                {common.cancel}
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={importing}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-purple-600/10 flex items-center gap-1.5 disabled:opacity-50"
              >
                {importing ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Import className="w-4 h-4" />
                    {t.import_btn}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
