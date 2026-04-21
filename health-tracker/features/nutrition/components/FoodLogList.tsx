"use client";

import { NutritionLog } from '../../../types/nutrition';
import { SwipeableCard } from '../../../components/SwipeableCard';

interface FoodLogListProps {
  logs: NutritionLog[];
  onDelete: (id: string) => void;
}

export function FoodLogList({ logs, onDelete }: FoodLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-neutral-600 text-xl">🍽️</span>
        </div>
        <p className="text-neutral-500 text-sm">No foods logged today</p>
        <p className="text-neutral-600 text-xs mt-1">Tap + to add your first entry</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => {
        const isMeal = !!log.meal_id;
        const isQuickAdd = !log.food_id && !log.meal_id;
        const name = log.name || log.food?.name || log.meal?.name || 'Quick Add';

        return (
          <SwipeableCard key={log.id} id={log.id} onDelete={onDelete}>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${isMeal
                    ? 'bg-amber-500/10 border border-amber-500/20'
                    : isQuickAdd
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-indigo-500/10 border border-indigo-500/20'
                  }`}>
                  <span className="text-base">{isMeal ? '🍱' : isQuickAdd ? '⚡' : '🍽️'}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-100 truncate">{name}</p>
                    <span className="text-sm font-bold text-indigo-400 shrink-0">
                      {Math.round(log.calories)}
                      <span className="text-[10px] font-normal text-indigo-400/60 ml-0.5">cal</span>
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 mt-0.5">
                    {log.quantity} {log.unit}
                  </p>

                  <div className="flex gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/15 rounded-lg px-2 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-medium text-emerald-400">
                        {Math.round(log.protein)}g
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/15 rounded-lg px-2 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-[11px] font-medium text-amber-400">
                        {Math.round(log.carbohydrates)}g
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/15 rounded-lg px-2 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span className="text-[11px] font-medium text-red-400">
                        {Math.round(log.fat)}g
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwipeableCard>
        );
      })}
      <p className="text-center text-neutral-700 text-[10px] pt-2 pb-4">
        ← Swipe left to delete
      </p>
    </div>
  );
}
