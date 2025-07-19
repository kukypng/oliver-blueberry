
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  expiration_date: string;
  created_at: string;
  last_sign_in_at: string | null;
  budget_count: number;
}

export interface DebugInfo {
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  is_active: boolean | null;
  is_admin: boolean | null;
}
