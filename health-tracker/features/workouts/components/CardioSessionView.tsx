"use client";

import { CardioSession, CardioLog, CardioTemplate } from '../../../types/cardio';
import { CardioActivityCard } from './CardioActivityCard';
import { SwipeableCard } from '../../../components/SwipeableCard';

interface CardioSessionViewProps {
  session: CardioSession;
  logs: CardioLog[];
  onAddLog: (
    activityName: string,
    durationMinutes: number | null,
    distanceKm: number | null,
    sessionId: string
  ) => Promise<CardioLog | null>;
  onDeleteLog: (logId: string) => Promise<void>;
  onDeleteSession: () => Promise<void>;
  onEndSession: () => Promise<void>;
  isReadOnly?: boolean;
}

export function CardioSessionView({
  session,
  logs,
  onAddLog,
  onDeleteLog,
  onDeleteSession,
  onEndSession,
  isReadOnly,
}: CardioSessionViewProps) {
  const template = session.template as CardioTemplate;
  const activities = template?.activities || [];

  const totalDuration = logs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  const totalDistance = logs.reduce((sum, l) => sum + (l.distance_km || 0), 0);

  const headerCard = (
    <div
      className={`p-5 rounded-3xl relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.2)] bg-neutral-900 ${isReadOnly ? 'border border-neutral-800' : 'border border-cyan-500/20'
        }`}
    >
      {!isReadOnly && <div className="absolute inset-0 bg-cyan-600/10 pointer-events-none" />}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h2
            className={`text-lg font-bold ${isReadOnly ? 'text-neutral-300' : 'text-neutral-100'}`}
          >
            {template?.name || 'Cardio Session'}
          </h2>
          <p
            className={`text-xs mt-1 font-medium ${isReadOnly ? 'text-neutral-500' : 'text-cyan-400/80'
              }`}
          >
            {isReadOnly ? 'Completed' : 'In Progress'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p
              className={`text-lg font-semibold ${isReadOnly ? 'text-neutral-400' : 'text-cyan-400'
                }`}
            >
              {Math.round(totalDuration)}
            </p>
            <p className="text-[10px] text-neutral-500 font-medium">min</p>
          </div>
          <div className="bg-neutral-950/40 w-px h-8" />
          <div>
            <p
              className={`text-lg font-semibold ${isReadOnly ? 'text-neutral-400' : 'text-indigo-400'
                }`}
            >
              {totalDistance.toFixed(1)}
            </p>
            <p className="text-[10px] text-neutral-500 font-medium">km</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 w-full animate-slide-up">
      {/* Session summary header */}
      <div className="mb-6">
        <SwipeableCard id={session.id} onDelete={onDeleteSession} noStyling>
          {headerCard}
        </SwipeableCard>
      </div>

      {/* Activity list */}
      <div className="space-y-4 pb-10">
        {activities.length === 0 && (
          <p className="text-center text-neutral-500 text-sm py-8 bg-neutral-900 border border-neutral-800 rounded-3xl">
            No activities in this template. Edit the template to add activities.
          </p>
        )}

        {activities.map((activity, idx) => {
          const activityLogs = logs
            .filter(
              (l) =>
                l.session_id === session.id &&
                l.activity_name === activity.activity_name
            )
            .sort((a, b) => a.log_number - b.log_number);

          return (
            <CardioActivityCard
              key={activity.id}
              index={idx}
              activityName={activity.activity_name}
              logs={activityLogs}
              onAddLog={(name, dur, dist) => onAddLog(name, dur, dist, session.id)}
              onDeleteLog={onDeleteLog}
              isReadOnly={isReadOnly}
            />
          );
        })}

        {!isReadOnly && (
          <button
            onClick={onEndSession}
            className="w-full mt-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-cyan-500/20 hover:bg-cyan-500/30 backdrop-blur-md border border-cyan-500/30 transition-colors active:scale-[0.98] shadow-lg shadow-cyan-500/10"
          >
            End Cardio Session
          </button>
        )}
      </div>
    </div>
  );
}
