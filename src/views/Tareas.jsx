import React, { useState } from 'react';
import { Check, AlertCircle, RefreshCw, Plus, X, HelpCircle } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Tareas({ habits, onSaveDay, onQuickCreate, loading, lang = 'es' }) {
  const [justifyingHabit, setJustifyingHabit] = useState(null);
  const [justificationNote, setJustificationNote] = useState('');
  const [quickName, setQuickName] = useState('');
  const [showQuickForm, setShowQuickForm] = useState(false);

  const t = translations[lang].tareas;
  const common = translations[lang].common;

  // Helper: Get today's YYYY-MM-DD
  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayDateStr();
  const todayDayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...

  // Filter habits scheduled for today
  const todayHabits = habits.filter(habit => {
    return habit.dias.includes(todayDayIndex);
  });

  // Format today's date beautifully
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

  // Calculate completion percentage for today
  const totalToday = todayHabits.length;
  const completedToday = todayHabits.filter(h => h.history?.[todayStr]?.completado).length;
  const justifiedToday = todayHabits.filter(h => h.history?.[todayStr]?.justificado).length;
  const percentage = totalToday > 0 ? Math.round(((completedToday + justifiedToday) / totalToday) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-0">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">{t.subtitle}</span>
          <h2 className="text-3xl font-extrabold text-white font-outfit mt-1">{formattedDate}</h2>
          <p className="text-slate-400 text-sm mt-1">
            {totalToday === 0 
              ? t.no_habits 
              : t.habits_scheduled.replace('{count}', totalToday)}
          </p>
        </div>
        
        {totalToday > 0 && (
          <div className="flex items-center gap-4 bg-slate-800/40 px-5 py-3 rounded-2xl border border-slate-700/50">
            <div className="relative w-12 h-12 flex items-center justify-center">
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
              <span className="text-xs font-bold text-slate-200">{percentage}%</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{t.progress}</p>
              <p className="text-sm font-bold text-slate-100">{completedToday + justifiedToday} de {totalToday}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main List Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {lang === 'es' ? 'Hábitos de Hoy' : lang === 'en' ? "Today's Habits" : t.subtitle}
          </h3>
          <button
            onClick={() => setShowQuickForm(!showQuickForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-semibold rounded-2xl transition duration-200 cursor-pointer shadow-md shadow-purple-600/10"
          >
            <Plus className="w-4 h-4" /> {t.new_quick}
          </button>
        </div>

        {/* Quick Add Inline Form */}
        {showQuickForm && (
          <form onSubmit={handleQuickSubmit} className="mb-6 p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl flex gap-3 animate-fadeIn">
            <input
              type="text"
              required
              placeholder={t.placeholder}
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:border-purple-500 text-slate-100 placeholder:text-slate-600 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition cursor-pointer"
            >
              {t.add}
            </button>
            <button
              type="button"
              onClick={() => setShowQuickForm(false)}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* Habits List */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : todayHabits.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
            <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">{t.no_habits}</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {todayHabits.map((habit) => {
              const record = habit.history?.[todayStr];
              const isCompleted = record?.completado;
              const isJustified = record?.justificado;
              const note = record?.nota;

              let statusColor = 'bg-slate-800/40 border-slate-700/50';
              let badgeText = t.pending;
              let badgeColor = 'text-slate-400 bg-slate-800/60 border-slate-700';

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
                  className={`flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-2xl transition-all duration-300 gap-4 ${statusColor}`}
                >
                  {/* Habit Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold tracking-wider ${badgeColor}`}>
                        {badgeText}
                      </span>
                      {habit.horaSugerida && (
                        <span className="text-slate-500 text-xs font-semibold">
                          ⏰ {habit.horaSugerida}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-white mt-1.5 font-outfit">
                      {habit.nombre}
                    </h4>
                    {isJustified && note && (
                      <p className="text-xs text-amber-400/90 mt-1 italic font-light bg-amber-500/5 px-2 py-1 rounded-lg inline-block border border-amber-500/10">
                        {lang === 'es' ? 'Motivo' : 'Reason'}: "{note}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Pendiente / Reset Action */}
                    {(isCompleted || isJustified) && (
                      <button
                        onClick={() => handleStatusChange(habit.id, 'pendiente')}
                        className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700/80 rounded-xl transition cursor-pointer"
                      >
                        {t.reset}
                      </button>
                    )}

                    {/* Justificado Action */}
                    {!isJustified && (
                      <button
                        onClick={() => handleStatusChange(habit.id, 'justificado')}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isJustified 
                            ? 'bg-amber-500 text-slate-950 border-amber-500' 
                            : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-amber-400'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.justified}</span>
                      </button>
                    )}

                    {/* Completado Action */}
                    {!isCompleted && (
                      <button
                        onClick={() => handleStatusChange(habit.id, 'completado')}
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                            : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-emerald-400'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.completed}</span>
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" /> {t.justify_title}
              </h4>
              <button
                onClick={() => setJustifyingHabit(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-slate-400 text-sm mb-4">
              {t.justify_desc}
            </p>

            <textarea
              rows="3"
              value={justificationNote}
              onChange={(e) => setJustificationNote(e.target.value)}
              placeholder={t.justify_placeholder}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:border-amber-500 text-slate-100 text-sm placeholder:text-slate-600 resize-none mb-6"
              maxLength="100"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setJustifyingHabit(null)}
                className="px-4 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-semibold rounded-xl text-sm transition cursor-pointer"
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
