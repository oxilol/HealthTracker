"use client";

import { useState } from 'react';

interface DailyProgressProps {
  consumed: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  goals: {
    calorie_goal: number;
    protein_goal: number;
    carbohydrate_goal: number;
    fat_goal: number;
  } | null;
}

function ProgressRing({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" stroke="#262626" strokeWidth="6" fill="none" />
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-neutral-100">{Math.round(value)}</span>
          <span className="text-[10px] text-neutral-500">{max > 0 ? `/ ${Math.round(max)}` : '—'}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-neutral-400 mt-2">{label}</span>
    </div>
  );
}

function MacroBar({ value, max, label, color, unit }: { value: number; max: number; label: string; color: string; unit: string }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="flex-1">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs font-medium text-neutral-400">{label}</span>
        <span className="text-xs text-neutral-500">
          {Math.round(value)}{unit} {max > 0 && `/ ${Math.round(max)}${unit}`}
        </span>
      </div>
      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// Donut chart for the back of the card
function MacroDonut({ consumed }: { consumed: DailyProgressProps['consumed'] }) {
  const proteinCal = consumed.protein * 4;
  const carbsCal = consumed.carbohydrates * 4;
  const fatCal = consumed.fat * 9;
  const total = proteinCal + carbsCal + fatCal;

  const proteinPct = total > 0 ? (proteinCal / total) * 100 : 33;
  const carbsPct = total > 0 ? (carbsCal / total) * 100 : 33;
  const fatPct = total > 0 ? (fatCal / total) * 100 : 34;

  const circumference = 2 * Math.PI * 40;
  const proteinDash = (proteinPct / 100) * circumference;
  const carbsDash = (carbsPct / 100) * circumference;
  const fatDash = (fatPct / 100) * circumference;

  const proteinOffset = 0;
  const carbsOffset = -proteinDash;
  const fatOffset = -(proteinDash + carbsDash);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" stroke="#1a1a1a" strokeWidth="8" fill="none" />
          {/* Protein */}
          <circle
            cx="48" cy="48" r="40"
            stroke="#34d399" strokeWidth="8" fill="none"
            strokeLinecap="butt"
            strokeDasharray={`${proteinDash} ${circumference - proteinDash}`}
            strokeDashoffset={proteinOffset}
            className="transition-all duration-700 ease-out"
          />
          {/* Carbs */}
          <circle
            cx="48" cy="48" r="40"
            stroke="#fbbf24" strokeWidth="8" fill="none"
            strokeLinecap="butt"
            strokeDasharray={`${carbsDash} ${circumference - carbsDash}`}
            strokeDashoffset={carbsOffset}
            className="transition-all duration-700 ease-out"
          />
          {/* Fat */}
          <circle
            cx="48" cy="48" r="40"
            stroke="#f87171" strokeWidth="8" fill="none"
            strokeLinecap="butt"
            strokeDasharray={`${fatDash} ${circumference - fatDash}`}
            strokeDashoffset={fatOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-neutral-100">{Math.round(consumed.calories)}</span>
          <span className="text-[10px] text-neutral-500">cal</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-neutral-400">Protein</span>
          </div>
          <span className="text-sm font-semibold text-emerald-400">{Math.round(consumed.protein)}g</span>
          <span className="text-[10px] text-neutral-600">{Math.round(proteinPct)}%</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] text-neutral-400">Carbs</span>
          </div>
          <span className="text-sm font-semibold text-amber-400">{Math.round(consumed.carbohydrates)}g</span>
          <span className="text-[10px] text-neutral-600">{Math.round(carbsPct)}%</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[11px] text-neutral-400">Fat</span>
          </div>
          <span className="text-sm font-semibold text-red-400">{Math.round(consumed.fat)}g</span>
          <span className="text-[10px] text-neutral-600">{Math.round(fatPct)}%</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Flip-card UI
 */
export function DailyProgress({ consumed, goals }: DailyProgressProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="cursor-pointer relative" onClick={() => setFlipped(!flipped)}>
      {/* Front — Ring + Bars */}
      <div
        className={`bg-neutral-900 border border-neutral-800 rounded-3xl p-5 relative overflow-hidden shadow-lg transition-opacity duration-300 ${flipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
      >
        <div className="relative z-10">
          <div className="flex justify-center mb-5">
            <ProgressRing
              value={consumed.calories}
              max={goals?.calorie_goal || 0}
              label="Calories"
              color="#818cf8"
            />
          </div>

          <div className="space-y-3">
            <MacroBar value={consumed.protein} max={goals?.protein_goal || 0} label="Protein" color="#34d399" unit="g" />
            <MacroBar value={consumed.carbohydrates} max={goals?.carbohydrate_goal || 0} label="Carbs" color="#fbbf24" unit="g" />
            <MacroBar value={consumed.fat} max={goals?.fat_goal || 0} label="Fat" color="#f87171" unit="g" />
          </div>

          <p className="text-center text-neutral-700 text-[10px] mt-3">Tap for macro breakdown</p>
        </div>
      </div>

      {/* Back — Donut Chart (absolutely placed on top) */}
      <div
        className={`absolute inset-0 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 flex flex-col items-center justify-center overflow-hidden shadow-lg transition-opacity duration-300 ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <p className="text-xs font-medium text-neutral-400 mb-3">Macro Distribution</p>
          <MacroDonut consumed={consumed} />
          <p className="text-center text-neutral-700 text-[10px] mt-3">Tap to go back</p>
        </div>
      </div>
    </div>
  );
}

