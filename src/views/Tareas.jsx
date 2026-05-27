import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, RefreshCw, Plus, X, HelpCircle, Edit2 } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Tareas({ habits, onSaveDay, onQuickCreate, loading, lang = 'es', onEditClick, onAddClick }) {
  const [justifyingHabit, setJustifyingHabit] = useState(null);
  const [justificationNote, setJustificationNote] = useState('');
  const [sortBy, setSortBy] = useState('hora');

  useEffect(() => {
    if (justifyingHabit) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [justifyingHabit]);

  const t = translations[lang].tareas;
  const common = translations[lang].common;

  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayDateStr();
  const todayDayIndex = new Date().getDay();

  const todayHabits = habits.filter(habit => {
    return habit.dias.includes(todayDayIndex);
  });

  const importanceWeights = { alta: 3, media: 2, baja: 1 };

  const sortedHabits = [...todayHabits].sort((a, b) => {
    if (sortBy === 'importancia') {
      const weightA = importanceWeights[a.importancia || 'media'];
      const weightB = importanceWeights[b.importancia || 'media'];
      if (weightA !== weightB) {
        return weightB - weightA;
      }
    }
    const timeA = a.horaSugerida || '23:59';
    const timeB = b.horaSugerida || '23:59';
    return timeA.localeCompare(timeB);
  });

  const dateOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const rawDateText = new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ru' ? 'ru-RU' : lang === 'uk' ? 'uk-UA' : 'es-ES', dateOptions);
  const formattedDate = rawDateText.charAt(0).toUpperCase() + rawDateText.slice(1);

  const handleStatusChange = async (habitId, statusType) => {
    if (statusType === 'justificado') {
      setJustifyingHabit(habitId);
      setJustificationNote('');
      return;
    }

    let statusData = { completado: false, justificado: false, nota: '' };
    if (statusType === 'completado') {
      statusData = { completado: true, justificado: false, nota: '' };
    }
    await onSaveDay(habitId, todayStr, statusData);
  };

  const handleSaveJustification = async () => {
    if (!justifyingHabit) return;
    const statusData = {
      completado: false,
      justificado: true,
      nota: justificationNote.trim() || (lang === 'es' ? 'Justificado sin nota' : 'Justified without note')
    };
    await onSaveDay(justifyingHabit, todayStr, statusData);
    setJustifyingHabit(null);
    setJustificationNote('');
  };

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    await onQuickCreate(quickName.trim());
    setQuickName('');
    setShowQuickForm(false);
  };

  const totalToday = todayHabits.length;
  const completedToday = todayHabits.filter(h => h.history?.[todayStr]?.completado).length;
  const justifiedToday = todayHabits.filter(h => h.history?.[todayStr]?.justificado).length;
  const percentage = totalToday > 0 ? Math.round(((completedToday + justifiedToday) / totalToday) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-20 md:pb-0">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[var(--bg-panel)] border border-[var(--border-color)] p-4 sm:p-6 rounded-3xl backdrop-blur-md">
        <div>
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">{t.subtitle}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-title)] font-outfit mt-1">{formattedDate}</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {totalToday === 0 
              ? t.no_habits 
              : t.habits_scheduled.replace('{count}', totalToday)}
          </p>
        </div>
        
        {totalToday > 0 && (
          <div className="flex items-center gap-4 bg-[var(--bg-input)] px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-[var(--border-color)]">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all duration-500"
                  strokeDasharray={`${percentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="text-xs font-bold text-[var(--text-main)]">{percentage}%</span>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">{t.progress}</p>
              <p className="text-xs sm:text-sm font-bold text-[var(--text-main)]">{completedToday + justifiedToday} de {totalToday}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main List Section */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-3 sm:p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[var(--text-title)] flex items-center gap-2 font-outfit">
            {lang === 'es' ? 'Hábitos de Hoy' : lang === 'en' ? "Today's Habits" : t.subtitle}
          </h3>
          <button
            onClick={() => onAddClick && onAddClick()}
            className="flex items-center justify-center p-2.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white rounded-2xl transition duration-200 cursor-pointer shadow-md shadow-purple-600/10 shrink-0"
            title={lang === 'es' ? 'Crear Hábito' : 'Create Habit'}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Controls: Sort */}
        <div className="flex justify-start items-center pb-4 mb-4 border-b border-[var(--border-color)]/60 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px] mr-1">
              {lang === 'es' ? 'Ordenar por:' : 'Sort by:'}
            </span>
            <button
              onClick={() => setSortBy('hora')}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer flex items-center gap-1 ${
                sortBy === 'hora'
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-purple-500/20'
              }`}
            >
              ⏰ {lang === 'es' ? 'Hora' : 'Time'}
            </button>
            <button
              onClick={() => setSortBy('importancia')}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer flex items-center gap-1 ${
                sortBy === 'importancia'
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-purple-500/20'
              }`}
            >
              ⚡ {lang === 'es' ? 'Prioridad' : 'Priority'}
            </button>
          </div>
        </div>

        {/* Habits List */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : sortedHabits.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[var(--border-color)] rounded-2xl">
            <HelpCircle className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)] font-medium">{t.no_habits}</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {sortedHabits.map((habit) => {
              const record = habit.history?.[todayStr];
              const isCompleted = record?.completado;
              const isJustified = record?.justificado;
              const note = record?.nota;

              let statusColor = 'bg-[var(--bg-input)] border-[var(--border-color)]';
              let badgeText = t.pending;
              let badgeColor = 'text-[var(--text-muted)] bg-[var(--bg-panel-hover)] border-[var(--border-color)]';

              if (isCompleted) {
                statusColor = 'bg-emerald-950/20 border-emerald-500/30';
                badgeText = t.completed;
                badgeColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
              } else if (isJustified) {
                statusColor = 'bg-amber-950/20 border-amber-500/30';
                badgeText = t.justified;
                badgeColor = 'text-amber-400 bg-amber-950/40 border-amber-800/60';
              }

               return (
                <div
                  key={habit.id}
                  className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 border rounded-2xl transition-all duration-300 gap-3 sm:gap-4 ${statusColor}`}
                >
                  <button
                    onClick={() => onEditClick && onEditClick(habit)}
                    className="absolute top-2.5 right-2.5 p-1.5 text-[var(--text-muted)] hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition cursor-pointer z-10"
                    title={common.edit}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Habit Details */}
                  <div className="min-w-0 w-full sm:flex-1 pr-8 sm:pr-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs w-[100px] text-center py-0.5 rounded-full border font-semibold tracking-wider block shrink-0 ${badgeColor}`}>
                        {badgeText}
                      </span>
                      {habit.horaSugerida && (
                        <span className="text-[var(--text-muted)] text-xs font-semibold flex items-center gap-0.5">
                          ⏰ {habit.horaSugerida}
                        </span>
                      )}
                      
                      {/* Priority Badge */}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                        (habit.importancia || 'media') === 'alta'
                          ? 'text-rose-455 bg-rose-500/10 border-rose-500/20'
                          : (habit.importancia || 'media') === 'baja'
                          ? 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                          : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                      }`}>
                        {(habit.importancia || 'media') === 'alta'
                          ? (lang === 'es' ? 'Muy importante' : 'High')
                          : (habit.importancia || 'media') === 'baja'
                          ? (lang === 'es' ? 'Poco importante' : 'Low')
                          : (lang === 'es' ? 'Importante' : 'Medium')}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[var(--text-title)] mt-1.5 font-outfit break-words">
                      {habit.nombre}
                    </h4>
                    {isJustified && note && (
                      <p className="text-xs text-amber-400/90 mt-1 italic font-light bg-amber-500/5 px-2 py-1 rounded-lg inline-block border border-amber-500/10 break-all max-w-full">
                        {lang === 'es' ? 'Motivo' : 'Reason'}: "{note}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end w-full sm:w-auto shrink-0 border-t border-[var(--border-color)]/20 sm:border-0 pt-3 sm:pt-0">
                    {(isCompleted || isJustified) && (
                      <button
                        onClick={() => handleStatusChange(habit.id, 'pendiente')}
                        className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-panel-hover)] hover:bg-[var(--border-color)] rounded-xl transition cursor-pointer"
                      >
                        {t.reset}
                      </button>
                    )}

                    {!isJustified && (
                      <button
                        onClick={() => handleStatusChange(habit.id, 'justificado')}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isJustified 
                            ? 'bg-amber-500 text-slate-950 border-amber-500' 
                            : 'bg-[var(--bg-input)] hover:bg-[var(--bg-panel-hover)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-amber-400'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span className="inline">{t.justified}</span>
                      </button>
                    )}

                    {!isCompleted && (
                      <button
                        onClick={() => handleStatusChange(habit.id, 'completado')}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                            : 'bg-[var(--bg-input)] hover:bg-[var(--bg-panel-hover)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-emerald-450'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span className="inline">{t.completed}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Justification Modal */}
      {justifyingHabit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-[var(--text-title)] flex items-center gap-2 font-outfit">
                <AlertCircle className="w-5 h-5 text-amber-400" /> {t.justify_title}
              </h4>
              <button
                onClick={() => setJustifyingHabit(null)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-panel-hover)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-[var(--text-muted)] text-sm mb-4">
              {t.justify_desc}
            </p>

            <textarea
              rows="3"
              value={justificationNote}
              onChange={(e) => setJustificationNote(e.target.value)}
              placeholder={t.justify_placeholder}
              className="w-full p-4 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-amber-500 text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)] resize-none mb-6"
              maxLength="100"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setJustifyingHabit(null)}
                className="px-4 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)] font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                {common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveJustification}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-amber-500/10"
              >
                {t.save_reason}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
