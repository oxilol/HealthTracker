"use client";

import { useState } from 'react';
import { SearchResultFood, Food, Meal } from '../../../types/nutrition';
import { useFoodSearch } from '../hooks/useFoodSearch';
import { useFoods } from '../hooks/useFoods';
import { useMeals } from '../hooks/useMeals';
import { QuantityInput } from './QuantityInput';
import { SwipeableCard } from '../../../components/SwipeableCard';
import { useNutritionStore } from '../../../store/nutritionStore';

interface FoodSearchModalProps {
  onLogFood: (data: {
    food_id?: string | null;
    meal_id?: string | null;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    name?: string;
  }) => void;
  onSaveAPIFood: (food: SearchResultFood) => Promise<Food | null>;
}

type Tab = 'search' | 'myfoods' | 'mymeals' | 'quickadd';

export function FoodSearchModal({ onLogFood, onSaveAPIFood }: FoodSearchModalProps) {
  const {
    showFoodSearch, setShowFoodSearch,
    setShowCreateFood, setShowCreateMeal,
    setEditingFood, setEditingMeal,
  } = useNutritionStore();
  const { results, loading, query, handleSearch, clearSearch } = useFoodSearch();
  const { foods: myFoods, deleteFood } = useFoods();
  const { meals: myMeals, getMealNutrition, deleteMeal } = useMeals();

  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [selectedFood, setSelectedFood] = useState<(SearchResultFood | Food) | null>(null);
  const [savingAPIFood, setSavingAPIFood] = useState(false);

  const [qaCalories, setQaCalories] = useState('');
  const [qaProtein, setQaProtein] = useState('');
  const [qaCarbs, setQaCarbs] = useState('');
  const [qaFat, setQaFat] = useState('');
  const [qaName, setQaName] = useState('');

  if (!showFoodSearch) return null;

  const handleClose = () => {
    setShowFoodSearch(false);
    setSelectedFood(null);
    clearSearch();
    setQaCalories('');
    setQaProtein('');
    setQaCarbs('');
    setQaFat('');
    setQaName('');
  };

  const handleQuickAdd = () => {
    const cals = parseInt(qaCalories) || 0;
    if (cals <= 0) return;

    onLogFood({
      food_id: null,
      meal_id: null,
      quantity: 1,
      unit: 'serving',
      calories: cals,
      protein: parseInt(qaProtein) || 0,
      carbohydrates: parseInt(qaCarbs) || 0,
      fat: parseInt(qaFat) || 0,
      name: qaName.trim(),
    });

    handleClose();
  };

  const handleSelectAPIFood = async (food: SearchResultFood) => {
    setSavingAPIFood(true);
    const saved = await onSaveAPIFood(food);
    setSavingAPIFood(false);
    if (saved) {
      setSelectedFood(saved);
    }
  };

  const handleSelectMyFood = (food: Food) => {
    setSelectedFood(food);
  };

  const handleLogMeal = (mealId: string) => {
    const meal = myMeals.find((m) => m.id === mealId);
    if (!meal) return;

    const nutrition = getMealNutrition(meal);
    onLogFood({
      meal_id: mealId,
      food_id: null,
      quantity: 1,
      unit: 'portion',
      ...nutrition,
    });
    handleClose();
  };

  const handleConfirmQuantity = (data: {
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  }) => {
    const foodId = selectedFood && 'id' in selectedFood ? selectedFood.id : null;
    onLogFood({
      food_id: foodId,
      meal_id: null,
      ...data,
    });
    handleClose();
  };

  const handleDeleteFood = async (id: string) => {
    await deleteFood(id);
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteMeal(id);
  };

  const handleEditFood = (food: Food) => {
    setShowFoodSearch(false);
    setEditingFood(food);
  };

  const handleEditMeal = (meal: Meal) => {
    setShowFoodSearch(false);
    setEditingMeal(meal);
  };

  const filteredMyFoods = query.trim().length > 0
    ? myFoods.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
    : myFoods;

  const filteredMyMeals = query.trim().length > 0
    ? myMeals.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()))
    : myMeals;

  return (
    <div className="fixed inset-0 z-[60] bg-neutral-950/95 backdrop-blur-sm flex flex-col animate-fade-in">
      <div className="w-full max-w-md mx-auto flex flex-col h-full animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 pt-6">
          <button
            onClick={handleClose}
            className="p-3 text-neutral-400 hover:text-neutral-200 transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Search foods..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
            autoFocus
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 justify-center px-4 mb-4 overflow-x-auto scrollbar-hide">
          {[
            { key: 'search' as Tab, label: 'Search' },
            { key: 'myfoods' as Tab, label: 'My Foods' },
            { key: 'mymeals' as Tab, label: 'My Meals' },
            { key: 'quickadd' as Tab, label: 'Quick Add' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 min-w-[76px] py-2.5 rounded-xl text-xs font-medium transition-colors ${activeTab === tab.key
                  ? 'bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quantity input overlay */}
        {selectedFood && (
          <div className="px-4 mb-3 animate-fade-in-up">
            <QuantityInput
              food={selectedFood}
              onConfirm={handleConfirmQuantity}
              onCancel={() => setSelectedFood(null)}
            />
          </div>
        )}

        {/* Saving API food indicator */}
        {savingAPIFood && (
          <div className="px-4 mb-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-indigo-400">Saving to My Foods...</span>
            </div>
          </div>
        )}

        {/* Content */}
        {!selectedFood && !savingAPIFood && (
          <div className="flex-1 overflow-y-auto scroll-touch px-4 pb-safe">
            {/* API Search Results */}
            {activeTab === 'search' && (
              <>
                {loading && (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="skeleton h-16 w-full" />
                    ))}
                  </div>
                )}

                {!loading && query.trim().length > 0 && results.length === 0 && (
                  <p className="text-center text-neutral-500 text-sm py-8">No results found</p>
                )}

                {!loading && query.trim().length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-neutral-500 text-sm">Search the USDA food database</p>
                    <p className="text-neutral-600 text-xs mt-1">Try &quot;chicken breast&quot; or &quot;brown rice&quot;</p>
                  </div>
                )}

                <div className="space-y-2">
                  {results.map((food, i) => (
                    <button
                      key={`${food.name}-${i}`}
                      onClick={() => handleSelectAPIFood(food)}
                      className="w-full text-left bg-neutral-900 border border-neutral-800 rounded-2xl p-4 hover:border-neutral-700 transition-all active:scale-[0.98] animate-fade-in-up"
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      <p className="text-sm font-medium text-neutral-200 truncate">{food.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs font-semibold text-indigo-400">{food.calories} cal</span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[11px] text-emerald-400/80">{food.protein}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="text-[11px] text-amber-400/80">{food.carbohydrates}g</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span className="text-[11px] text-red-400/80">{food.fat}g</span>
                        </div>
                        <span className="text-[10px] text-neutral-600 ml-auto">per 100g</span>
                      </div>
                    </button>
                  ))}
                </div>

                {!loading && results.length > 0 && (
                  <p className="text-center text-neutral-700 text-[10px] pt-3">
                    Selecting a food saves it to My Foods
                  </p>
                )}
              </>
            )}

            {/* My Foods */}
            {activeTab === 'myfoods' && (
              <>
                <button
                  onClick={() => {
                    setShowFoodSearch(false);
                    setShowCreateFood(true);
                  }}
                  className="w-full mb-3 py-3 rounded-2xl text-sm font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                >
                  + Create Custom Food
                </button>

                {filteredMyFoods.length === 0 && (
                  <p className="text-center text-neutral-500 text-sm py-8">No custom foods yet</p>
                )}

                <div className="space-y-2">
                  {filteredMyFoods.map((food) => (
                    <SwipeableCard key={food.id} id={food.id} onDelete={handleDeleteFood}>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleSelectMyFood(food)}
                          className="flex-1 text-left p-4 min-w-0"
                        >
                          <p className="text-sm font-medium text-neutral-200 truncate">{food.name}</p>
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs text-indigo-400/80">{food.calories} cal</span>
                            <span className="text-[11px] text-emerald-400/60">P {food.protein}g</span>
                            <span className="text-[11px] text-amber-400/60">C {food.carbohydrates}g</span>
                            <span className="text-[11px] text-red-400/60">F {food.fat}g</span>
                            <span className="text-[11px] text-neutral-600">per {food.base_quantity}{food.base_unit}</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleEditFood(food)}
                          className="p-3 text-neutral-600 hover:text-indigo-400 transition-colors shrink-0"
                          aria-label={`Edit ${food.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                      </div>
                    </SwipeableCard>
                  ))}
                </div>

                {filteredMyFoods.length > 0 && (
                  <p className="text-center text-neutral-700 text-[10px] pt-3">
                    ← Swipe left to delete
                  </p>
                )}
              </>
            )}

            {/* My Meals */}
            {activeTab === 'mymeals' && (
              <>
                <button
                  onClick={() => {
                    setShowFoodSearch(false);
                    setShowCreateMeal(true);
                  }}
                  className="w-full mb-3 py-3 rounded-2xl text-sm font-medium text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                >
                  + Create Custom Meal
                </button>

                {filteredMyMeals.length === 0 && (
                  <p className="text-center text-neutral-500 text-sm py-8">No meals yet</p>
                )}

                <div className="space-y-2">
                  {filteredMyMeals.map((meal) => {
                    const nutrition = getMealNutrition(meal);
                    return (
                      <SwipeableCard key={meal.id} id={meal.id} onDelete={handleDeleteMeal}>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleLogMeal(meal.id)}
                            className="flex-1 text-left p-4 min-w-0"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-neutral-200 truncate">{meal.name}</p>
                              {meal.expiration_date && (
                                <span className="text-[10px] text-amber-400/60 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0 ml-2">
                                  Exp: {meal.expiration_date}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3 mt-1">
                              <span className="text-xs text-indigo-400/80">{Math.round(nutrition.calories)} cal</span>
                              <span className="text-[11px] text-emerald-400/60">P {Math.round(nutrition.protein)}g</span>
                              <span className="text-[11px] text-amber-400/60">C {Math.round(nutrition.carbohydrates)}g</span>
                              <span className="text-[11px] text-red-400/60">F {Math.round(nutrition.fat)}g</span>
                            </div>
                            {meal.foods && (
                              <p className="text-[11px] text-neutral-600 mt-1 truncate">
                                {meal.foods.map((mf) => mf.food?.name || 'Unknown').join(', ')}
                              </p>
                            )}
                          </button>
                          <button
                            onClick={() => handleEditMeal(meal)}
                            className="p-3 text-neutral-600 hover:text-indigo-400 transition-colors shrink-0"
                            aria-label={`Edit ${meal.name}`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                        </div>
                      </SwipeableCard>
                    );
                  })}
                </div>

                {filteredMyMeals.length > 0 && (
                  <p className="text-center text-neutral-700 text-[10px] pt-3">
                    ← Swipe left to delete
                  </p>
                )}
              </>
            )}

            {/* Quick Add */}
            {activeTab === 'quickadd' && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 mt-2 space-y-4 animate-fade-in-up">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-medium text-neutral-100">Quick Add</h3>
                  <p className="text-xs text-neutral-500 mt-1">Log macros manually without saving a food</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">Name (Optional)</label>
                  <input
                    type="text"
                    value={qaName}
                    onChange={(e) => setQaName(e.target.value)}
                    placeholder="e.g. Unknown Snack"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">Calories*</label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={qaCalories}
                      onChange={(e) => setQaCalories(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm font-medium"
                    />
                    <span className="absolute right-4 top-3.5 text-xs text-neutral-500">kcal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">Protein</label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={qaProtein}
                        onChange={(e) => setQaProtein(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                      />
                      <span className="absolute right-3 top-3 text-xs text-neutral-500 font-medium">g</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">Carbs</label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={qaCarbs}
                        onChange={(e) => setQaCarbs(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                      />
                      <span className="absolute right-3 top-3 text-xs text-neutral-500 font-medium">g</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">Fat</label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={qaFat}
                        onChange={(e) => setQaFat(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                      />
                      <span className="absolute right-3 top-3 text-xs text-neutral-500 font-medium">g</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleQuickAdd}
                  disabled={!qaCalories || parseInt(qaCalories) <= 0}
                  className="w-full mt-4 py-3 rounded-2xl text-sm font-medium text-white bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-md border border-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  Log Macros
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
