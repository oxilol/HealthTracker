export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  created_at?: string;
  exercises?: TemplateExercise[];
}

export interface TemplateExercise {
  id: string;
  template_id: string;
  exercise_name: string;
  exercise_order: number;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  template_id?: string | null;
  workout_date: string;
  is_completed?: boolean;
  created_at?: string;
  sets?: ExerciseSet[];
  template?: WorkoutTemplate;
}

export interface ExerciseSet {
  id: string;
  session_id: string;
  exercise_name: string;
  set_number: number;
  weight: number | null;
  repetitions: number | null;
}
