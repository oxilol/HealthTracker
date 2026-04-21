"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DailyStats } from '../hooks/useStats';

export function WeightChart({ data }: { data: DailyStats[] }) {
  // Filter out days where no weight was logged for the chart trend, but we might want to connect gaps
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
            <svg className="w-3.5 h-3.5 text-pink-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="3" strokeLinecap="round" strokeLinejoin="round" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8v3H8z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v.01" />
            </svg>
          </div>
          Body Weight Trend
        </h3>
        <p className="text-xs text-neutral-500 mt-1">Weight over time (lbs).</p>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} className="focus:outline-none">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} style={{ outline: 'none' }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
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
              domain={['dataMin - 2', 'dataMax + 2']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              dx={-5}
              width={45}
            />
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
              itemStyle={{ fontWeight: 600, color: '#f472b6' }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="weight"
              name="Weight (lbs)"
              stroke="#f472b6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorWeight)"
              connectNulls
              activeDot={{ r: 6 }}
              dot={{ r: 3, fill: '#f472b6', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
