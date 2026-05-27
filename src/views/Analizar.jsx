import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Award, Zap, Percent, BarChart3, TrendingUp, ChevronDown, Check, X } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Analizar({ habits, lang = 'es' }) {
  const [selectedHabitId, setSelectedHabitId] = useState(habits[0]?.id || null);
  const [isMobileSelectorOpen, setIsMobileSelectorOpen] = useState(false);

  useEffect(() => {
    if (isMobileSelectorOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSelectorOpen]);

  const t = translations[lang].analizar;
  const common = translations[lang].common;

  const calculateMetrics = (habit) => {
    if (!habit) return { currentStreak: 0, maxStreak: 0, consistency: 0, totalScheduled: 0, successCount: 0 };
    
    const diasConfigured = habit.dias;
    const history = habit.history || {};
    const createdDate = new Date(habit.createdAt || '2026-05-01');
    const today = new Date();
    
    today.setHours(0, 0, 0, 0);
    createdDate.setHours(0, 0, 0, 0);
    
    const scheduledDates = [];
    let currentPointer = new Date(createdDate);
    while (currentPointer <= today) {
      if (diasConfigured.includes(currentPointer.getDay())) {
        scheduledDates.push(new Date(currentPointer));
      }
      currentPointer.setDate(currentPointer.getDate() + 1);
    }
    
    if (scheduledDates.length === 0) {
      return { currentStreak: 0, maxStreak: 0, consistency: 0, totalScheduled: 0, successCount: 0 };
    }
    
    const successMap = scheduledDates.map(date => {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const record = history[dateStr];
      const isTodayVal = date.getTime() === today.getTime();
      const isSuccessful = record?.completado || record?.justificado || false;
      
      return {
        dateStr,
        isToday: isTodayVal,
        isSuccessful
      };
    });
    
    const pastScheduled = successMap.filter(d => !d.isToday || d.isSuccessful);
    const totalScheduled = pastScheduled.length;
    const successCount = successMap.filter(d => d.isSuccessful).length;
    const consistency = totalScheduled > 0 ? Math.round((successCount / totalScheduled) * 100) : 0;
    
    let maxStreak = 0;
    let currentRun = 0;
    for (let i = 0; i < successMap.length; i++) {
      if (successMap[i].isSuccessful) {
        currentRun++;
        if (currentRun > maxStreak) {
          maxStreak = currentRun;
        }
      } else {
        if (successMap[i].isToday) {
          continue;
        }
        currentRun = 0;
      }
    }
    
    let currentStreak = 0;
    let i = successMap.length - 1;
    if (i >= 0 && successMap[i].isToday && !successMap[i].isSuccessful) {
      i--;
    }
    while (i >= 0) {
      if (successMap[i].isSuccessful) {
        currentStreak++;
        i--;
      } else {
        break;
      }
    }
    
    return {
      currentStreak,
      maxStreak,
      consistency,
      totalScheduled,
      successCount
    };
  };

  const activeHabit = habits.find(h => h.id === selectedHabitId) || habits[0];
  const metrics = calculateMetrics(activeHabit);

  const chartData = habits.map(h => {
    const { consistency } = calculateMetrics(h);
    return {
      name: h.nombre.length > 15 ? h.nombre.substring(0, 12) + '...' : h.nombre,
      constancia: consistency,
      fullName: h.nombre
    };
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-0">
      {/* Title Header */}
      <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-6 rounded-3xl backdrop-blur-md">
        <span className="text-purple-400 text-xs font-bold uppercase tracking-widest font-outfit">{t.title}</span>
        <h2 className="text-3xl font-extrabold text-[var(--text-title)] mt-1 font-outfit">{t.title}</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">{t.subtitle}</p>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-20 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl">
          <BarChart3 className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-muted)] font-medium">
            {lang === 'es' ? 'No hay datos para analizar.' : 'No data to analyze.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Habits Selector Custom Modal Trigger for Mobile */}
          <div className="lg:hidden bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-5 shadow-xl">
            <span className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-1">
              {t.select}
            </span>
            <button
              onClick={() => setIsMobileSelectorOpen(true)}
              className="w-full flex items-center justify-between bg-[var(--bg-input)] hover:bg-[var(--bg-panel-hover)] border border-[var(--border-color)] rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text-main)] transition cursor-pointer"
            >
              <span className="truncate">{activeHabit ? activeHabit.nombre : (lang === 'es' ? 'Seleccionar hábito...' : 'Select habit...')}</span>
              <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0 ml-2" />
            </button>
          </div>

          {/* Habits Selector Sidebar */}
          <div className="hidden lg:flex lg:col-span-1 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-5 shadow-xl space-y-3 flex-col max-h-[480px]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-2">{t.select}</h3>
            <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
              {habits.map((h) => {
                const isSelected = (activeHabit && activeHabit.id === h.id);
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHabitId(h.id)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/15'
                        : 'text-[var(--text-muted)] bg-[var(--bg-input)] border border-[var(--border-color)] hover:bg-[var(--bg-panel-hover)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <p className="truncate">{h.nombre}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Habit statistics details panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-3 gap-4">
              {/* Current Streak */}
              <div className="bg-gradient-to-br from-purple-950/10 to-purple-900/5 border border-purple-500/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden group">
                <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-bounce" />
                <span className="block text-[10px] text-purple-400 uppercase tracking-widest font-bold">{t.current_streak}</span>
                <span className="block text-3xl font-extrabold text-[var(--text-title)] font-outfit mt-1">{metrics.currentStreak}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{metrics.currentStreak === 1 ? t.days_count.substring(0,2) : t.days_count}</span>
              </div>

              {/* Max Streak */}
              <div className="bg-gradient-to-br from-emerald-950/10 to-emerald-900/5 border border-emerald-500/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
                <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <span className="block text-[10px] text-emerald-400 uppercase tracking-widest font-bold">{t.max_streak}</span>
                <span className="block text-3xl font-extrabold text-[var(--text-title)] font-outfit mt-1">{metrics.maxStreak}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{metrics.maxStreak === 1 ? t.days_count.substring(0,2) : t.days_count}</span>
              </div>

              {/* Consistency */}
              <div className="bg-gradient-to-br from-indigo-950/10 to-indigo-900/5 border border-indigo-500/20 rounded-2xl p-4 text-center shadow-lg relative overflow-hidden">
                <Percent className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <span className="block text-[10px] text-indigo-400 uppercase tracking-widest font-bold">{t.consistency}</span>
                <span className="block text-3xl font-extrabold text-[var(--text-title)] mt-1">{metrics.consistency}%</span>
                <span className="text-[10px] text-[var(--text-muted)]">{(lang === 'es' || lang === 'en') ? 'general' : ''}</span>
              </div>
            </div>

            {/* Individual Details */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-[var(--text-title)] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                {lang === 'es' ? 'Resumen de Constancia' : 'Consistency Summary'}
              </h3>
              <div className="space-y-3.5 text-sm text-[var(--text-muted)]">
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span>{t.commitment}:</span>
                  <span className="font-bold text-[var(--text-main)]">{metrics.totalScheduled} {t.days_count}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span>{lang === 'es' ? 'Días completados/justificados:' : 'Successful days:'}</span>
                  <span className="font-bold text-[var(--text-main)]">{metrics.successCount} {t.times}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                  <span>{t.creation}:</span>
                  <span className="font-bold text-[var(--text-main)]">{activeHabit.createdAt || '01-05-2026'}</span>
                </div>
              </div>
            </div>

            {/* General Consistency Graph comparing all habits */}
            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-[var(--text-title)] mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" /> {t.comparison}
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(168, 85, 247, 0.05)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[var(--bg-panel)] border border-[var(--border-color)] p-3 rounded-xl shadow-xl">
                              <p className="text-xs font-bold text-[var(--text-title)]">{payload[0].payload.fullName}</p>
                              <p className="text-xs text-purple-400 mt-1">{t.consistency}: {payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="constancia" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.constancia >= 80 ? '#10b981' : entry.constancia >= 50 ? '#f59e0b' : '#a855f7'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Mobile Habit Selector Modal */}
      {isMobileSelectorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl animate-scaleIn flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-bold text-[var(--text-title)] font-outfit">
                {t.select}
              </h3>
              <button
                onClick={() => setIsMobileSelectorOpen(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl hover:bg-[var(--bg-panel-hover)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto scrollbar-none py-4 space-y-2 flex-1">
              {habits.map((h) => {
                const isSelected = activeHabit && activeHabit.id === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => {
                      setSelectedHabitId(h.id);
                      setIsMobileSelectorOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium transition cursor-pointer border ${
                      isSelected
                        ? 'bg-purple-600 border-purple-600 text-white font-bold shadow-md shadow-purple-600/15'
                        : 'text-[var(--text-muted)] bg-[var(--bg-input)] border border-[var(--border-color)] hover:bg-[var(--bg-panel-hover)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <span className="truncate pr-2">{h.nombre}</span>
                    {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
