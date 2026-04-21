"use client";

import { useState } from 'react';
import { useNutritionCalendar } from '../hooks/useNutritionCalendar';
import { NutritionGoals } from '../../../types/nutrition';
import { todayLocalStr, getFirstDayOfMonth, getDaysInMonth } from '../../../lib/dateUtils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface NutritionCalendarProps {
  goals: NutritionGoals | null;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

export function NutritionCalendar({ goals, selectedDate, onSelectDate, onClose }: NutritionCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const { daySummaries, loading } = useNutritionCalendar(viewMonth, viewYear);

  const todayStr = todayLocalStr();

  const firstDayOfMonth = getFirstDayOfMonth(viewYear, viewMonth);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToToday = () => {
    onSelectDate(todayStr);
    onClose();
  };

  const isGoalMet = (dateStr: string): boolean => {
    if (!goals || !goals.calorie_goal) return false;
    const summary = daySummaries.get(dateStr);
    if (!summary) return false;

    // Goal is met if calories are within 90-110% of target
    const calRatio = summary.calories / goals.calorie_goal;
    return calRatio >= 0.9 && calRatio <= 1.1;
  };

  const hasData = (dateStr: string): boolean => {
    return daySummaries.has(dateStr);
  };

  const handleSelectDay = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Don't allow future dates
    if (dateStr > todayStr) return;
    onSelectDate(dateStr);
    onClose();
  };

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-[60] bg-neutral-950/95 backdrop-blur-sm flex flex-col animate-fade-in">
      <div className="w-full max-w-md mx-auto flex flex-col h-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pt-6">
          <button
            onClick={onClose}
            className="p-3 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-neutral-100">Nutrition Calendar</h2>
          <button
            onClick={goToToday}
            className="ml-auto text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={goToPrevMonth}
            className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-neutral-200">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="px-4 flex-1">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-[11px] font-medium text-neutral-600 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="skeleton aspect-square rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the 1st */}
              {blanks.map((i) => (
                <div key={`blank-${i}`} className="aspect-square" />
              ))}

              {/* Day cells */}
              {days.map((day) => {
                const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isFuture = dateStr > todayStr;
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const goalMet = isGoalMet(dateStr);
                const hasLog = hasData(dateStr);

                return (
                  <button
                    key={day}
                    onClick={() => handleSelectDay(day)}
                    disabled={isFuture}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all relative ${isFuture
                      ? 'text-neutral-800 cursor-not-allowed'
                      : isSelected
                        ? 'bg-indigo-600 text-white font-bold'
                        : isToday
                          ? 'bg-neutral-800 text-neutral-100 font-semibold'
                          : goalMet
                            ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                            : hasLog
                              ? 'bg-neutral-800/50 text-neutral-300'
                              : 'text-neutral-500 hover:bg-neutral-800/30'
                      }`}
                  >
                    {day}
                    {/* Goal met dot */}
                    {goalMet && !isSelected && (
                      <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-5 pb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500/15 border border-emerald-500/30" />
              <span className="text-[11px] text-neutral-500">Goal met</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-neutral-800/50 border border-neutral-700" />
              <span className="text-[11px] text-neutral-500">Has logs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-600 border border-indigo-500" />
              <span className="text-[11px] text-neutral-500">Selected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
