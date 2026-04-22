"use client";

import { useState } from 'react';
import { useStats } from '../hooks/useStats';
import { NutritionChart } from './NutritionChart';
import { WeightChart } from './WeightChart';
import { ActivityChart } from './ActivityChart';
import { ExerciseMaxChart } from './ExerciseMaxChart';
import { DynamicCompareChart } from './DynamicCompareChart';

const RANGES = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

export function StatsDashboard() {
  const [days, setDays] = useState(30);
  const { stats, loading } = useStats(days);

  return (
    <div className="min-h-screen py-6 px-4 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-100">Statistics</h1>
        <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${days === r.value
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-300'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 pb-12">
          <div className="skeleton h-64 w-full rounded-3xl" />
          <div className="skeleton h-64 w-full rounded-3xl" />
          <div className="skeleton h-48 w-full rounded-3xl" />
          <div className="skeleton h-48 w-full rounded-3xl" />
          <div className="skeleton h-48 w-full rounded-3xl" />
        </div>
      ) : stats.length === 0 ? (
        <p className="text-center text-neutral-500 py-10">No data available for this range.</p>
      ) : (
        <div className="space-y-6 animate-fade-in pb-12">
          {/* Dynamic Interactive Cards First */}
          <DynamicCompareChart data={stats} />
          <ExerciseMaxChart days={days} stats={stats} />

          <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-800 to-transparent my-6" />

          {/* Standard Tracker Cards */}
          <WeightChart data={stats} />
          <NutritionChart data={stats} />
          <ActivityChart data={stats} />
        </div>
      )}
    </div>
  );
}
