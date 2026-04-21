"use client";

import { useCardioTemplates } from '../hooks/useCardioTemplates';
import { useWorkoutStore } from '../../../store/workoutStore';
import { CardioTemplateList } from './CardioTemplateList';

export function CardioSettingsModal() {
  const { templates, loading, deleteTemplate } = useCardioTemplates();
  const {
    showCardioSettings,
    setShowCardioSettings,
    setShowCreateCardioTemplate,
    setEditingCardioTemplate,
  } = useWorkoutStore();

  if (!showCardioSettings) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-sm flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950/50">
        <button
          onClick={() => setShowCardioSettings(false)}
          className="p-3 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-neutral-100">Cardio Templates</h2>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scroll-touch p-4 space-y-6">
        <button
          onClick={() => setShowCreateCardioTemplate(true)}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
        >
          + Create New Cardio Template
        </button>

        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-3 px-1 text-center">
            Your Templates
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <CardioTemplateList
              templates={templates}
              onStart={() => { }}
              onEdit={setEditingCardioTemplate}
              onDelete={deleteTemplate}
              hideStartButton
            />
          )}
        </div>
      </div>
    </div>
  );
}
