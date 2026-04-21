import { useEffect, useState } from 'react';
import { useHealthSyncToken } from '../hooks/useHealthSyncToken';
import { useHealthStore } from '../../../store/healthStore';

const STEP_GOAL_KEY = 'step_goal';
const DEFAULT_STEP_GOAL = 10000;

// TODO: move to DB
function readStepGoal(): number {
  if (typeof window === 'undefined') return DEFAULT_STEP_GOAL;
  const v = parseInt(localStorage.getItem(STEP_GOAL_KEY) || '', 10);
  return isNaN(v) || v <= 0 ? DEFAULT_STEP_GOAL : v;
}

export function HealthSyncSettingsModal() {
  const { showSettingsModal, setShowSettingsModal } = useHealthStore();
  const { token, loading, error, fetchToken, generateNewToken } = useHealthSyncToken();

  const [stepGoalInput, setStepGoalInput] = useState('');

  useEffect(() => {
    if (showSettingsModal) {
      fetchToken();
      setStepGoalInput(String(readStepGoal()));
    }
  }, [showSettingsModal, fetchToken]);

  // TODO: move to DB
  const saveStepGoal = (raw: string) => {
    const val = parseInt(raw, 10);
    if (!isNaN(val) && val > 0) {
      localStorage.setItem(STEP_GOAL_KEY, String(val));
      // Notify same-tab listeners (storage events only fire cross-tab)
      window.dispatchEvent(new Event('storage'));
    }
  };

  if (!showSettingsModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setShowSettingsModal(false)}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl animate-scale-up max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header — stays fixed at top */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-800 shrink-0">
          <h2 className="text-xl font-bold text-neutral-100">Health Settings</h2>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="p-2 text-neutral-500 hover:text-white transition-colors active:scale-95 bg-neutral-800/50 hover:bg-neutral-800 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <div className="space-y-6">
            {/* Step Goal */}
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-1 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                </svg>
                Daily Step Goal
              </h3>
              <p className="text-xs text-neutral-600 mb-3">Sets the target for progress bars on the weekly overview.</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  value={stepGoalInput}
                  onChange={(e) => setStepGoalInput(e.target.value)}
                  onBlur={(e) => saveStepGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveStepGoal(e.currentTarget.value);
                      e.currentTarget.blur();
                    }
                  }}
                  className="flex-1 bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all placeholder:text-neutral-600"
                  placeholder="e.g. 10000"
                />
                <span className="text-sm text-neutral-500 shrink-0">steps/day</span>
              </div>
            </div>

            <div className="border-t border-neutral-800" />

            {/* Sync Token */}
            <div>
              <h3 className="text-sm font-medium text-neutral-400 mb-2">Apple Health Integration</h3>
              <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
                Use the token below to securely authenticate your Apple Health data provider. This acts as your integration API Key.
              </p>

              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4">
                <p className="text-xs font-medium text-neutral-500 mb-2">YOUR SYNC TOKEN</p>

                {loading ? (
                  <div className="h-6 w-3/4 bg-neutral-800 animate-pulse rounded" />
                ) : error ? (
                  <p className="text-sm text-rose-500">{error}</p>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-sm text-emerald-400 font-mono break-all">
                      {token || 'Not generated'}
                    </code>
                    {token && (
                      <button
                        onClick={() => navigator.clipboard.writeText(token)}
                        className="p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-xl transition-colors active:scale-95 flex-shrink-0"
                        title="Copy to clipboard"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={generateNewToken}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-md border border-indigo-500/30 transition-colors active:scale-[0.98] shadow-sm"
            >
              {token ? 'Regenerate Token' : 'Generate Token'}
            </button>

            {token && (
              <p className="text-xs text-neutral-500 text-center">
                Regenerating will revoke access from your currently configured integration.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
