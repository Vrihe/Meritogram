import { api } from './api';

export interface GradeRecord {
  id: string;
  user_id: string;
  course_id: string;
  name: string;
  score: number;
  max_score: number;
  weight: number;
  feedback: string;
  date: string;
  course_code: string;
  course_name: string;
  created_at: string;
}

export const gradeService = {
  getAll: (courseId?: string) => {
    const params = courseId ? `?course_id=${courseId}` : '';
    return api.get<GradeRecord[]>(`/grades${params}`);
  },
  create: (data: { course_id: string; name: string; score: number; max_score?: number; weight?: number }) =>
    api.post<GradeRecord>('/grades', data),
  delete: (id: string) => api.delete(`/grades/${id}`),
};
