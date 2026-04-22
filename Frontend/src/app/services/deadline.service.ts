import { api } from './api';

export interface Deadline {
  _id: string;
  user_id: string;
  course_id: string;
  task: string;
  due: string;
  urgent: boolean;
  credits: number;
  course_code: string;
  course_name: string;
}

export const getDeadlines = async (courseId?: string): Promise<Deadline[]> => {
  const url = courseId ? `/deadlines?course_id=${courseId}` : '/deadlines';
  return await api.get<Deadline[]>(url);
};

export const createDeadline = async (data: any): Promise<Deadline> => {
  return await api.post<Deadline>('/deadlines', data);
};
