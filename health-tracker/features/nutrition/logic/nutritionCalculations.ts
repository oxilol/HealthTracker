import { Food } from '../../../types/nutrition';

export function calculateNutrition(
  food: Food,
  quantity: number,
  unit: string
) {
  // The food's nutrition values are defined per base_quantity of base_unit
  // For example: 100g of chicken has 165 calories
  // If user logs 200g, ratio = 200/100 = 2, so calories = 165 * 2 = 330

  let ratio = quantity / food.base_quantity;

  // If units don't match, we still use the ratio based on quantity 
  // since the user is expected to input in the food's base unit
  // or a compatible unit
  if (unit !== food.base_unit && unit === 'portion') {
    // 1 portion = 1x base_quantity
    ratio = quantity;
  }

  return {
    calories: Math.round(food.calories * ratio * 10) / 10,
    protein: Math.round(food.protein * ratio * 10) / 10,
    carbohydrates: Math.round(food.carbohydrates * ratio * 10) / 10,
    fat: Math.round(food.fat * ratio * 10) / 10,
  };
}

export function formatMacro(value: number): string {
  return value % 1 === 0 ? value.toString() : value.toFixed(1);
}
