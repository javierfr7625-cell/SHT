import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, Check, X } from 'lucide-react';
import { translations } from '../utils/translations';

const WEEKDAYS = {
  es: [
    { name: 'Lun', index: 1 }, { name: 'Mar', index: 2 }, { name: 'Mié', index: 3 },
    { name: 'Jue', index: 4 }, { name: 'Vie', index: 5 }, { name: 'Sáb', index: 6 }, { name: 'Dom', index: 0 }
  ],
  en: [
    { name: 'Mon', index: 1 }, { name: 'Tue', index: 2 }, { name: 'Wed', index: 3 },
    { name: 'Thu', index: 4 }, { name: 'Fri', index: 5 }, { name: 'Sat', index: 6 }, { name: 'Sun', index: 0 }
  ],
  fr: [
    { name: 'Lun', index: 1 }, { name: 'Mar', index: 2 }, { name: 'Mer', index: 3 },
    { name: 'Jeu', index: 4 }, { name: 'Ven', index: 5 }, { name: 'Sam', index: 6 }, { name: 'Dim', index: 0 }
  ],
  it: [
    { name: 'Lun', index: 1 }, { name: 'Mar', index: 2 }, { name: 'Mer', index: 3 },
    { name: 'Gio', index: 4 }, { name: 'Ven', index: 5 }, { name: 'Sab', index: 6 }, { name: 'Dom', index: 0 }
  ],
  ru: [
    { name: 'Пн', index: 1 }, { name: 'Вт', index: 2 }, { name: 'Ср', index: 3 },
    { name: 'Чт', index: 4 }, { name: 'Пт', index: 5 }, { name: 'Сб', index: 6 }, { name: 'Вс', index: 0 }
  ],
  zh: [
    { name: '一', index: 1 }, { name: '二', index: 2 }, { name: '三', index: 3 },
    { name: '四', index: 4 }, { name: '五', index: 5 }, { name: '六', index: 6 }, { name: '日', index: 0 }
  ],
  uk: [
    { name: 'Пн', index: 1 }, { name: 'Вт', index: 2 }, { name: 'Ср', index: 3 },
    { name: 'Чт', index: 4 }, { name: 'Пт', index: 5 }, { name: 'Сб', index: 6 }, { name: 'Нд', index: 0 }
  ]
};

export default function GestionarTareas({ 
  habits, 
  onCreateHabit, 
  onUpdateHabit, 
  onDeleteHabit, 
  lang = 'es',
  initialEditingHabit,
  clearInitialEditingHabit,
  initialOpenCreate,
  clearInitialOpenCreate
}) {
  const [editingHabit, setEditingHabit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [scheduleType, setScheduleType] = useState('toda');
  const [customDays, setCustomDays] = useState([1, 2, 3, 4, 5]);
  const [time, setTime] = useState('08:00');
  const [importance, setImportance] = useState('media');

  const t = translations[lang].gestionar;
  const common = translations[lang].common;
  const daysList = WEEKDAYS[lang] || WEEKDAYS['es'];

  useEffect(() => {
    if (initialEditingHabit) {
      openEditForm(initialEditingHabit);
      clearInitialEditingHabit();
    }
  }, [initialEditingHabit]);

  useEffect(() => {
    if (initialOpenCreate) {
      openCreateForm();
      clearInitialOpenCreate();
    }
  }, [initialOpenCreate]);

  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFormOpen]);

  const openCreateForm = () => {
    setEditingHabit(null);
    setName('');
    setScheduleType('toda');
    setCustomDays([1, 2, 3, 4, 5]);
    setTime('08:00');
    setImportance('media');
    setIsFormOpen(true);
  };

  const openEditForm = (habit) => {
    setEditingHabit(habit);
    setName(habit.nombre);
    
    const days = habit.dias;
    const isWeek = days.length === 7;
    const isLaboral = days.length === 5 && [1, 2, 3, 4, 5].every(d => days.includes(d));

    if (isWeek) {
      setScheduleType('toda');
    } else if (isLaboral) {
      setScheduleType('laboral');
    } else {
      setScheduleType('personalizado');
    }
    
    setCustomDays(days);
    setTime(habit.horaSugerida || '08:00');
    setImportance(habit.importancia || 'media');
    setIsFormOpen(true);
  };

  const toggleDay = (dayIndex) => {
    if (customDays.includes(dayIndex)) {
      if (customDays.length > 1) {
        setCustomDays(customDays.filter(d => d !== dayIndex));
      }
    } else {
      setCustomDays([...customDays, dayIndex].sort());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalDays = [];
    if (scheduleType === 'toda') {
      finalDays = [0, 1, 2, 3, 4, 5, 6];
    } else if (scheduleType === 'laboral') {
      finalDays = [1, 2, 3, 4, 5];
    } else {
      finalDays = customDays;
    }

    const data = {
      nombre: name.trim(),
      dias: finalDays,
      horaSugerida: time,
      importancia: importance
    };

    if (editingHabit) {
      await onUpdateHabit(editingHabit.id, data);
    } else {
      await onCreateHabit(data);
    }

    setIsFormOpen(false);
    setName('');
    setEditingHabit(null);
  };

  const handleDelete = async (habitId) => {
    if (window.confirm(common.confirm_delete)) {
      await onDeleteHabit(habitId);
    }
  };

  const getDaysLabel = (days) => {
    if (days.length === 7) return t.all_week;
    if (days.length === 5 && [1, 2, 3, 4, 5].every(d => days.includes(d))) return t.mon_to_fri;
    
    const sortedDays = [...days].sort((a, b) => {
      const valA = a === 0 ? 7 : a;
      const valB = b === 0 ? 7 : b;
      return valA - valB;
    });

    const dayNames = sortedDays.map(d => {
      const found = daysList.find(w => w.index === d);
      return found ? found.name : '';
    });
    return dayNames.join(', ');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-0">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-[var(--bg-panel)] border border-[var(--border-color)] p-6 rounded-3xl backdrop-blur-md">
        <div>
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest font-outfit">{common.days}</span>
          <h2 className="text-3xl font-extrabold text-[var(--text-title)] mt-1 font-outfit">{t.title}</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition duration-200 cursor-pointer shadow-lg shadow-purple-600/10"
        >
          <Plus className="w-5 h-5" /> {t.new_habit}
        </button>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {habits.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl">
            <Calendar className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)] font-medium">
              {lang === 'es' ? 'No hay hábitos configurados en este perfil.' : 'No habits configured in this profile.'}
            </p>
          </div>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className="bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-hover)] border border-[var(--border-color)] hover:border-purple-500/20 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group shadow-lg"
            >
              <div>
                <h3 className="font-bold text-[var(--text-title)] text-lg font-outfit group-hover:text-purple-400 transition-colors">
                  {habit.nombre}
                </h3>
                
                <div className="mt-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
                    <Calendar className="w-4 h-4 text-purple-400/80" />
                    <span>{getDaysLabel(habit.dias)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium">
                    <Clock className="w-4 h-4 text-purple-400/80" />
                    <span>{common.time}: {habit.horaSugerida || '--:--'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold pt-1">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider border ${
                      habit.importancia === 'alta'
                        ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        : habit.importancia === 'baja'
                        ? 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                        : 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                    }`}>
                      {habit.importancia === 'alta'
                        ? (lang === 'es' ? 'Muy importante' : 'High')
                        : habit.importancia === 'baja'
                        ? (lang === 'es' ? 'Poco importante' : 'Low')
                        : (lang === 'es' ? 'Importante' : 'Medium')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[var(--border-color)] pt-4 mt-5">
                <button
                  onClick={() => openEditForm(habit)}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-input)] hover:bg-[var(--bg-panel-hover)] rounded-xl transition cursor-pointer"
                  title={common.edit}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(habit.id)}
                  className="p-2 text-[var(--text-muted)] hover:text-rose-450 bg-[var(--bg-input)] hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                  title={common.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Habit Create / Edit Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl shadow-2xl animate-scaleIn flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header - Fixed */}
            <div className="flex justify-between items-center p-6 pb-4 border-b border-[var(--border-color)] bg-[var(--bg-panel)] z-10">
              <h3 className="text-xl font-bold text-[var(--text-title)] font-outfit">
                {editingHabit ? t.edit_habit : t.new_habit}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-panel-hover)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-none p-6 space-y-5">
              {/* Habit Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  {common.name}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.name_placeholder}
                  className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] text-sm placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* Days Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  {t.schedule}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                  <button
                    type="button"
                    onClick={() => setScheduleType('toda')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      scheduleType === 'toda'
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-purple-500/30'
                    }`}
                  >
                    {t.all_week}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleType('laboral')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      scheduleType === 'laboral'
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-purple-500/30'
                    }`}
                  >
                    {t.mon_to_fri}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleType('personalizado')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      scheduleType === 'personalizado'
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-purple-500/30'
                    }`}
                  >
                    {t.custom}
                  </button>
                </div>

                {scheduleType === 'personalizado' && (
                  <div className="flex justify-between items-center gap-1.5 p-3.5 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl animate-fadeIn">
                    {daysList.map((day) => {
                      const isSelected = customDays.includes(day.index);
                      return (
                        <button
                          key={day.index}
                          type="button"
                          onClick={() => toggleDay(day.index)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition cursor-pointer border ${
                            isSelected
                              ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                              : 'bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                          }`}
                        >
                          {day.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Importance level */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  {lang === 'es' ? 'Importancia / Prioridad' : 'Importance / Priority'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { value: 'baja', label: lang === 'es' ? 'Poco importante' : 'Low' },
                    { value: 'media', label: lang === 'es' ? 'Importante' : 'Medium' },
                    { value: 'alta', label: lang === 'es' ? 'Muy importante' : 'High' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setImportance(item.value)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${
                        importance === item.value
                          ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/10'
                          : 'bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-purple-500/30'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time suggestion */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-400/80" /> {t.time_suggested}
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-color)] rounded-2xl focus:outline-none focus:border-purple-500 text-[var(--text-main)] text-sm"
                />
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[var(--border-color)] bg-[var(--bg-panel)] z-10">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)] font-semibold rounded-xl text-sm transition cursor-pointer"
              >
                {common.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-purple-600/10 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {t.save_changes}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
