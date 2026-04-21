"use client";

import { useState } from 'react';
import { todayLocalStr, addDays, formatDisplayDate } from '../../lib/dateUtils';

// Gym imports
import { useWorkoutTemplates } from '../../features/workouts/hooks/useWorkoutTemplates';
import { useWorkoutSession } from '../../features/workouts/hooks/useWorkoutSession';
import { useWorkoutStore } from '../../store/workoutStore';
import { TemplateList } from '../../features/workouts/components/TemplateList';
import { CreateTemplateForm } from '../../features/workouts/components/CreateTemplateForm';
import { WorkoutSessionView } from '../../features/workouts/components/WorkoutSessionView';
import { WorkoutCalendar } from '../../features/workouts/components/WorkoutCalendar';
import { TemplateSettingsModal } from '../../features/workouts/components/TemplateSettingsModal';
import { WorkoutTemplate } from '../../types/workout';

// Cardio imports
import { useCardioTemplates } from '../../features/workouts/hooks/useCardioTemplates';
import { useCardioSession } from '../../features/workouts/hooks/useCardioSession';
import { CardioTemplateList } from '../../features/workouts/components/CardioTemplateList';
import { CreateCardioTemplateForm } from '../../features/workouts/components/CreateCardioTemplateForm';
import { CardioSessionView } from '../../features/workouts/components/CardioSessionView';
import { CardioCalendar } from '../../features/workouts/components/CardioCalendar';
import { CardioSettingsModal } from '../../features/workouts/components/CardioSettingsModal';
import { CardioTemplate } from '../../types/cardio';

type Mode = 'gym' | 'cardio';

// Main Train Dashboard: gym and cardio session tracking.

export default function WorkoutsPage() {
  // Manage local UI state for date navigation and active training mode
  const todayStr = todayLocalStr();
  const [mode, setMode] = useState<Mode>('gym');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showCalendar, setShowCalendar] = useState(false);

  // Gym data
  const { templates, loading: templatesLoading, deleteTemplate } = useWorkoutTemplates();
  const {
    sessions,
    sets,
    previousTemplateSets,
    loading: sessionsLoading,
    startSession,
    endSession,
    addSet,
    deleteSet,
    deleteSession,
  } = useWorkoutSession(selectedDate);

  // Cardio data
  const {
    templates: cardioTemplates,
    loading: cardioTemplatesLoading,
    deleteTemplate: deleteCardioTemplate,
  } = useCardioTemplates();
  const {
    sessions: cardioSessions,
    logs: cardioLogs,
    loading: cardioSessionsLoading,
    startSession: startCardioSession,
    endSession: endCardioSession,
    addLog: addCardioLog,
    deleteLog: deleteCardioLog,
    deleteSession: deleteCardioSession,
  } = useCardioSession(selectedDate);

  // Store
  const {
    setShowCreateTemplate,
    setEditingTemplate,
    setShowTemplateSettings,
    setShowCardioSettings,
    setEditingCardioTemplate,
  } = useWorkoutStore();

  const isToday = selectedDate === todayStr;
  const currentSession = sessions.length > 0 ? sessions[0] : null;
  const currentCardioSession = cardioSessions.length > 0 ? cardioSessions[0] : null;

  const isGymLoading = templatesLoading || sessionsLoading;
  const isCardioLoading = cardioTemplatesLoading || cardioSessionsLoading;
  const isLoading = mode === 'gym' ? isGymLoading : isCardioLoading;

  const isReadOnly = !isToday || (
    mode === 'gym'
      ? (currentSession?.is_completed ?? false)
      : (currentCardioSession?.is_completed ?? false)
  );



  const goToPrevDay = () => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const goToNextDay = () => {
    const next = addDays(selectedDate, 1);
    if (next <= todayStr) setSelectedDate(next);
  };

  const handleOpenSettings = () => {
    if (mode === 'gym') setShowTemplateSettings(true);
    else setShowCardioSettings(true);
  };

  const gymContent = isLoading ? (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 w-full rounded-3xl" />)}
    </div>
  ) : currentSession ? (
    <WorkoutSessionView
      session={currentSession}
      sets={sets}
      previousTemplateSets={previousTemplateSets}
      onAddSet={addSet}
      onDeleteSet={deleteSet}
      onDeleteSession={() => deleteSession(currentSession.id)}
      onEndSession={() => endSession(currentSession.id)}
      isReadOnly={isReadOnly}
    />
  ) : isToday ? (
    <div className="space-y-4">
      <p className="text-sm font-medium text-neutral-400 mb-2">Start a workout today</p>
      <TemplateList
        templates={templates}
        onStart={(t: WorkoutTemplate) => startSession(t)}
        onEdit={setEditingTemplate}
        onDelete={deleteTemplate}
      />
    </div>
  ) : (
    <EmptyRestDay />
  );

  const cardioContent = isLoading ? (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 w-full rounded-3xl" />)}
    </div>
  ) : currentCardioSession ? (
    <CardioSessionView
      session={currentCardioSession}
      logs={cardioLogs}
      onAddLog={(name, dur, dist, sessionId) => addCardioLog(name, dur, dist, sessionId)}
      onDeleteLog={deleteCardioLog}
      onDeleteSession={() => deleteCardioSession(currentCardioSession.id)}
      onEndSession={() => endCardioSession(currentCardioSession.id)}
      isReadOnly={isReadOnly}
    />
  ) : isToday ? (
    <div className="space-y-4">
      <p className="text-sm font-medium text-neutral-400 mb-2">Start a cardio session today</p>
      <CardioTemplateList
        templates={cardioTemplates}
        onStart={(t: CardioTemplate) => startCardioSession(t)}
        onEdit={setEditingCardioTemplate}
        onDelete={deleteCardioTemplate}
      />
    </div>
  ) : (
    <EmptyRestDay label="No cardio logged on this date." />
  );

  return (
    <div className="flex flex-col px-4 pb-24 min-h-screen">
      <header className="mb-5 mt-4 pt-4 animate-fade-in-up">
        {/* Title + settings */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">Train</h1>
          <button
            onClick={handleOpenSettings}
            className="p-2 text-neutral-500 hover:text-indigo-400 transition-colors active:scale-90"
            aria-label="Settings"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738a1.125 1.125 0 0 1-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 0 1-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>

        {/* Mode toggle */}
        <div className="relative flex mt-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-1">
          {/* Animated slider background */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-out shadow-sm ${mode === 'gym'
              ? 'left-1 bg-indigo-600'
              : 'left-[calc(50%+2px)] bg-cyan-600'
              }`}
          />
          <button
            onClick={() => setMode('gym')}
            className={`flex-1 py-2 relative z-10 text-sm font-medium transition-colors duration-300 ${mode === 'gym' ? 'text-white' : 'text-neutral-400 hover:text-neutral-300'
              }`}
          >
            Gym
          </button>
          <button
            onClick={() => setMode('cardio')}
            className={`flex-1 py-2 relative z-10 text-sm font-medium transition-colors duration-300 ${mode === 'cardio' ? 'text-white' : 'text-neutral-400 hover:text-neutral-300'
              }`}
          >
            Cardio
          </button>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setShowCalendar(true)}
            className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span className="font-medium">{isToday ? 'Today' : formatDisplayDate(selectedDate)}</span>
          </button>
          <div className="flex items-center gap-0.5 ml-auto">
            <button onClick={goToPrevDay} className="p-2.5 text-neutral-500 hover:text-neutral-300 transition-colors active:scale-90" aria-label="Previous day">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button onClick={goToNextDay} disabled={isToday} className={`p-2.5 transition-colors active:scale-90 ${isToday ? 'text-neutral-700 cursor-not-allowed' : 'text-neutral-500 hover:text-neutral-300'}`} aria-label="Next day">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            {!isToday && (
              <button onClick={() => setSelectedDate(todayStr)} className="ml-1 px-2 py-1 text-[11px] font-medium text-indigo-400 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-colors">
                Today
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="animate-fade-in-up-1">
        {mode === 'gym' ? gymContent : cardioContent}
      </div>

      {/* Modals — Gym */}
      <TemplateSettingsModal />
      <CreateTemplateForm />

      {/* Modals — Cardio */}
      <CardioSettingsModal />
      <CreateCardioTemplateForm />

      {/* Calendar */}
      {showCalendar && mode === 'gym' && (
        <WorkoutCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onClose={() => setShowCalendar(false)}
        />
      )}
      {showCalendar && mode === 'cardio' && (
        <CardioCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}

function EmptyRestDay({ label = 'No workout was logged on this date.' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-3xl flex items-center justify-center mb-4">
        <span className="text-2xl opacity-50">💤</span>
      </div>
      <h3 className="text-neutral-200 font-medium mb-1">Rest Day</h3>
      <p className="text-neutral-500 text-sm max-w-[200px]">{label}</p>
    </div>
  );
}
