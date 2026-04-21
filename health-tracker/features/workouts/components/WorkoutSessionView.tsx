"use client";

import { WorkoutSession, ExerciseSet, WorkoutTemplate } from '../../../types/workout';
import { ExerciseCard } from './ExerciseCard';
import { SwipeableCard } from '../../../components/SwipeableCard';

interface WorkoutSessionViewProps {
  session: WorkoutSession;
  sets: ExerciseSet[];
  previousTemplateSets?: ExerciseSet[];
  onAddSet: (exerciseName: string, weight: number | null, reps: number | null, sessionId: string) => Promise<ExerciseSet | null>;
  onDeleteSet: (setId: string) => Promise<void>;
  onDeleteSession: () => Promise<void>;
  onEndSession: () => Promise<void>;
  isReadOnly?: boolean;
}

/**
 * Represents an active or historical gym session instance.
 */
export function WorkoutSessionView({ session, sets, previousTemplateSets = [], onAddSet, onDeleteSet, onDeleteSession, onEndSession, isReadOnly }: WorkoutSessionViewProps) {
  const template = session.template as WorkoutTemplate;
  const exercises = template?.exercises || [];

  const totalSets = sets.length;
  const totalVolume = sets.reduce((sum, s) => {
    return sum + ((s.weight || 0) * (s.repetitions || 0));
  }, 0);

  const headerCard = (
    <div className={`p-5 rounded-3xl relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.2)] bg-neutral-900 ${isReadOnly ? 'border border-neutral-800' : 'border border-indigo-500/20'}`}>
      {!isReadOnly && <div className="absolute inset-0 bg-indigo-600/10 pointer-events-none" />}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h2 className={`text-lg font-bold ${isReadOnly ? 'text-neutral-300' : 'text-neutral-100'}`}>{template?.name || 'Workout Session'}</h2>
          <p className={`text-xs mt-1 font-medium ${isReadOnly ? 'text-neutral-500' : 'text-indigo-400/80'}`}>
            {isReadOnly ? 'Completed' : 'In Progress'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className={`text-lg font-semibold ${isReadOnly ? 'text-neutral-400' : 'text-indigo-400'}`}>{totalSets}</p>
            <p className="text-[10px] text-neutral-500 font-medium">sets</p>
          </div>
          <div className="bg-neutral-950/40 w-px h-8" />
          <div>
            <p className={`text-lg font-semibold ${isReadOnly ? 'text-neutral-400' : 'text-emerald-400'}`}>{Math.round(totalVolume).toLocaleString()}</p>
            <p className="text-[10px] text-neutral-500 font-medium">lbs vol</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 w-full animate-slide-up">
      {/* Session summary card */}
      <div className="mb-6">
        <SwipeableCard id={session.id} onDelete={onDeleteSession} noStyling>
          {headerCard}
        </SwipeableCard>
      </div>

      {/* Exercise list */}
      <div className="space-y-4 pb-10">
        {exercises.length === 0 && (
          <p className="text-center text-neutral-500 text-sm py-8 bg-neutral-900 border border-neutral-800 rounded-3xl">
            No exercises in this template. Edit the template to add exercises.
          </p>
        )}

        {exercises.map((exercise, idx) => {
          const exerciseSets = sets
            .filter((s) => s.exercise_name === exercise.exercise_name)
            .sort((a, b) => a.set_number - b.set_number);

          const exercisePrevSets = previousTemplateSets
            .filter((s) => s.exercise_name === exercise.exercise_name)
            .sort((a, b) => a.set_number - b.set_number);

          return (
            <ExerciseCard
              key={exercise.id}
              index={idx}
              exerciseName={exercise.exercise_name}
              sets={exerciseSets}
              previousSets={exercisePrevSets}
              onAddSet={(name, w, r) => onAddSet(name, w, r, session.id)}
              onDeleteSet={onDeleteSet}
              isReadOnly={isReadOnly}
            />
          );
        })}

        {!isReadOnly && (
          <button
            onClick={onEndSession}
            className="w-full mt-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-md border border-indigo-500/30 transition-colors active:scale-[0.98] shadow-lg shadow-indigo-500/10"
          >
            End Workout
          </button>
        )}
      </div>
    </div>
  );
}
