import { api } from './api';

export interface CourseData {
  id: string;
  name: string;
  code: string;
  instructor: string;
  color: string;
  credits: number;
  description: string;
  schedule: string;
  room: string;
  tags: string[];
  total_sessions: number;
  grades: { date: string; score: number; feedback: string | null }[];
  attendance: string[];
  created_at: string;
}

export const courseService = {
  getAll: () => api.get<CourseData[]>('/courses/'),
  create: (data: Partial<CourseData>) => api.post<CourseData>('/courses/', data),
};
