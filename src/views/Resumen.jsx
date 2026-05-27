import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import { translations } from '../utils/translations';

const MONTH_NAMES = {
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  uk: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']
};

export default function Resumen({ habits, lang = 'es' }) {
  const [expandedHabitId, setExpandedHabitId] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);

  const t = translations[lang].resumen;
  const common = translations[lang].common;

  const today = new Date();
  const currentYear = today.getFullYear();

  const isFutureDate = (d) => d > today;
  const isToday = (d) => {
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const formatDateStr = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayDayIndex = today.getDay();

  const todayHabits = habits.filter(h => h.dias.includes(todayDayIndex));
  const totalToday = todayHabits.length;
  const completedToday = todayHabits.filter(h => h.history?.[todayStr]?.completado).length;
  const justifiedToday = todayHabits.filter(h => h.history?.[todayStr]?.justificado).length;
  const pendingToday = totalToday - (completedToday + justifiedToday);

  // Pie chart data
  const data = [
    { name: t.legend_completed, value: completedToday, color: '#10b981' },
    { name: t.legend_justified, value: justifiedToday, color: '#f59e0b' },
    { name: t.legend_pending, value: pendingToday, color: '#334155' }
  ];

  const hasAnyHabitsToday = totalToday > 0;
  const percentageCompleted = totalToday > 0 
    ? Math.round(((completedToday + justifiedToday) / totalToday) * 100)
    : 0;

  const monthLabels = MONTH_NAMES[lang] || MONTH_NAMES['es'];
  const MONTHS = [
    { name: monthLabels[0], days: 31 },
    { name: monthLabels[1], days: (currentYear % 4 === 0) ? 29 : 28 },
    { name: monthLabels[2], days: 31 },
    { name: monthLabels[3], days: 30 },
    { name: monthLabels[4], days: 31 },
    { name: monthLabels[5], days: 30 },
    { name: monthLabels[6], days: 31 },
    { name: monthLabels[7], days: 31 },
    { name: monthLabels[8], days: 30 },
    { name: monthLabels[9], days: 31 },
    { name: monthLabels[10], days: 30 },
    { name: monthLabels[11], days: 31 }
  ];

  const handleToggleExpand = (habitId) => {
    setExpandedHabitId(expandedHabitId === habitId ? null : habitId);
  };

  const getDayStatus = (habit, dateStr, dateObj) => {
    const dayOfWeek = dateObj.getDay();
    const isScheduled = habit.dias.includes(dayOfWeek);
    const inFuture = isFutureDate(dateObj);
    const record = habit.history?.[dateStr];

    if (inFuture) {
      return { status: 'future', style: 'border border-slate-800 bg-slate-900/10' };
    }

    if (!isScheduled) {
      return { status: 'unscheduled', style: 'bg-slate-800/20 border border-slate-800/40 text-slate-700' };
    }

    if (record?.completado) {
      return { status: 'completed', style: 'bg-emerald-500 border border-emerald-600 shadow-sm shadow-emerald-500/20' };
    }

    if (record?.justificado) {
      return { status: 'justified', style: 'bg-amber-400 border border-amber-500 shadow-sm shadow-amber-400/20', note: record.nota };
    }

    if (isToday(dateObj)) {
      return { status: 'today-pending', style: 'border border-dashed border-purple-500/80 bg-purple-500/5' };
    }

    return { status: 'missed', style: 'bg-rose-500 border border-rose-600 shadow-sm shadow-rose-500/20' };
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-0 relative">
      {/* Tooltip Popup container */}
      {hoveredDay && (
        <div className="fixed bottom-24 right-4 left-4 sm:absolute sm:bottom-auto sm:right-auto z-40 bg-slate-950 border border-amber-500/40 p-3.5 rounded-2xl shadow-xl max-w-sm pointer-events-none animate-fadeIn">
          <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-1 uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" /> {lang === 'es' ? 'Justificación' : 'Justification'} ({hoveredDay.dateStr})
          </p>
          <p className="text-sm text-slate-200 italic font-light">"{hoveredDay.note}"</p>
        </div>
      )}

      {/* Top Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 flex-1">
          <span className="text-purple-400 text-xs font-bold uppercase tracking-widest">{t.title}</span>
          <h2 className="text-2xl font-bold text-white font-outfit">{t.progress_general}</h2>
          <p className="text-slate-400 text-sm">{t.subtitle}</p>
          <div className="flex flex-wrap gap-4 pt-3 text-xs font-medium">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500"></span> {t.legend_completed} ({completedToday})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400"></span> {t.legend_justified} ({justifiedToday})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-700"></span> {t.legend_pending} ({pendingToday})</span>
          </div>
        </div>

        <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
          {hasAnyHabitsToday ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="block text-3xl font-extrabold text-white font-outfit">{percentageCompleted}%</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{t.legend_completed}</span>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 text-xs p-4 border border-dashed border-slate-800 rounded-full w-full h-full flex flex-col items-center justify-center">
              <Calendar className="w-8 h-8 mb-1.5 text-slate-700" />
              <span>{lang === 'es' ? 'Sin hábitos' : 'No habits'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Habit Calendars List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white mb-4">{t.history_title}</h3>

        <div className="space-y-3">
          {habits.map((habit) => {
            const isExpanded = expandedHabitId === habit.id;
            return (
              <div key={habit.id} className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/20">
                <button
                  onClick={() => handleToggleExpand(habit.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-800/30 transition-colors text-left cursor-pointer"
                >
                  <div>
                    <h4 className="font-bold text-white text-base font-outfit">{habit.nombre}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.frequency}: {habit.dias.length === 7 ? (lang === 'es' ? 'Diario' : 'Daily') : `${habit.dias.length} ${lang === 'es' ? 'días/semana' : 'days/week'}`}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-6 border-t border-slate-800 bg-slate-900/20 space-y-6">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 justify-between items-center border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-emerald-500"></span> {t.legend_completed}</span>
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-amber-400"></span> {t.legend_justified}</span>
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-rose-500"></span> {t.legend_missed}</span>
                        <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded bg-slate-800/40"></span> {t.legend_rest}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-purple-500/80" />
                        {t.tooltip_info}
                      </div>
                    </div>

                    {/* Months Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {MONTHS.map((month, mIdx) => {
                        const firstDayDate = new Date(currentYear, mIdx, 1);
                        let firstDayIndex = firstDayDate.getDay();
                        firstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

                        const monthDaysArr = Array.from({ length: month.days }, (_, i) => i + 1);

                        return (
                          <div key={month.name} className="space-y-2">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{month.name}</h5>
                            
                            {/* Calendar Grid Header */}
                            <div className="grid grid-cols-7 gap-1 text-[9px] font-bold text-slate-600 text-center">
                              <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
                            </div>

                            {/* Squares Grid */}
                            <div className="grid grid-cols-7 gap-1">
                              {Array.from({ length: firstDayIndex }).map((_, padIdx) => (
                                <div key={`pad-${padIdx}`} className="aspect-square bg-transparent"></div>
                              ))}

                              {monthDaysArr.map((dayNum) => {
                                const dateObj = new Date(currentYear, mIdx, dayNum);
                                const dateStr = formatDateStr(currentYear, mIdx, dayNum);
                                const info = getDayStatus(habit, dateStr, dateObj);

                                const isJustified = info.status === 'justified';

                                return (
                                  <div
                                    key={`day-${dayNum}`}
                                    className={`aspect-square rounded-md transition-transform duration-200 hover:scale-125 cursor-pointer relative ${info.style}`}
                                    title={isJustified ? `${dateStr}: ${info.note}` : dateStr}
                                    onMouseEnter={(e) => {
                                      if (isJustified && info.note) {
                                        setHoveredDay({ dateStr, note: info.note, status: 'justified' });
                                      }
                                    }}
                                    onMouseLeave={() => setHoveredDay(null)}
                                    onClick={() => {
                                      if (isJustified && info.note) {
                                        if (hoveredDay?.dateStr === dateStr) {
                                          setHoveredDay(null);
                                        } else {
                                          setHoveredDay({ dateStr, note: info.note, status: 'justified' });
                                        }
                                      } else {
                                        setHoveredDay(null);
                                      }
                                    }}
                                  >
                                    {info.status === 'unscheduled' && (
                                      <div className="absolute inset-1.5 rounded-full bg-slate-800"></div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
