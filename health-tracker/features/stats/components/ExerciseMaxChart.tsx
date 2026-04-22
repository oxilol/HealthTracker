"use client";

import { useState } from 'react';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useExerciseMaxes } from '../hooks/useExerciseMaxes';
import { DailyStats } from '../hooks/useStats';

export function ExerciseMaxChart({ days, stats, locationId }: { days: number, stats: DailyStats[], locationId?: string | null }) {
  const { exercises, selectedExercise, setSelectedExercise, maxData, loading } = useExerciseMaxes(days, locationId);
  const [showCalories, setShowCalories] = useState(false);

  if (loading) {
    return <div className="skeleton h-[300px] w-full rounded-3xl" />;
  }

  // Don't show card if no exercises logged
  if (exercises.length === 0) {
    return null;
  }

  // Merge calories
  const combinedData = maxData.map(d => ({
    ...d,
    calories: stats.find(s => s.date === d.date)?.calories || null
  }));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
            </div>
            Exercise Max Weight
          </h3>
          <p className="text-xs text-neutral-500 mt-1">Track your heaviest sets over time.</p>
        </div>

        {/* Controls Container */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCalories(!showCalories)}
            className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1.5 rounded-lg border transition-colors shrink-0 ${showCalories
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-neutral-800 text-neutral-500 border-neutral-700 hover:text-neutral-300'
              }`}
          >
            + Cals
          </button>

          {/* Dropdown Selector */}
          <select
            value={selectedExercise || ''}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500/50 appearance-none drop-shadow-sm min-w-[140px]"
          >
            {exercises.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} className="focus:outline-none">
          <ComposedChart data={combinedData} margin={{ top: 10, right: 10, left: 5, bottom: 0 }} style={{ outline: 'none' }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
            <defs>
              <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickFormatter={(date) => {
                const [, m, d] = date.split('-');
                return `${m}/${d}`;
              }}
              dy={10}
            />
            <YAxis
              yAxisId="left"
              domain={['dataMin - 10', 'dataMax + 20']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              dx={-2}
              width={45}
            />
            {showCalories && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                dx={5}
                width={35}
              />
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(23, 23, 23, 0.8)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                fontSize: '12px',
                color: '#fff',
              }}
              labelStyle={{ color: '#a3a3a3', marginBottom: '4px' }}
              itemStyle={{ fontWeight: 600 }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="maxWeight"
              name="Max LBS"
              stroke="#f97316"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorMax)"
              connectNulls
              activeDot={{ r: 6 }}
              dot={{ r: 4, fill: '#f97316', strokeWidth: 0 }}
            />
            {showCalories && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="calories"
                name="Calories"
                stroke="#10b981"
                strokeWidth={2.5}
                connectNulls
                activeDot={{ r: 6 }}
                dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
