"use client";

import { ResponsiveContainer, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ComposedChart } from 'recharts';
import { DailyStats } from '../hooks/useStats';

export function NutritionChart({ data }: { data: DailyStats[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
          </div>
          Calories & Protein
        </h3>
        <p className="text-xs text-neutral-500 mt-1">Calorie intake (bars) vs Protein intake (line).</p>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} className="focus:outline-none">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 5, bottom: 0 }} style={{ outline: 'none' }}>
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
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              dx={-2}
              width={45}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
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
              itemStyle={{ fontWeight: 600 }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Bar yAxisId="left" dataKey="calories" name="Calories (kcal)" fill="rgba(16, 185, 129, 0.3)" radius={[4, 4, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="protein" name="Protein (g)" stroke="#34d399" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#34d399' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
