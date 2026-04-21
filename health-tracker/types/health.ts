export interface HealthMetrics {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  active_energy: number;
  distance_km: number | null;
  flights_climbed: number | null;
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  created_at: string;
}
