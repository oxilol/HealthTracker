"use client";

import { useState, useEffect } from 'react';
import { useWorkoutStore } from '../../../store/workoutStore';
import { useCardioTemplates } from '../hooks/useCardioTemplates';

export function CreateCardioTemplateForm() {
  const {
    showCreateCardioTemplate,
    setShowCreateCardioTemplate,
    editingCardioTemplate,
    setEditingCardioTemplate,
  } = useWorkoutStore();

  const { createTemplate, updateTemplate } = useCardioTemplates();

  const [name, setName] = useState('');
  const [activities, setActivities] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingCardioTemplate;

  useEffect(() => {
    if (editingCardioTemplate) {
      setName(editingCardioTemplate.name);
      const acts = editingCardioTemplate.activities?.map((a) => a.activity_name) || [''];
      setActivities(acts.length > 0 ? acts : ['']);
    }
  }, [editingCardioTemplate]);

  if (!showCreateCardioTemplate) return null;

  const handleClose = () => {
    setName('');
    setActivities(['']);
    setEditingCardioTemplate(null);
    setShowCreateCardioTemplate(false);
  };

  const updateActivity = (index: number, value: string) => {
    setActivities((prev) => prev.map((a, i) => (i === index ? value : a)));
  };

  const addActivity = () => {
    setActivities((prev) => [...prev, '']);
  };

  const removeActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  };

  const moveActivity = (index: number, direction: 'up' | 'down') => {
    const arr = [...activities];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]];
    setActivities(arr);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    const validActivities = activities.map((a) => a.trim()).filter(Boolean);
    if (!trimmed || validActivities.length === 0) return;

    setSaving(true);
    const activityEntries = validActivities.map((activity_name, i) => ({
      activity_name,
      activity_order: i,
    }));

    if (isEditing && editingCardioTemplate) {
      await updateTemplate(editingCardioTemplate.id, trimmed, activityEntries);
    } else {
      await createTemplate(trimmed, activityEntries);
    }

    setSaving(false);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-neutral-950/95 backdrop-blur-sm flex flex-col animate-fade-in">
      <div className="w-full max-w-md mx-auto flex flex-col h-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pt-6">
          <button
            onClick={handleClose}
            className="p-3 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-neutral-100">
            {isEditing ? 'Edit Cardio Template' : 'New Cardio Template'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto scroll-touch px-4 pb-safe space-y-4">
          {/* Template name */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1 ml-1">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Run"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-sm"
              autoFocus
            />
          </div>

          {/* Activities */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-4 space-y-3 shadow-lg">
            <div className="w-full h-full space-y-3">
              <p className="text-xs font-medium text-neutral-400 ml-1">Activities</p>

              {activities.map((activity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveActivity(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 text-neutral-600 hover:text-neutral-400 disabled:opacity-30 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveActivity(index, 'down')}
                      disabled={index === activities.length - 1}
                      className="p-0.5 text-neutral-600 hover:text-neutral-400 disabled:opacity-30 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={activity}
                    onChange={(e) => updateActivity(index, e.target.value)}
                    placeholder={`Activity ${index + 1}`}
                    className="flex-1 px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  />
                  {activities.length > 1 && (
                    <button
                      onClick={() => removeActivity(index)}
                      className="p-2 text-neutral-600 hover:text-red-400 transition-colors shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addActivity}
                className="w-full py-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 border border-dashed border-cyan-500/30 hover:border-cyan-500/50 rounded-xl transition-colors"
              >
                + Add Activity
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || activities.every((a) => !a.trim())}
            className="w-full py-3 rounded-2xl text-sm font-medium text-white bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-md border border-cyan-500/30 disabled:opacity-40 transition-colors shadow-sm"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Template' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
