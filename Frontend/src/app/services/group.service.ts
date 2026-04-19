import { api } from "./api";

export interface Group {
  id: string;
  name: string;
  academic_year: string;
  description?: string;
  professor_id: string;
  students: any[];
  created_at: string;
  updated_at?: string;
}

export interface GroupCreateRequest {
  name: string;
  academic_year: string;
  description?: string;
}

export interface GroupUpdateRequest {
  name?: string;
  academic_year?: string;
  description?: string;
}

export interface GroupStudentRequest {
  student_id: string;
}

export const groupService = {
  async getGroups(skip = 0, limit = 100) {
    return api.get("/professor/groups", { params: { skip, limit } });
  },

  async getGroup(groupId: string) {
    return api.get(`/professor/groups/${groupId}`);
  },

  async createGroup(data: GroupCreateRequest) {
    return api.post("/professor/groups", data);
  },

  async updateGroup(groupId: string, data: GroupUpdateRequest) {
    return api.put(`/professor/groups/${groupId}`, data);
  },

  async deleteGroup(groupId: string) {
    return api.delete(`/professor/groups/${groupId}`);
  },

  async addStudentToGroup(groupId: string, studentId: string) {
    return api.post(`/professor/groups/${groupId}/students`, { student_id: studentId });
  },

  async removeStudentFromGroup(groupId: string, studentId: string) {
    return api.delete(`/professor/groups/${groupId}/students/${studentId}`);
  },

  async getUnassignedStudents() {
    return api.get("/professor/unassigned-students");
  },
};
