"use client";

import { useState } from 'react';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DailyStats } from '../hooks/useStats';

const METRICS = [
  { key: 'calories', label: 'Calories', color: '#10b981' },
  { key: 'protein', label: 'Protein (g)', color: '#34d399' },
  { key: 'weight', label: 'Body Weight', color: '#f472b6' },
  { key: 'steps', label: 'Steps', color: '#06b6d4' },
  { key: 'activeEnergy', label: 'Active kcal', color: '#f97316' },
];

export function DynamicCompareChart({ data }: { data: DailyStats[] }) {
  const [metricA, setMetricA] = useState(METRICS[2].key); // Default 1: Body Weight
  const [metricB, setMetricB] = useState(METRICS[0].key); // Default 2: Calories

  if (!data || data.length === 0) return null;

  const confA = METRICS.find((m) => m.key === metricA)!;
  const confB = METRICS.find((m) => m.key === metricB)!;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col mb-2">
        <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          Compare Metrics
        </h3>

        <div className="flex items-center gap-2 w-full">
          {/* Dropdown A */}
          <select
            value={metricA}
            onChange={(e) => setMetricA(e.target.value)}
            className="flex-1 min-w-0 bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-2.5 py-2 outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none drop-shadow-sm truncate"
            style={{ color: confA.color }}
          >
            {METRICS.map((m) => (
              <option key={m.key} value={m.key}>{m.label} (Area)</option>
            ))}
          </select>
          <span className="text-neutral-600 text-[10px] font-bold uppercase shrink-0">vs</span>
          {/* Dropdown B */}
          <select
            value={metricB}
            onChange={(e) => setMetricB(e.target.value)}
            className="flex-1 min-w-0 bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-2.5 py-2 outline-none focus:ring-1 focus:ring-indigo-500/50 appearance-none drop-shadow-sm truncate text-right"
            style={{ color: confB.color }}
          >
            {METRICS.map((m) => (
              <option key={m.key} value={m.key}>{m.label} (Line)</option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} className="focus:outline-none">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 5, bottom: 0 }} style={{ outline: 'none' }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
            <defs>
              <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={confA.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={confA.color} stopOpacity={0} />
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
            {/* Axis A - Left */}
            <YAxis
              yAxisId="left"
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              dx={-2}
              width={45}
            />
            {/* Axis B - Right */}
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
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(23, 23, 23, 0.8)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                fontSize: '12px',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
              labelStyle={{ color: '#a3a3a3', marginBottom: '4px' }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey={confA.key}
              name={confA.label}
              stroke={confA.color}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorA)"
              connectNulls
              activeDot={{ r: 6 }}
              dot={{ r: 3, fill: confA.color, strokeWidth: 0 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={confB.key}
              name={confB.label}
              stroke={confB.color}
              strokeWidth={2.5}
              connectNulls
              activeDot={{ r: 6 }}
              dot={{ r: 3, fill: confB.color, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
