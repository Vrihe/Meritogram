import { api } from './api';
import type { User } from './auth.service';

export const userService = {
  getProfile: () => api.get<User>('/profile'),
  updateProfile: (data: {
    profile?: Partial<{ full_name: string; student_id: string; major: string; photo_url: string }>;
    notifications?: Partial<{ email_notifications: boolean; push_notifications: boolean; grade_updates: boolean; assignment_reminders: boolean }>;
    academic?: Partial<{ year: string; gpa_target: number; attendance_pct: number }>;
    app_settings?: Partial<{ dark_mode: boolean }>;
  }) => api.put<User>('/profile', data),
};
