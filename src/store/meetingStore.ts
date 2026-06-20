import { create } from 'zustand';
import { meetingApi, todoApi } from '@/services/api';
import type { Meeting, TodoItem, TodoFilter } from '@/types';

interface MeetingState {
  meetings: Meeting[];
  currentMeeting: Meeting | null;
  todos: TodoItem[];
  assignees: string[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  fetchMeetings: (page?: number, pageSize?: number) => Promise<void>;
  fetchMeetingDetail: (id: number) => Promise<void>;
  createMeeting: (data: Partial<Meeting>) => Promise<number | null>;
  updateMeeting: (id: number, data: Partial<Meeting>) => Promise<boolean>;
  deleteMeeting: (id: number) => Promise<boolean>;
  fetchTodos: (filter?: TodoFilter) => Promise<void>;
  updateTodoStatus: (id: number, status: string, completion_note?: string) => Promise<boolean>;
  updateTodo: (id: number, data: Partial<TodoItem>) => Promise<boolean>;
  deleteTodo: (id: number) => Promise<boolean>;
  clearCurrentMeeting: () => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  currentMeeting: null,
  todos: [],
  assignees: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },

  fetchMeetings: async (page = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await meetingApi.getList(page, pageSize);
      if (response.success) {
        set({
          meetings: response.data || [],
          pagination: response.pagination || get().pagination,
        });
      } else {
        set({ error: response.error || '获取会议列表失败' });
      }
    } catch (error) {
      set({ error: '网络错误' });
    } finally {
      set({ loading: false });
    }
  },

  fetchMeetingDetail: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await meetingApi.getDetail(id);
      if (response.success) {
        set({ currentMeeting: response.data || null });
      } else {
        set({ error: response.error || '获取会议详情失败' });
      }
    } catch (error) {
      set({ error: '网络错误' });
    } finally {
      set({ loading: false });
    }
  },

  createMeeting: async (data: Partial<Meeting>) => {
    set({ loading: true, error: null });
    try {
      const response = await meetingApi.create(data);
      if (response.success && response.data) {
        return response.data.id;
      } else {
        set({ error: response.error || '创建会议失败' });
        return null;
      }
    } catch (error) {
      set({ error: '网络错误' });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateMeeting: async (id: number, data: Partial<Meeting>) => {
    set({ loading: true, error: null });
    try {
      const response = await meetingApi.update(id, data);
      if (response.success) {
        return true;
      } else {
        set({ error: response.error || '更新会议失败' });
        return false;
      }
    } catch (error) {
      set({ error: '网络错误' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteMeeting: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await meetingApi.delete(id);
      if (response.success) {
        return true;
      } else {
        set({ error: response.error || '删除会议失败' });
        return false;
      }
    } catch (error) {
      set({ error: '网络错误' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  fetchTodos: async (filter: TodoFilter = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await todoApi.getList(filter);
      if (response.success) {
        set({
          todos: response.data || [],
          assignees: response.assignees || [],
          pagination: response.pagination || get().pagination,
        });
      } else {
        set({ error: response.error || '获取待办列表失败' });
      }
    } catch (error) {
      set({ error: '网络错误' });
    } finally {
      set({ loading: false });
    }
  },

  updateTodoStatus: async (id: number, status: TodoItem['status'], completion_note?: string) => {
    try {
      const response = await todoApi.updateStatus(id, status, completion_note);
      if (response.success) {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, status, completion_note } : todo
          ),
        }));
        if (get().currentMeeting?.todos) {
          set((state) => ({
            currentMeeting: {
              ...state.currentMeeting!,
              todos: state.currentMeeting!.todos!.map((todo) =>
                todo.id === id ? { ...todo, status, completion_note } : todo
              ),
            },
          }));
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  updateTodo: async (id: number, data: Partial<TodoItem>) => {
    try {
      const response = await todoApi.update(id, data);
      if (response.success) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  deleteTodo: async (id: number) => {
    try {
      const response = await todoApi.delete(id);
      if (response.success) {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  clearCurrentMeeting: () => {
    set({ currentMeeting: null });
  },
}));
