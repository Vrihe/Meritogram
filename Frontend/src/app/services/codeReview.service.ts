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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  code: string;
  language: string;
  selection?: string;        // highlighted fragment (optional)
  messages: ChatMessage[];   // conversation history
  message: string;           // current user message
}

export interface ChatResponse {
  reply: string;
  role: 'assistant';
}

export const codeReviewService = {
  // Legacy endpoint
  review: (code: string, language: string) =>
    api.post<CodeReviewResponse>('/code-review/review', { code, language }),

  getHistory: () => api.get<any[]>('/code-review/history'),

  // New AI chat endpoint
  chat: (payload: ChatRequest) =>
    api.post<ChatResponse>('/code-review/chat', payload),
};
