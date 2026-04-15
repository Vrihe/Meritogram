import { api } from './api';

export interface CodeIssue {
  line: number;
  type: "error" | "warning" | "suggestion";
  message: string;
  suggestion: string;
}

export interface CodeReviewResponse {
  score: number;
  summary: string;
  issues: CodeIssue[];
}

export const codeReviewService = {
  review: (code: string, language: string) => api.post<CodeReviewResponse>('/code-review/review', { code, language }),
  getHistory: () => api.get<any[]>('/code-review/history')
};
