"use client";

import { useState } from 'react';
import { useLocationManager } from '../hooks/useLocationManager';

interface LocationPickerModalProps {
  onClose: () => void;
}

export function LocationPickerModal({ onClose }: LocationPickerModalProps) {
  const {
    locations,
    loading,
    currentLocationId,
    creating,
    selectLocation,
    createLocation,
    removeLocation
  } = useLocationManager();
  
  const [newName, setNewName] = useState('');

  const handleCreate = async () => {
    const success = await createLocation(newName);
    if (success) {
      setNewName('');
    }
  };

  const handleSelect = async (id: string | null) => {
    await selectLocation(id);
    onClose();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await removeLocation(id);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl animate-scale-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-100">Gym Location</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Templates and stats are scoped per location</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-white transition-colors rounded-full bg-neutral-800/50 hover:bg-neutral-800"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Location list */}
        <div className="px-4 py-4 space-y-2 max-h-72 overflow-y-auto">
          {/* "All" option */}
          <button
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-left ${currentLocationId === null
              ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
              : 'bg-neutral-800/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }`}
          >
            <span className="text-sm font-medium">All locations</span>
            {currentLocationId === null && (
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            )}
          </button>

          {loading ? (
            <div className="space-y-2 pt-1">
              {[1, 2].map((i) => <div key={i} className="skeleton h-12 w-full rounded-2xl" />)}
            </div>
          ) : (
            locations.map((loc) => (
              <div
                key={loc.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(loc.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(loc.id); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all cursor-pointer select-none ${currentLocationId === loc.id
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                  : 'bg-neutral-800/50 border-neutral-800 text-neutral-200 hover:border-neutral-700'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-neutral-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <span className="text-sm font-medium">{loc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentLocationId === loc.id && (
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                  <button
                    onClick={(e) => handleDelete(loc.id, e)}
                    className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                    aria-label={`Delete ${loc.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}

        </div>

        {/* Create new location */}
        <div className="px-4 pb-6 pt-2 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 mb-3 pt-3">New location</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              placeholder="e.g. Montreal Gym"
              className="flex-1 bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-600"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors disabled:opacity-40 active:scale-95"
            >
              {creating ? '...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
