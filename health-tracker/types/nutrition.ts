export interface Food {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  base_quantity: number;
  base_unit: string;
  barcode?: string;
  created_at?: string;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  expiration_date?: string | null;
  created_at?: string;
  foods?: MealFood[];
}

export interface MealFood {
  id: string;
  meal_id: string;
  food_id: string;
  quantity: number;
  unit: string;
  food?: Food;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  food_id?: string | null;
  meal_id?: string | null;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  log_date: string;
  name?: string;
  created_at?: string;
  food?: Food;
  meal?: Meal;
}

export interface NutritionGoals {
  id: string;
  user_id: string;
  calorie_goal: number;
  protein_goal: number;
  carbohydrate_goal: number;
  fat_goal: number;
}

export interface SearchResultFood {
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  base_quantity: number;
  base_unit: string;
  barcode?: string;
  source: 'api' | 'custom' | 'meal';
  id?: string;
}
