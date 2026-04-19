import { api } from "./api";

export interface Student {
  id: string;
  email: string;
  profile: {
    full_name: string;
    student_id: string;
    major: string;
  };
  academic: {
    year: string;
    gpa_target: number;
  };
  role: "student";
}

export interface StudentUpdateRequest {
  profile?: {
    full_name?: string;
    student_id?: string;
    major?: string;
  };
  academic?: {
    year?: string;
    gpa_target?: number;
  };
}

export const professorService = {
  async getStudents(skip = 0, limit = 100) {
    return api.get("/professor/students", { params: { skip, limit } });
  },

  async getStudent(studentId: string) {
    return api.get(`/professor/students/${studentId}`);
  },

  async updateStudent(studentId: string, data: StudentUpdateRequest) {
    return api.put(`/professor/students/${studentId}`, data);
  },
};
