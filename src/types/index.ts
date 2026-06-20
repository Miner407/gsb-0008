export interface Participant {
  id?: number;
  name: string;
  role?: string;
}

export interface Topic {
  id?: number;
  title: string;
  description?: string;
  discussion?: string;
  sort_order?: number;
}

export interface TodoItem {
  id?: number;
  meeting_id?: number;
  topic_id?: number | null;
  title: string;
  description?: string;
  assignee: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completion_note?: string;
  created_at?: string;
  updated_at?: string;
  meeting_title?: string;
  topic_title?: string;
}

export interface Meeting {
  id?: number;
  title: string;
  meeting_date: string;
  location?: string;
  conclusion?: string;
  created_at?: string;
  updated_at?: string;
  participant_count?: number;
  todo_count?: number;
  completed_todo_count?: number;
  participants?: Participant[];
  topics?: Topic[];
  todos?: TodoItem[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: Pagination;
  assignees?: string[];
}

export interface TodoFilter {
  assignee?: string;
  overdue?: boolean;
  status?: string;
  meeting_id?: number;
  page?: number;
  pageSize?: number;
}
