"use client";

import { CardioTemplate } from '../../../types/cardio';
import { SwipeableCard } from '../../../components/SwipeableCard';

interface CardioTemplateListProps {
  templates: CardioTemplate[];
  onStart: (template: CardioTemplate) => void;
  onEdit: (template: CardioTemplate) => void;
  onDelete: (id: string) => void;
  hideStartButton?: boolean;
}

export function CardioTemplateList({
  templates,
  onStart,
  onEdit,
  onDelete,
  hideStartButton,
}: CardioTemplateListProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-neutral-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
            />
          </svg>
        </div>
        <p className="text-neutral-500 text-sm">No cardio templates yet.</p>
        <p className="text-neutral-600 text-xs mt-1">
          Tap the settings icon to create one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {templates.map((template) => (
        <SwipeableCard
          key={template.id}
          id={template.id}
          onDelete={() => onDelete(template.id)}
          noStyling
        >
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-100 truncate">
                {template.name}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {template.activities?.length ?? 0} activities
              </p>
            </div>
            <button
              onClick={() => onEdit(template)}
              className="p-2 text-neutral-500 hover:text-neutral-300 transition-colors shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                />
              </svg>
            </button>
            {!hideStartButton && (
              <button
                onClick={() => onStart(template)}
                className="p-2.5 flex items-center justify-center w-9 h-9 text-white bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-md border border-cyan-500/30 rounded-xl transition-colors active:scale-95 shadow-sm"
                aria-label="Start Cardio"
              >
                <svg className="w-4 h-4 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </SwipeableCard>
      ))}
    </div>
  );
}
