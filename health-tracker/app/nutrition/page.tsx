"use client";

import { useState } from 'react';
import { todayLocalStr, addDays, formatDisplayDate } from '../../lib/dateUtils';
import { useNutritionGoals } from '../../features/nutrition/hooks/useNutritionGoals';
import { useNutritionLogs } from '../../features/nutrition/hooks/useNutritionLogs';
import { useFoods } from '../../features/nutrition/hooks/useFoods';
import { DailyProgress } from '../../features/nutrition/components/DailyProgress';
import { FoodLogList } from '../../features/nutrition/components/FoodLogList';
import { FoodSearchModal } from '../../features/nutrition/components/FoodSearchModal';
import { CreateFoodForm } from '../../features/nutrition/components/CreateFoodForm';
import { CreateMealForm } from '../../features/nutrition/components/CreateMealForm';
import { NutritionGoalsForm } from '../../features/nutrition/components/NutritionGoalsForm';
import { NutritionCalendar } from '../../features/nutrition/components/NutritionCalendar';
import { useNutritionStore } from '../../store/nutritionStore';
import { SearchResultFood } from '../../types/nutrition';

// Main Nutrition Dashboard : diet tracking

export default function NutritionPage() {
  // Manage local UI state for date navigation and calendar visibility
  const todayStr = todayLocalStr();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showCalendar, setShowCalendar] = useState(false);

  // Fetch user nutrition goals, daily food logs, and custom setup hooks
  const { goals, loading: goalsLoading, refetch: refetchGoals } = useNutritionGoals();
  const { logs, loading: logsLoading, addLog, deleteLog, totals, refetch: refetchLogs } = useNutritionLogs(selectedDate);
  const { createFood } = useFoods();
  const { setShowFoodSearch, setShowGoalsForm } = useNutritionStore();

  const isToday = selectedDate === todayStr;



  // Save an external USDA search result into the database
  const handleSaveAPIFood = async (food: SearchResultFood) => {
    const result = await createFood({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbohydrates: food.carbohydrates,
      fat: food.fat,
      base_quantity: food.base_quantity,
      base_unit: food.base_unit,
      barcode: food.barcode,
    });
    return result;
  };

  const goToPrevDay = () => {
    setSelectedDate(addDays(selectedDate, -1));
  };

  const goToNextDay = () => {
    const next = addDays(selectedDate, 1);
    if (next <= todayStr) setSelectedDate(next);
  };

  const isLoading = goalsLoading || logsLoading;

  return (
    <div className="flex flex-col px-4 pb-24 min-h-screen">
      <header className="mb-3 mt-4 pt-4 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">Nutrition</h1>
          <button
            onClick={() => setShowGoalsForm(true)}
            className="p-2 text-neutral-500 hover:text-indigo-400 transition-colors active:scale-90"
            aria-label="Nutrition goals"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>

        {/* Date navigation row */}
        <div className="flex items-center gap-2 mt-1">
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

      {/* Daily Progress */}
      <div className="mb-5 animate-fade-in-up-1">
        {isLoading ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4">
            <div className="flex justify-center">
              <div className="skeleton w-24 h-24 rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="skeleton h-2 w-full rounded-full" />
              <div className="skeleton h-2 w-full rounded-full" />
              <div className="skeleton h-2 w-full rounded-full" />
            </div>
          </div>
        ) : (
          <DailyProgress consumed={totals} goals={goals} />
        )}
      </div>

      {/* Food Log */}
      <div className="flex items-center justify-between mb-3 animate-fade-in-up-2">
        <h2 className="text-sm font-semibold text-neutral-300">
          {isToday ? "Today\u0027s Log" : formatDisplayDate(selectedDate)}
        </h2>
        <span className="text-xs text-neutral-600">{logs.length} entries</span>
      </div>

      <div className="animate-fade-in-up-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 w-full" />
            ))}
          </div>
        ) : (
          <FoodLogList logs={logs} onDelete={deleteLog} />
        )}
      </div>

      {/* Add Food (only show for today) */}
      {isToday && (
        <button
          onClick={() => setShowFoodSearch(true)}
          className="fixed bottom-24 right-4 max-w-md w-14 h-14 bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-xl border border-indigo-500/30 text-white rounded-full shadow-[0_8px_32px_rgba(99,102,241,0.15)] flex items-center justify-center transition-all active:scale-90 z-40 animate-scale-pop animate-gentle-bounce"
          aria-label="Add food"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}

      {/* Modals */}
      <FoodSearchModal onLogFood={addLog} onSaveAPIFood={handleSaveAPIFood} />
      <CreateFoodForm onSaved={refetchLogs} />
      <CreateMealForm onSaved={refetchLogs} />
      <NutritionGoalsForm onGoalsSaved={refetchGoals} />

      {/* Calendar */}
      {showCalendar && (
        <NutritionCalendar
          goals={goals}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}
