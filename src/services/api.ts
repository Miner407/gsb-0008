import type { Meeting, TodoItem, ApiResponse, TodoFilter, Pagination } from '@/types';

const API_BASE = '/api';

async function request<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  return response.json();
}

export const meetingApi = {
  getList: (page = 1, pageSize = 10): Promise<ApiResponse<Meeting[]>> =>
    request(`/meetings?page=${page}&pageSize=${pageSize}`),

  getDetail: (id: number): Promise<ApiResponse<Meeting>> =>
    request(`/meetings/${id}`),

  create: (data: Partial<Meeting>): Promise<ApiResponse<{ id: number }>> =>
    request('/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Meeting>): Promise<ApiResponse<{ id: number }>> =>
    request(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<ApiResponse<void>> =>
    request(`/meetings/${id}`, {
      method: 'DELETE',
    }),
};

export const todoApi = {
  getList: (filter: TodoFilter = {}): Promise<ApiResponse<TodoItem[]>> => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    return request(`/todos?${params.toString()}`);
  },

  getDetail: (id: number): Promise<ApiResponse<TodoItem>> =>
    request(`/todos/${id}`),

  update: (id: number, data: Partial<TodoItem>): Promise<ApiResponse<void>> =>
    request(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: number, status: string, completion_note?: string): Promise<ApiResponse<void>> =>
    request(`/todos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, completion_note }),
    }),

  delete: (id: number): Promise<ApiResponse<void>> =>
    request(`/todos/${id}`, {
      method: 'DELETE',
    }),
};

export const isOverdue = (todo: TodoItem): boolean => {
  if (!todo.due_date || todo.status === 'completed') return false;
  const dueDate = new Date(todo.due_date);
  dueDate.setHours(23, 59, 59, 999);
  return dueDate < new Date();
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
