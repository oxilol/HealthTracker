"use client";

import { useState, useEffect } from 'react';
import { useWorkoutStore } from '../../../store/workoutStore';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { useLocationStore } from '../../../store/locationStore';
import { useGymLocations } from '../hooks/useGymLocations';

interface ExerciseEntry {
  exercise_name: string;
  exercise_order: number;
}

export function CreateTemplateForm() {
  const { showCreateTemplate, editingTemplate, setShowCreateTemplate, setEditingTemplate } = useWorkoutStore();
  const { createTemplate, updateTemplate } = useWorkoutTemplates();
  const { currentLocationId } = useLocationStore();
  const { locations } = useGymLocations();

  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingTemplate;

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name);
      setExercises(
        (editingTemplate.exercises || []).map((e) => ({
          exercise_name: e.exercise_name,
          exercise_order: e.exercise_order,
        }))
      );
    }
  }, [editingTemplate]);

  if (!showCreateTemplate) return null;

  const handleClose = () => {
    setName('');
    setExercises([]);
    setNewExerciseName('');
    setEditingTemplate(null);
    setShowCreateTemplate(false);
  };

  const addExercise = () => {
    const trimmed = newExerciseName.trim();
    if (!trimmed) return;

    setExercises((prev) => [
      ...prev,
      { exercise_name: trimmed, exercise_order: prev.length + 1 },
    ]);
    setNewExerciseName('');
  };

  const removeExercise = (index: number) => {
    setExercises((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((e, i) => ({ ...e, exercise_order: i + 1 }))
    );
  };

  const moveExercise = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= exercises.length) return;

    setExercises((prev) => {
      const copy = [...prev];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy.map((e, i) => ({ ...e, exercise_order: i + 1 }));
    });
  };

  const handleSave = async () => {
    if (!name.trim() || exercises.length === 0) return;
    setSaving(true);

    if (isEditing && editingTemplate) {
      await updateTemplate(editingTemplate.id, name.trim(), exercises);
    } else {
      await createTemplate(name.trim(), exercises, currentLocationId);
    }

    setSaving(false);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-neutral-950/95 backdrop-blur-sm flex flex-col animate-fade-in">
      <div className="w-full max-w-md mx-auto flex flex-col h-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pt-6">
          <button onClick={handleClose} className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-neutral-100">
            {isEditing ? 'Edit Template' : 'New Template'}
          </h2>
          {!isEditing && currentLocationId && (() => {
            const loc = locations.find((l) => l.id === currentLocationId);
            return loc ? (
              <span className="ml-auto text-[11px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                📍 {loc.name}
              </span>
            ) : null;
          })()}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          {/* Template name */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1 ml-1">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Push Day A"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
              autoFocus
            />
          </div>

          {/* Exercises */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3">
            <p className="text-xs font-medium text-neutral-400 ml-1">Exercises</p>

            {exercises.length === 0 && (
              <p className="text-center text-neutral-600 text-xs py-4">No exercises added yet</p>
            )}

            {exercises.map((exercise, index) => (
              <div key={index} className="flex items-center gap-2 bg-neutral-800/50 rounded-xl p-3">
                <span className="text-xs text-neutral-600 font-mono w-5 text-center">{index + 1}</span>
                <p className="text-sm text-neutral-200 flex-1 truncate">{exercise.exercise_name}</p>

                <button
                  onClick={() => moveExercise(index, -1)}
                  disabled={index === 0}
                  className="p-1 text-neutral-600 hover:text-neutral-300 disabled:opacity-20 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => moveExercise(index, 1)}
                  disabled={index === exercises.length - 1}
                  className="p-1 text-neutral-600 hover:text-neutral-300 disabled:opacity-20 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => removeExercise(index)}
                  className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Add exercise input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addExercise();
                  }
                }}
                placeholder="Exercise name"
                className="flex-1 px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
              />
              <button
                onClick={addExercise}
                disabled={!newExerciseName.trim()}
                className="px-3 py-2.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 rounded-xl hover:bg-indigo-500/20 disabled:opacity-30 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || exercises.length === 0}
            className="w-full py-3 rounded-2xl text-sm font-medium text-white bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-md border border-indigo-500/30 disabled:opacity-40 transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Template' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
