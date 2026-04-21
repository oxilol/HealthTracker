"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useWeeklyData } from '../features/health/hooks/useWeeklyData';
import { useNutritionGoals } from '../features/nutrition/hooks/useNutritionGoals';
import { useUserStore } from '../store/userStore';
import { SignOutSection } from '../features/auth/components/SignOutSection';
import { todayLocalStr, getMostRecentSaturday, addWeeks, formatWeekRange } from '../lib/dateUtils';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const DAY_LABELS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const STEP_GOAL_KEY = 'step_goal';
const DEFAULT_STEP_GOAL = 10000;

function readStepGoal(): number {
  if (typeof window === 'undefined') return DEFAULT_STEP_GOAL;
  const parsedValue = parseInt(localStorage.getItem(STEP_GOAL_KEY) || '', 10);
  return isNaN(parsedValue) || parsedValue <= 0 ? DEFAULT_STEP_GOAL : parsedValue;
}

// Skeleton 

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-2xl ${className}`} />;
}

// Stat cards (header summary cards)

function StatChip({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl py-4 flex flex-col items-center justify-center text-center gap-2">
      <div className={`w-8 h-8 rounded-xl flex flex-col items-center justify-center ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">{label}</p>
        <p className="text-base font-bold text-white leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-neutral-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// Day row

function DayRow({
  day,
  label,
  isToday,
  stepGoal,
  calorieGoal,
  proteinGoal,
}: {
  day: ReturnType<typeof useWeeklyData>['days'][0];
  label: string;
  isToday: boolean;
  stepGoal: number;
  calorieGoal: number;
  proteinGoal: number;
}) {
  const steps = day.metrics?.steps ?? 0;
  const calories = Math.round(day.calories);
  const protein = Math.round(day.protein);
  const hasWorkout = day.hasWorkout;

  const stepPct = Math.min(1, stepGoal > 0 ? steps / stepGoal : 0);
  const calPct = Math.min(1, calorieGoal > 0 ? calories / calorieGoal : 0);
  const protPct = Math.min(1, proteinGoal > 0 ? protein / proteinGoal : 0);

  const dateNum = new Date(day.date + 'T12:00:00').getDate();
  const isEmpty = steps === 0 && calories === 0 && !hasWorkout;

  return (
    <div
      className={`rounded-2xl p-3.5 border transition-all
        ${isToday
          ? 'bg-indigo-500/8 border-indigo-500/25'
          : 'bg-neutral-900 border-neutral-800/70'
        }`}
    >
      {/* Top row: day + date + workout indication */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold w-7 ${isToday ? 'text-indigo-400' : 'text-neutral-500'}`}>
            {label}
          </span>
          <span className={`text-sm font-bold ${isToday ? 'text-indigo-300' : 'text-neutral-300'}`}>
            {dateNum}
          </span>
        </div>
        {hasWorkout && (
          <span className="text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
            Workout ✓
          </span>
        )}
      </div>

      {/* Progress bars */}
      <div className="space-y-1.5">
        {/* Steps */}
        <div className="flex items-center gap-2">
          <div className="w-5 shrink-0 text-[9px] font-bold text-orange-500/70 uppercase tracking-wide">stp</div>
          <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: isEmpty ? '0%' : `${stepPct * 100}%` }} />
          </div>
          <span className={`text-[11px] font-medium w-12 text-right shrink-0 ${isEmpty ? 'text-neutral-700' : 'text-neutral-400'}`}>
            {isEmpty ? '—' : steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps}
          </span>
        </div>
        {/* Calories */}
        <div className="flex items-center gap-2">
          <div className="w-5 shrink-0 text-[9px] font-bold text-emerald-500/70 uppercase tracking-wide">cal</div>
          <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: isEmpty ? '0%' : `${calPct * 100}%` }} />
          </div>
          <span className={`text-[11px] font-medium w-12 text-right shrink-0 ${isEmpty ? 'text-neutral-700' : 'text-neutral-400'}`}>
            {isEmpty ? '—' : calories >= 1000 ? `${(calories / 1000).toFixed(1)}k` : calories}
          </span>
        </div>
        {/* Protein */}
        <div className="flex items-center gap-2">
          <div className="w-5 shrink-0 text-[9px] font-bold text-sky-500/70 uppercase tracking-wide">pro</div>
          <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: isEmpty ? '0%' : `${protPct * 100}%` }} />
          </div>
          <span className={`text-[11px] font-medium w-12 text-right shrink-0 ${isEmpty ? 'text-neutral-700' : 'text-neutral-400'}`}>
            {isEmpty ? '—' : `${protein}g`}
          </span>
        </div>
      </div>
    </div>
  );
}

// Page

// Main App Dashboard: weekly health data and summary of daily progress

export default function DashboardPage() {
  const todayStr = todayLocalStr();
  const currentWeekSat = useMemo(() => getMostRecentSaturday(), []);
  const [weekSat, setWeekSat] = useState(currentWeekSat);
  const [stepGoal, setStepGoalState] = useState(DEFAULT_STEP_GOAL);

  // User profile, weekly data hook, and nutrition goals
  const user = useUserStore((s) => s.user);
  const { days, loading: weekLoading } = useWeeklyData(weekSat);
  const { goals } = useNutritionGoals();

  const calorieGoal = goals?.calorie_goal ?? 2000;
  const proteinGoal = goals?.protein_goal ?? 150;

  useEffect(() => {
    setStepGoalState(readStepGoal());
    // also listen for cross-tab storage changes (e.g. when settings modal writes)
    const handler = () => setStepGoalState(readStepGoal());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const greeting = useMemo(() => getGreeting(), []);
  const displayName = useMemo(() => {
    if (!user?.email) return '';
    const namePart = user.email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }, [user]);

  const isCurrentWeek = weekSat === currentWeekSat;
  const weekLabel = useMemo(() => formatWeekRange(weekSat), [weekSat]);

  // Calculate aggregated summaries (total steps, active calories, workouts, and average daily macros)
  const weekStats = useMemo(() => {
    let totalSteps = 0, totalKcal = 0, workoutDays = 0, calSum = 0, protSum = 0, nutritionDays = 0;
    for (const dailyData of days) {
      totalSteps += dailyData.metrics?.steps ?? 0;
      totalKcal += dailyData.metrics?.active_energy ?? 0;
      if (dailyData.hasWorkout) workoutDays++;

      const hasCal = dailyData.calories > 0;
      const hasProt = dailyData.protein > 0;
      if (hasCal || hasProt) {
        calSum += dailyData.calories;
        protSum += dailyData.protein;
        nutritionDays++;
      }
    }
    return {
      totalSteps,
      totalKcal,
      workoutDays,
      avgCal: nutritionDays > 0 ? Math.round(calSum / nutritionDays) : 0,
    };
  }, [days]);

  const formatNumber = (num: number) => num >= 1000 ? `${(num / 1000).toFixed(0)}k` : num.toString();

  return (
    <div className="flex flex-col px-4 pb-8 min-h-screen">
      {/* Header */}
      <header className="mb-5 mt-5 pt-2 animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
          {greeting}{displayName ? `, ${displayName}` : ''}
        </h1>
      </header>

      <div className="flex flex-col gap-4">

        {/* Week Navigator */}
        <div className="animate-fade-in-up-1 flex items-center gap-2">
          <button
            onClick={() => setWeekSat((w) => addWeeks(w, -1))}
            className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-neutral-200">{weekLabel}</p>
            {isCurrentWeek && (
              <p className="text-[10px] text-indigo-400 font-medium mt-0.5">This Week</p>
            )}
          </div>

          <button
            onClick={() => setWeekSat((w) => addWeeks(w, 1))}
            disabled={isCurrentWeek}
            className={`w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center transition-all active:scale-95 ${isCurrentWeek ? 'text-neutral-700 cursor-not-allowed' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {!isCurrentWeek && (
            <button
              onClick={() => setWeekSat(currentWeekSat)}
              className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1.5 rounded-xl whitespace-nowrap hover:bg-indigo-500/20 transition-all"
            >
              Now
            </button>
          )}
        </div>

        {/* Weekly Summary Chips */}
        <div className="animate-fade-in-up-2">
          {weekLoading ? (
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="flex-1 h-20" />)}
            </div>
          ) : (
            <div className="flex gap-2">
              <StatChip
                icon={
                  <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                  </svg>
                }
                label="Steps"
                value={formatNumber(weekStats.totalSteps)}
                accent="bg-orange-500/15"
              />
              <StatChip
                icon={
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                }
                label="Kcal Out"
                value={formatNumber(weekStats.totalKcal)}
                accent="bg-amber-500/15"
              />
              <StatChip
                icon={
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                }
                label="Workouts"
                value={`${weekStats.workoutDays}/7`}
                accent="bg-indigo-500/15"
              />
              <StatChip
                icon={
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5A2.25 2.25 0 0 0 12.75 4.5h-1.5A2.25 2.25 0 0 0 9 6.75v1.5m3 11.25v-6m-3 6a3 3 0 0 1-3-3m3 3h.008v.008H12V19.5Zm0 0a3 3 0 0 0 3-3m0 0V13.5m0 3h.008v.008H15V16.5Z" />
                  </svg>
                }
                label="Avg Cal"
                value={weekStats.avgCal > 0 ? `${weekStats.avgCal >= 1000 ? `${(weekStats.avgCal / 1000).toFixed(1)}k` : weekStats.avgCal}` : '—'}
                accent="bg-emerald-500/15"
              />
            </div>
          )}
        </div>

        {/* 7-Day Grid */}
        <div className="animate-fade-in-up-3 space-y-2">
          {weekLoading
            ? [...Array(7)].map((_, index) => <Skeleton key={index} className="h-24" />)
            : days.map((dayData, index) => (
              <DayRow
                key={dayData.date}
                day={dayData}
                label={DAY_LABELS[index]}
                isToday={dayData.date === todayStr}
                stepGoal={stepGoal}
                calorieGoal={calorieGoal}
                proteinGoal={proteinGoal}
              />
            ))}
        </div>

        <SignOutSection />

      </div>
    </div>
  );
}
