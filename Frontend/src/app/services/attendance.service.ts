import { api } from './api';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  course_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes: string;
  course_code: string;
  course_name: string;
  created_at: string;
}

export const attendanceService = {
  getAll: (courseId?: string) => {
    const params = courseId ? `?course_id=${courseId}` : '';
    return api.get<AttendanceRecord[]>(`/attendance${params}`);
  },
  create: (data: { course_id: string; date: string; status: string; notes?: string }) =>
    api.post<AttendanceRecord>('/attendance', data),
};
