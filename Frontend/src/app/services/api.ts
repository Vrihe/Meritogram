const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(endpoint: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const { method = 'GET', body } = options;
  const headers: Record<string, string> = {};

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(errorData.detail || res.statusText, res.status);
  }

  return res.json();
}

export const api = {
  get: <T>(url: string) => apiFetch<T>(url),
  post: <T>(url: string, body: unknown) => apiFetch<T>(url, { method: 'POST', body }),
  put: <T>(url: string, body: unknown) => apiFetch<T>(url, { method: 'PUT', body }),
  delete: <T>(url: string) => apiFetch<T>(url, { method: 'DELETE' }),
};

export { ApiError };
