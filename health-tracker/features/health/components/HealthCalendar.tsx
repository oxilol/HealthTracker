import { useState } from 'react';
import { useUserStore } from '../../../store/userStore';
import { todayLocalStr, getFirstDayOfMonth, getDaysInMonth } from '../../../lib/dateUtils';
import { useHealthCalendarActiveDates } from '../hooks/useHealthCalendarDate';

interface HealthCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

export function HealthCalendar({ selectedDate, onSelectDate, onClose }: HealthCalendarProps) {
  const user = useUserStore((state) => state.user);

  const [currentDate, setCurrentDate] = useState(new Date(selectedDate + 'T12:00:00'));

  const { activeDates, isLoading } = useHealthCalendarActiveDates(user?.id, currentDate);


  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Ensure calendar grid lines up with weekdays (Sun = 0)
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[60] bg-neutral-950/95 backdrop-blur-sm flex flex-col animate-fade-in">
      <div className="w-full max-w-md mx-auto flex flex-col h-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pt-6">
          <button
            onClick={onClose}
            className="p-3 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-neutral-100">Health History</h2>
          <button
            onClick={() => {
              onSelectDate(todayLocalStr());
              onClose();
            }}
            className="ml-auto text-xs text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={prevMonth}
            className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-neutral-200">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="px-4 flex-1 mt-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-[11px] font-medium text-neutral-600 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {blanks.map((b) => (
              <div key={`blank-${b}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDate;
              const hasData = activeDates.has(dateStr);
              const isToday = dateStr === todayLocalStr();
              const isFuture = dateStr > todayLocalStr();

              return (
                <button
                  key={dateStr}
                  disabled={isFuture}
                  onClick={() => {
                    onSelectDate(dateStr);
                    onClose();
                  }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all relative ${isFuture
                    ? 'text-neutral-800 cursor-not-allowed'
                    : isSelected
                      ? 'bg-indigo-600 text-white font-bold'
                      : isToday
                        ? 'bg-neutral-800 text-neutral-100 font-semibold'
                        : hasData
                          ? 'bg-neutral-800/50 text-neutral-300'
                          : 'text-neutral-500 hover:bg-neutral-800/30'
                    }`}
                >
                  {day}
                  {hasData && !isSelected && (
                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-8 pb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-neutral-800/50 border border-neutral-700" />
              <span className="text-[11px] text-neutral-500">Has data</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-600 border border-indigo-500" />
              <span className="text-[11px] text-neutral-500">Selected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
