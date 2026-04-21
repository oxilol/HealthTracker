"use client";

import { useState } from 'react';
import { ExerciseSet } from '../../../types/workout';
import { SwipeableCard } from '../../../components/SwipeableCard';

interface ExerciseCardProps {
  exerciseName: string;
  sets: ExerciseSet[];
  previousSets?: ExerciseSet[];
  onAddSet: (exerciseName: string, weight: number | null, reps: number | null) => Promise<ExerciseSet | null>;
  onDeleteSet: (setId: string) => Promise<void>;
  isReadOnly?: boolean;
  index?: number;
}

const GRADIENT_COLORS = [
  'bg-indigo-500/10',
  'bg-emerald-500/10',
  'bg-amber-500/10',
  'bg-rose-500/10',
  'bg-fuchsia-500/10',
  'bg-sky-500/10',
  'bg-teal-500/10',
  'bg-purple-500/10',
];

export function ExerciseCard({ exerciseName, sets, previousSets = [], onAddSet, onDeleteSet, isReadOnly, index }: ExerciseCardProps) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddSet = async () => {
    setAdding(true);
    await onAddSet(
      exerciseName,
      weight ? parseFloat(weight) : null,
      reps ? parseInt(reps) : null
    );
    // Keep the previous values so the user can quickly log similar sets
    setAdding(false);
  };

  // Generate a stable color index based on the sequential index, falling back to string hash
  const hash = index !== undefined ? index : exerciseName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorClass = GRADIENT_COLORS[hash % GRADIENT_COLORS.length];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden relative shadow-lg">
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* Exercise header */}
        <div className="px-4 py-3 border-b border-neutral-800/50">
          <h3 className="text-sm font-semibold text-neutral-100">{exerciseName}</h3>
          {previousSets.length > 0 && !isReadOnly && (
            <p className="text-[10px] font-medium text-neutral-500 mt-1 flex items-center gap-1.5 truncate">
              <svg className="w-3 h-3 text-neutral-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span>Prev: {previousSets.map(s => `${s.weight || 0}x${s.repetitions || 0}`).join(', ')}</span>
            </p>
          )}
        </div>

        {/* Set list */}
        <div className="divide-y divide-neutral-800/30">
          {sets.length === 0 && (
            <p className="text-center text-neutral-600 text-xs py-4">No sets logged yet</p>
          )}

          {sets.map((s) => {
            const content = (
              <div className="flex items-center px-4 py-2.5 gap-4">
                <span className="text-xs text-neutral-600 font-mono w-6">#{s.set_number}</span>
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-neutral-200">
                      {s.weight != null ? s.weight : '—'}
                    </span>
                    <span className="text-[10px] text-neutral-500">lbs</span>
                  </div>
                  <span className="text-neutral-700">×</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-neutral-200">
                      {s.repetitions != null ? s.repetitions : '—'}
                    </span>
                    <span className="text-[10px] text-neutral-500">reps</span>
                  </div>
                </div>
              </div>
            );

            if (isReadOnly) {
              return <div key={s.id}>{content}</div>;
            }

            return (
              <SwipeableCard key={s.id} id={s.id} onDelete={onDeleteSet}>
                {content}
              </SwipeableCard>
            );
          })}
        </div>

        {/* Quick-add row */}
        {!isReadOnly && (
          <div className="flex items-center gap-2 px-4 py-3 border-t border-neutral-800/50 bg-neutral-900/50">
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
              <span className="absolute right-2 top-3.5 text-[10px] text-neutral-600">lbs</span>
            </div>
            <span className="text-neutral-600 text-xs">×</span>
            <div className="relative flex-1">
              <input
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
              <span className="absolute right-2 top-3.5 text-[10px] text-neutral-600">reps</span>
            </div>
            <button
              onClick={handleAddSet}
              disabled={adding}
              className="px-3 py-3 text-xs font-medium text-white bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-md border border-indigo-500/30 rounded-xl transition-colors active:scale-95 disabled:opacity-50 min-w-[48px] shadow-sm"
            >
              {adding ? '...' : '+'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
