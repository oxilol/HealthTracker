"use client";

import { WorkoutTemplate } from '../../../types/workout';
import { SwipeableCard } from '../../../components/SwipeableCard';

interface TemplateListProps {
  templates: WorkoutTemplate[];
  onStart: (template: WorkoutTemplate) => void;
  onEdit: (template: WorkoutTemplate) => void;
  onDelete: (id: string) => Promise<void>;
  hideStartButton?: boolean;
  locationFiltered?: boolean;
}

export function TemplateList({ templates, onStart, onEdit, onDelete, hideStartButton, locationFiltered }: TemplateListProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">{locationFiltered ? '📍' : '💪'}</span>
        </div>
        <p className="text-neutral-400 text-sm">
          {locationFiltered ? 'No templates for this location' : 'No workout templates yet'}
        </p>
        <p className="text-neutral-600 text-xs mt-1">
          {locationFiltered
            ? 'Tap the settings gear → Create Template to add one for this gym'
            : 'Create a template to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {templates.map((template, i) => (
        <SwipeableCard key={template.id} id={template.id} onDelete={onDelete}>
          <div className="flex items-center p-4" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-neutral-100 truncate">{template.name}</p>
                <span className="text-[10px] text-neutral-600 bg-neutral-800 px-1.5 py-0.5 rounded-md shrink-0">
                  {template.exercises?.length || 0} exercises
                </span>
              </div>
              {template.exercises && template.exercises.length > 0 && (
                <p className="text-[11px] text-neutral-500 truncate">
                  {template.exercises.map((e) => e.exercise_name).join(' · ')}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                onClick={() => onEdit(template)}
                className="p-2.5 text-neutral-600 hover:text-indigo-400 transition-colors"
                aria-label={`Edit ${template.name}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </button>
              {!hideStartButton && (
                <button
                  onClick={() => onStart(template)}
                  className="p-2.5 flex items-center justify-center w-9 h-9 text-white bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-md border border-indigo-500/30 rounded-xl transition-colors active:scale-95 shadow-sm"
                  aria-label="Start Workout"
                >
                  <svg className="w-4 h-4 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </SwipeableCard>
      ))}

      <p className="text-center text-neutral-700 text-[10px] pt-2">
        ← Swipe left to delete
      </p>
    </div>
  );
}
