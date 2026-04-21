"use client";

import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { useWorkoutStore } from '../../../store/workoutStore';
import { TemplateList } from './TemplateList';

export function TemplateSettingsModal() {
  const { templates, loading, deleteTemplate } = useWorkoutTemplates();
  const {
    showTemplateSettings,
    setShowTemplateSettings,
    setShowCreateTemplate,
    setEditingTemplate,
  } = useWorkoutStore();

  if (!showTemplateSettings) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-sm flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950/50">
        <button
          onClick={() => setShowTemplateSettings(false)}
          className="p-3 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-neutral-100">Workout Templates</h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scroll-touch p-4 space-y-6">
        <button
          onClick={() => setShowCreateTemplate(true)}
          className="w-full py-3.5 rounded-2xl text-sm font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
        >
          + Create New Template
        </button>

        <div>
          <h3 className="text-sm font-medium text-neutral-500 mb-3 px-1 text-center">Your Templates</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <TemplateList
              templates={templates}
              onStart={() => { }}
              onEdit={setEditingTemplate}
              onDelete={deleteTemplate}
              hideStartButton
            />
          )}
        </div>
      </div>
    </div>
  );
}
