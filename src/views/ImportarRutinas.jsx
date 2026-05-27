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
  const [searchQuery, setSearchQuery] = useState('');
  
  const [importTarget, setImportTarget] = useState('current');
  const [newProfileName, setNewProfileName] = useState('');
  const [importing, setImporting] = useState(false);
  
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [shareRoutineName, setShareRoutineName] = useState('');
  const [sharingError, setSharingError] = useState('');
  const [sharing, setSharing] = useState(false);

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

  useEffect(() => {
    if (selectedRoutine || isSharingModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedRoutine, isSharingModalOpen]);

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
          className="p-2.5 bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-hover)] border border-[var(--border-color)] rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-main)] transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest font-outfit">Librería</span>
          <h2 className="text-3xl font-extrabold text-[var(--text-title)] font-outfit">{t.title}</h2>
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
      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-[var(--text-title)] text-lg flex items-center gap-2 font-outfit">
            <Share2 className="w-5 h-5 text-purple-400" />
            {t.share_routine}
          </h3>
          <p className="text-[var(--text-muted)] text-xs max-w-xl">
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
      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-[var(--text-title)] flex items-center gap-2 font-outfit">
          <BookOpen className="w-5 h-5 text-purple-400" />
          {t.default_routines}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEFAULT_ROUTINES.map((routine) => (
            <div
              key={routine.id}
              className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                  {routine.autor}
                </span>
                <h4 className="font-bold text-[var(--text-title)] text-base font-outfit mt-1">{routine.nombre}</h4>
                <ul className="mt-3.5 space-y-1.5 text-xs text-[var(--text-muted)] font-light list-disc pl-4">
                  {routine.habitos.map((h, i) => (
                    <li key={i}>
                      <span className="font-medium text-[var(--text-main)]">{h.nombre}</span> ({h.horaSugerida})
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedRoutine(routine)}
                className="w-full mt-5 py-2 bg-[var(--bg-panel-hover)] text-purple-400 hover:text-purple-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-[var(--border-color)]"
              >
                <Import className="w-4 h-4" /> {t.import_btn}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Community Shared Routines */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
          <h3 className="text-lg font-bold text-[var(--text-title)] flex items-center gap-2 font-outfit">
            <Users className="w-5 h-5 text-purple-400" />
            {t.community_routines}
          </h3>
          <button 
            onClick={loadCommunity}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer text-right self-end sm:self-auto"
          >
            {lang === 'es' ? 'Actualizar' : 'Refresh'}
          </button>
        </div>

        {/* Search / Share Code Input */}
        <div className="w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'es' ? 'Buscar rutina por nombre, autor o código de compartir...' : 'Search routine by name, author or share code...'}
            className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)] font-outfit"
          />
        </div>

        {loadingCommunity ? (
          <p className="text-center py-10 text-[var(--text-muted)] text-sm">Cargando galería comunitaria...</p>
        ) : communityRoutines.length === 0 ? (
          <p className="text-center py-10 text-[var(--text-muted)] text-sm">No hay rutinas públicas todavía. ¡Sé el primero en compartir!</p>
        ) : (
          (() => {
            const filteredCommunity = communityRoutines.filter(routine => {
              if (!searchQuery.trim()) return true;
              const query = searchQuery.toLowerCase().trim();
              return (routine.nombre || '').toLowerCase().includes(query) || 
                     (routine.id || '').toLowerCase() === query || 
                     (routine.id || '').toLowerCase().includes(query) ||
                     (routine.autor || '').toLowerCase().includes(query);
            });

            if (filteredCommunity.length === 0) {
              return (
                <p className="text-center py-10 text-[var(--text-muted)] text-sm">
                  {lang === 'es' ? 'No se encontraron rutinas para esta búsqueda.' : 'No routines found for this search.'}
                </p>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredCommunity.map((routine) => (
                  <div
                    key={routine.id}
                    className="bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                        Por: {routine.autor}
                      </span>
                      <h4 className="font-bold text-[var(--text-title)] text-base font-outfit mt-1">{routine.nombre}</h4>
                      
                      {/* Copyable Share Code */}
                      <div 
                        onClick={() => {
                          navigator.clipboard.writeText(routine.id);
                          alert(lang === 'es' ? '¡Código copiado al portapapeles!' : 'Code copied to clipboard!');
                        }}
                        className="mt-1.5 text-[9px] font-mono text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-2 py-1 border border-purple-500/20 rounded w-fit cursor-pointer select-all font-semibold active:scale-95 transition"
                        title={lang === 'es' ? 'Haz clic para copiar el código' : 'Click to copy code'}
                      >
                        Code: {routine.id}
                      </div>

                      <ul className="mt-3.5 space-y-1.5 text-xs text-[var(--text-muted)] font-light list-disc pl-4">
                        {routine.habitos.map((h, i) => (
                          <li key={i}>
                            <span className="font-medium text-[var(--text-main)]">{h.nombre}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => setSelectedRoutine(routine)}
                      className="w-full mt-5 py-2 bg-[var(--bg-panel-hover)] text-purple-400 hover:text-purple-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-[var(--border-color)]"
                    >
                      <Import className="w-4 h-4" /> {t.import_btn}
                    </button>
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </div>

      {/* Share Routine Modal */}
      {isSharingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleShareSubmit}
            className="w-full max-w-md bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl animate-scaleIn space-y-5 max-h-[90vh] overflow-y-auto scrollbar-none"
          >
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-xl font-bold text-[var(--text-title)] font-outfit">
                {lang === 'es' ? 'Publicar Rutina' : 'Publish Routine'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSharingModalOpen(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-panel-hover)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[var(--text-muted)] text-sm">
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                {lang === 'es' ? 'Nombre de la Rutina' : 'Routine Name'}
              </label>
              <input
                type="text"
                required
                value={shareRoutineName}
                onChange={(e) => setShareRoutineName(e.target.value)}
                placeholder="Ej. Mi rutina de musculación, Enfoque Mañanero..."
                className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)]"
                maxLength="40"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setIsSharingModalOpen(false)}
                className="px-4 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)] font-semibold rounded-xl text-sm transition cursor-pointer"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl animate-scaleIn space-y-5 max-h-[90vh] overflow-y-auto scrollbar-none">
            <div className="flex justify-between items-center pb-2">
              <h3 className="text-xl font-bold text-[var(--text-title)] font-outfit">
                {t.import_modal_title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRoutine(null)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-panel-hover)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[var(--text-muted)] text-sm">
              {t.import_modal_desc}
            </p>

            <div className="space-y-3">
              {/* Current Profile */}
              <label className="flex items-center gap-3 p-3.5 bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-purple-500/40 rounded-2xl cursor-pointer transition select-none">
                <input
                  type="radio"
                  name="importTarget"
                  checked={importTarget === 'current'}
                  onChange={() => setImportTarget('current')}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div className="text-sm font-semibold text-[var(--text-main)]">
                  {t.current_profile.replace('{name}', activeProfile)}
                </div>
              </label>

              {/* New Profile */}
              <label className="flex flex-col gap-3 p-3.5 bg-[var(--bg-input)] border border-[var(--border-color)] hover:border-purple-500/40 rounded-2xl cursor-pointer transition select-none">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="importTarget"
                    checked={importTarget === 'new'}
                    onChange={() => setImportTarget('new')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div className="text-sm font-semibold text-[var(--text-main)]">
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
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] text-xs placeholder:text-[var(--text-muted)]"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => setSelectedRoutine(null)}
                className="px-4 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)] font-semibold rounded-xl text-sm transition cursor-pointer"
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
