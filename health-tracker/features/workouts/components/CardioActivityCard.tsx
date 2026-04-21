"use client";

import { useState } from 'react';
import { CardioLog } from '../../../types/cardio';
import { SwipeableCard } from '../../../components/SwipeableCard';

interface CardioActivityCardProps {
  index: number;
  activityName: string;
  logs: CardioLog[];
  onAddLog: (
    activityName: string,
    durationMinutes: number | null,
    distanceKm: number | null
  ) => Promise<CardioLog | null>;
  onDeleteLog: (logId: string) => Promise<void>;
  isReadOnly?: boolean;
}

export function CardioActivityCard({
  index,
  activityName,
  logs,
  onAddLog,
  onDeleteLog,
  isReadOnly,
}: CardioActivityCardProps) {
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddLog = async () => {
    const dur = duration ? parseFloat(duration) : null;
    const dist = distance ? parseFloat(distance) : null;
    if (!dur && !dist) return;
    setAdding(true);
    await onAddLog(activityName, dur, dist);
    setDuration('');
    setDistance('');
    setAdding(false);
  };

  const delayClass = ['', 'animate-fade-in-up-1', 'animate-fade-in-up-2', 'animate-fade-in-up-3'][
    Math.min(index, 3)
  ];

  return (
    <div
      className={`bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-sm ${delayClass}`}
    >
      {/* Activity header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <svg
              className="w-3.5 h-3.5 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-neutral-100">{activityName}</h3>
        </div>
      </div>

      {/* Logged entries */}
      {logs.length > 0 && (
        <div className="px-4 pb-2 space-y-1.5">
          {/* Column headers */}
          <div className="flex items-center gap-2 px-2 pb-0.5">
            <span className="text-[10px] font-medium text-neutral-600 w-6 text-center">#</span>
            <span className="text-[10px] font-medium text-cyan-600/70 flex-1 text-center">
              Duration (min)
            </span>
            <span className="text-[10px] font-medium text-indigo-600/70 flex-1 text-center">
              Distance (km)
            </span>
            <span className="w-8" />
          </div>
          {logs.map((log, i) => (
            <SwipeableCard
              key={log.id}
              id={log.id}
              onDelete={() => onDeleteLog(log.id)}
              noStyling
            >
              <div className="flex items-center gap-2 bg-neutral-800/40 rounded-xl px-3 py-2">
                <span className="text-xs text-neutral-600 w-4 text-center font-medium">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-semibold text-cyan-400 text-center">
                  {log.duration_minutes != null ? log.duration_minutes : '—'}
                </span>
                <span className="flex-1 text-sm font-semibold text-indigo-400 text-center">
                  {log.distance_km != null ? log.distance_km : '—'}
                </span>
                <span className="w-8" />
              </div>
            </SwipeableCard>
          ))}
        </div>
      )}

      {/* Quick-add row */}
      {!isReadOnly && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-neutral-800/50 bg-neutral-900/50">
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="decimal"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
            <span className="absolute right-2 top-3.5 text-[10px] text-neutral-600">min</span>
          </div>
          <span className="text-neutral-600 text-xs">+</span>
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="decimal"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 text-sm text-center focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
            <span className="absolute right-2 top-3.5 text-[10px] text-neutral-600">km</span>
          </div>
          <button
            onClick={handleAddLog}
            disabled={adding || (!duration && !distance)}
            className="px-3 py-3 text-xs font-medium text-white bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-md border border-cyan-500/30 rounded-xl transition-colors active:scale-95 disabled:opacity-50 min-w-[48px] shadow-sm"
          >
            {adding ? '...' : '+'}
          </button>
        </div>
      )}
    </div>
  );
}
