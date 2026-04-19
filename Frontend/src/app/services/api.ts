const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(endpoint: string, options: { 
  method?: string; 
  body?: unknown;
  params?: Record<string, any>;
} = {}): Promise<T> {
  const { method = 'GET', body, params } = options;
  const headers: Record<string, string> = {};

  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  // Build URL with query parameters
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        query.append(key, String(value));
      }
    }
    if (query.toString()) {
      url += `?${query.toString()}`;
    }
  }

  const res = await fetch(url, {
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
  get: <T>(url: string, options?: { params?: Record<string, any> }) => 
    apiFetch<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: unknown, options?: { params?: Record<string, any> }) => 
    apiFetch<T>(url, { method: 'POST', body, ...options }),
  put: <T>(url: string, body?: unknown, options?: { params?: Record<string, any> }) => 
    apiFetch<T>(url, { method: 'PUT', body, ...options }),
  delete: <T>(url: string, options?: { params?: Record<string, any> }) => 
    apiFetch<T>(url, { method: 'DELETE', ...options }),
};

export { ApiError };
