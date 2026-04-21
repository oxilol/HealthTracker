export interface CardioTemplate {
  id: string;
  user_id: string;
  name: string;
  created_at?: string;
  activities?: CardioTemplateActivity[];
}

export interface CardioTemplateActivity {
  id: string;
  template_id: string;
  activity_name: string;
  activity_order: number;
}

export interface CardioSession {
  id: string;
  user_id: string;
  template_id?: string | null;
  session_date: string;
  is_completed?: boolean;
  created_at?: string;
  template?: CardioTemplate;
}

export interface CardioLog {
  id: string;
  session_id: string;
  activity_name: string;
  log_number: number;
  duration_minutes: number | null;
  distance_km: number | null;
}
