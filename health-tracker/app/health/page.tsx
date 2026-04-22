"use client";

import { useState } from 'react';
import { todayLocalStr, addDays, formatDisplayDate } from '../../lib/dateUtils';
import { useHealthData } from '../../features/health/hooks/useHealthData';
import { useWeightData } from '../../features/health/hooks/useWeightData';
import { useHealthStore } from '../../store/healthStore';
import { useStepGoal } from '../../features/health/hooks/useStepGoal';
import { HealthDashboard } from '../../features/health/components/HealthDashboard';
import { HealthCalendar } from '../../features/health/components/HealthCalendar';
import { HealthSyncSettingsModal } from '../../features/health/components/HealthSyncSettingsModal';

// Main Health Dashboard : Health metrics and weight tracking

export default function HealthPage() {
  // Manage local UI state for date navigation and calendar visibility
  const todayStr = todayLocalStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showCalendar, setShowCalendar] = useState(false);

  // Fetch metrics and weight data based on the currently selected date
  const { metrics, loading } = useHealthData(selectedDate);
  const { weight, lastLoggedWeight, logWeight } = useWeightData(selectedDate);
  const { setShowSettingsModal } = useHealthStore();
  const { stepGoal } = useStepGoal();

  const isToday = selectedDate === todayStr;



  const goToPrevDay = () => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const goToNextDay = () => {
    const next = addDays(selectedDate, 1);
    if (next <= todayStr) setSelectedDate(next);
  };

  return (
    <div className="flex flex-col px-4 pb-24 min-h-screen">
      <header className="mb-5 mt-4 pt-4 animate-fade-in-up">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">Health</h1>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 text-neutral-500 hover:text-indigo-400 transition-colors active:scale-90"
            aria-label="Health Sync Settings"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738a1.125 1.125 0 0 1-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 0 1-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>

        {/* Date navigation row */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setShowCalendar(true)}
            className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span className="font-medium">{isToday ? 'Today' : formatDisplayDate(selectedDate)}</span>
          </button>

          {/* Day arrows */}
          <div className="flex items-center gap-0.5 ml-auto">
            <button
              onClick={goToPrevDay}
              className="p-2.5 text-neutral-500 hover:text-neutral-300 transition-colors active:scale-90"
              aria-label="Previous day"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={goToNextDay}
              disabled={isToday}
              className={`p-2.5 transition-colors active:scale-90 ${isToday ? 'text-neutral-700 cursor-not-allowed' : 'text-neutral-500 hover:text-neutral-300'
                }`}
              aria-label="Next day"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="ml-1 px-2 py-1 text-[11px] font-medium text-indigo-400 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-colors"
              >
                Today
              </button>
            )}
          </div>
        </div>
      </header>

      <HealthDashboard
        metrics={metrics}
        weight={weight}
        lastLoggedWeight={lastLoggedWeight}
        logWeight={logWeight}
        isToday={isToday}
        loading={loading}
        stepGoal={stepGoal}
      />

      {/* Modals */}
      <HealthSyncSettingsModal />

      {showCalendar && (
        <HealthCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}
