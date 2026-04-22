"use client";

import { useState } from 'react';
import { SearchResultFood, Food } from '../../../types/nutrition';
import { calculateNutrition } from '../logic/nutritionCalculations';

interface QuantityInputProps {
  food: SearchResultFood | Food;
  onConfirm: (data: {
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  }) => void;
  onCancel: () => void;
}

export function QuantityInput({ food, onConfirm, onCancel }: QuantityInputProps) {
  const baseUnit = 'base_unit' in food ? food.base_unit : 'g';
  const baseQty = 'base_quantity' in food ? food.base_quantity : 100;

  const [quantity, setQuantity] = useState(baseQty.toString());
  const [unit, setUnit] = useState(baseUnit);

  const numQuantity = parseFloat(quantity) || 0;

  const preview = calculateNutrition(
    {
      calories: food.calories,
      protein: food.protein,
      carbohydrates: food.carbohydrates,
      fat: food.fat,
      base_quantity: baseQty,
      base_unit: baseUnit,
    } as Food,
    numQuantity,
    unit
  );

  const unitOptions = [baseUnit];
  if (!unitOptions.includes('g')) unitOptions.push('g');
  if (!unitOptions.includes('ml')) unitOptions.push('ml');
  if (!unitOptions.includes('portion')) unitOptions.push('portion');
  if (!unitOptions.includes('units')) unitOptions.push('units');
  // Remove duplicates
  const uniqueUnits = [...new Set(unitOptions)];

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 relative overflow-hidden shadow-lg">

      <div className="relative z-10 w-full h-full space-y-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-200 truncate">{food.name}</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Per {baseQty} {baseUnit}: {food.calories} cal
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-neutral-400 mb-1 ml-1">Quantity</label>
            <input
              type="number"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              min="0"
              step="any"
              autoFocus
            />
          </div>
          <div className="w-28">
            <label className="block text-xs font-medium text-neutral-400 mb-1 ml-1">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none"
            >
              {uniqueUnits.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-neutral-800/50 rounded-2xl p-3 grid grid-cols-4 gap-2 text-center">
          <div>
            <span className="text-sm font-semibold text-indigo-400">{Math.round(preview.calories)}</span>
            <p className="text-[10px] text-neutral-500 mt-0.5">cal</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-emerald-400">{Math.round(preview.protein)}g</span>
            <p className="text-[10px] text-neutral-500 mt-0.5">protein</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-amber-400">{Math.round(preview.carbohydrates)}g</span>
            <p className="text-[10px] text-neutral-500 mt-0.5">carbs</p>
          </div>
          <div>
            <span className="text-sm font-semibold text-red-400">{Math.round(preview.fat)}g</span>
            <p className="text-[10px] text-neutral-500 mt-0.5">fat</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-sm font-medium text-neutral-400 bg-neutral-800 hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (numQuantity > 0) {
                onConfirm({
                  quantity: numQuantity,
                  unit,
                  ...preview,
                });
              }
            }}
            disabled={numQuantity <= 0}
            className="flex-1 py-3 rounded-2xl text-sm font-medium text-white bg-indigo-500/20 hover:bg-indigo-500/30 backdrop-blur-md border border-indigo-500/30 disabled:opacity-40 transition-colors shadow-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
