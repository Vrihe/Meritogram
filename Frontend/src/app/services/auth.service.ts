import { api } from './api';

export interface UserProfile {
  full_name: string;
  student_id: string;
  major: string;
  photo_url: string;
}

export interface UserNotifications {
  email_notifications: boolean;
  push_notifications: boolean;
  grade_updates: boolean;
  assignment_reminders: boolean;
}

export interface UserAcademic {
  year: string;
  gpa_target: number;
  attendance_pct: number;
}

export interface UserAppSettings {
  dark_mode: boolean;
}

export interface User {
  id: string;
  email: string;
  profile: UserProfile;
  notifications: UserNotifications;
  academic: UserAcademic;
  security: { two_factor_enabled: boolean; active_sessions: string[] };
  app_settings: UserAppSettings;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }),

  loginWithGoogle: (id_token: string) =>
    api.post<LoginResponse>('/auth/google', { id_token }),

  register: (data: { email: string; password: string; full_name: string; student_id?: string; major?: string }) =>
    api.post<LoginResponse>('/auth/register', data),

  getMe: () => api.get<User>('/auth/me'),
};
