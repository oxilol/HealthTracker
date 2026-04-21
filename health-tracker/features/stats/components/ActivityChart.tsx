"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DailyStats } from '../hooks/useStats';

export function ActivityChart({ data }: { data: DailyStats[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
            </svg>
          </div>
          Daily Activity
        </h3>
        <p className="text-xs text-neutral-500 mt-1">Steps tracked daily.</p>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} className="focus:outline-none">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 5, bottom: 0 }} style={{ outline: 'none' }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
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
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              dx={-2}
              width={45}
            />
            <Tooltip
              cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
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
              itemStyle={{ fontWeight: 600, color: '#22d3ee' }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar dataKey="steps" name="Steps" fill="rgba(6, 182, 212, 0.5)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
