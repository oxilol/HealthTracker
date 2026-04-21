import { HealthMetrics, WeightLog } from '../../../types/health';
import { formatDisplayDate } from '../../../lib/dateUtils';

interface HealthDashboardProps {
  metrics: HealthMetrics | null;
  weight: WeightLog | null;
  lastLoggedWeight: WeightLog | null;
  logWeight: (val: number) => Promise<any>;
  isToday: boolean;
  loading: boolean;
}

/**
 * Renders the health metrics for the user on a selected day.
 */
export function HealthDashboard({ metrics, weight, lastLoggedWeight, logWeight, isToday, loading }: HealthDashboardProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-neutral-900 rounded-3xl w-full" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-neutral-900 rounded-3xl" />
          <div className="h-28 bg-neutral-900 rounded-3xl" />
        </div>
      </div>
    );
  }

  const hasData = metrics;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center mt-8">
        <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-neutral-200 font-medium mb-2 text-lg">No Health Data</h3>
        <p className="text-neutral-500 text-sm max-w-[250px] leading-relaxed">
          Open the settings cog (top right) to connect your Apple Health data via the HealthSync iOS app.
        </p>
      </div>
    );
  }

  // TODO: Move to DB
  const stepGoal = (() => {
    if (typeof window === 'undefined') return 10000;
    const v = parseInt(localStorage.getItem('step_goal') || '', 10);
    return isNaN(v) || v <= 0 ? 10000 : v;
  })();

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Activity Map */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h3 className="text-neutral-400 font-medium text-sm mb-1 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
              </svg>
              Activity
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-white tracking-tight">{(metrics?.steps || 0).toLocaleString()}</span>
              <span className="text-sm font-medium text-neutral-500">steps</span>
            </div>
            {/* Step progress bar */}
            <div className="mt-3 w-full">
              <div className="flex justify-between text-[10px] text-neutral-600 mb-1">
                <span>Daily Goal : {stepGoal.toLocaleString()} steps</span>
              </div>
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((metrics?.steps || 0) / stepGoal) * 100)}%` }}
                />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-lg font-semibold text-orange-400">{(metrics?.active_energy || 0).toLocaleString()}</span>
              <span className="text-xs font-medium text-neutral-500">kcal active</span>
            </div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />
          <h3 className="text-neutral-400 font-medium text-xs mb-2 flex items-center gap-1.5 relative z-10">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            Distance
          </h3>
          <div className="flex flex-col mt-2 relative z-10">
            <span className="text-2xl font-bold text-white tracking-tight">{metrics?.distance_km ? metrics.distance_km.toFixed(2) : '--'}</span>
            <span className="text-xs font-medium text-neutral-500 mt-0.5">km</span>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-sky-500/10 blur-2xl rounded-full pointer-events-none" />
          <h3 className="text-neutral-400 font-medium text-xs mb-2 flex items-center gap-1.5 relative z-10">
            <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
            Flights Climbed
          </h3>
          <div className="flex flex-col mt-2 relative z-10">
            <span className="text-2xl font-bold text-white tracking-tight">{metrics?.flights_climbed || '--'}</span>
            <span className="text-xs font-medium text-neutral-500 mt-0.5">floors</span>
          </div>
        </div>
      </div>

      {/* Weight Tracking */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink-500/10 blur-3xl rounded-full pointer-events-none" />
        <h3 className="text-neutral-400 font-medium text-sm flex items-center gap-1.5 mb-4 relative z-10">
          <svg className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="3" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8v3H8z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v.01" />
          </svg>
          Body Weight
        </h3>

        {/* Display logic */}
        <div className="flex flex-col mb-4 relative z-10">
          {weight ? (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white tracking-tight">{weight.weight}</span>
              <span className="text-sm font-medium text-neutral-500">lbs</span>
            </div>
          ) : lastLoggedWeight ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-neutral-300 tracking-tight">{lastLoggedWeight.weight}</span>
                <span className="text-sm font-medium text-neutral-500">lbs</span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Last logged: {formatDisplayDate(lastLoggedWeight.date)}
              </div>
            </div>
          ) : (
            <span className="text-neutral-500 text-sm">No weight logged yet</span>
          )}
        </div>

        {/* Logging input (Only show if date is today and they want to log or update) */}
        {isToday && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-neutral-800/50 relative z-10">
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              placeholder="Enter weight (lbs)"
              className="w-full bg-neutral-950 border border-neutral-800 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all placeholder:text-neutral-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  logWeight(parseFloat(e.currentTarget.value));
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input.value) {
                  logWeight(parseFloat(input.value));
                  input.value = '';
                }
              }}
              className="bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 px-4 py-3.5 rounded-xl text-sm font-bold transition-colors shrink-0 min-w-[56px]"
            >
              Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
