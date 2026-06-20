import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ExternalLink,
  AlertCircle,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  Edit2,
  Square,
  CheckSquare,
  Users,
  Trash2,
} from 'lucide-react';
import { useMeetingStore } from '@/store/meetingStore';
import { formatDate, isOverdue } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';
import type { TodoItem } from '@/types';

export default function TodoList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    todos,
    assignees,
    fetchTodos,
    updateTodoStatus,
    updateTodo,
    deleteTodo,
    batchUpdateTodoStatus,
    batchUpdateTodoAssignee,
    batchDeleteTodos,
    loading,
    pagination,
  } = useMeetingStore();

  const [searchText, setSearchText] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState(
    searchParams.get('assignee') || ''
  );
  const [showOverdueOnly, setShowOverdueOnly] = useState(
    searchParams.get('overdue') === 'true'
  );
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get('status') || ''
  );
  const [meetingIdFilter, setMeetingIdFilter] = useState(
    searchParams.get('meeting_id') || ''
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<TodoItem>>({});
  const [completionNote, setCompletionNote] = useState('');
  const [showCompletionInput, setShowCompletionInput] = useState<number | null>(
    null
  );

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchStatus, setBatchStatus] = useState('');
  const [batchAssignee, setBatchAssignee] = useState('');
  const [showBatchDialog] = useState(false);

  const filter = useMemo(
    () => ({
      assignee: selectedAssignee || undefined,
      overdue: showOverdueOnly || undefined,
      status: selectedStatus || undefined,
      meeting_id: meetingIdFilter ? Number(meetingIdFilter) : undefined,
      page: currentPage,
      pageSize: 20,
    }),
    [selectedAssignee, showOverdueOnly, selectedStatus, meetingIdFilter, currentPage]
  );

  useEffect(() => {
    fetchTodos(filter);
  }, [filter, fetchTodos]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedAssignee) params.assignee = selectedAssignee;
    if (showOverdueOnly) params.overdue = 'true';
    if (selectedStatus) params.status = selectedStatus;
    if (meetingIdFilter) params.meeting_id = meetingIdFilter;
    setSearchParams(params);
  }, [selectedAssignee, showOverdueOnly, selectedStatus, meetingIdFilter, setSearchParams]);

  const handleStatusChange = async (todoId: number, status: string) => {
    if (status === 'completed') {
      setShowCompletionInput(todoId);
      setCompletionNote('');
    } else {
      await updateTodoStatus(todoId, status);
    }
  };

  const handleCompleteWithNote = async (todoId: number) => {
    await updateTodoStatus(todoId, 'completed', completionNote);
    setShowCompletionInput(null);
    setCompletionNote('');
  };

  const handleEdit = (todo: TodoItem) => {
    setEditingTodo(todo.id!);
    setEditForm({
      title: todo.title,
      description: todo.description,
      assignee: todo.assignee,
      due_date: todo.due_date,
    });
  };

  const handleSaveEdit = async (todoId: number) => {
    const success = await updateTodo(todoId, editForm);
    if (success) {
      setEditingTodo(null);
      fetchTodos(filter);
    }
  };

  const _handleDelete = async (todoId: number) => {
    if (window.confirm('确定要删除这个待办事项吗？')) {
      await deleteTodo(todoId);
      fetchTodos(filter);
    }
  };

  const clearFilters = () => {
    setSelectedAssignee('');
    setShowOverdueOnly(false);
    setSelectedStatus('');
    setMeetingIdFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedAssignee || showOverdueOnly || selectedStatus || meetingIdFilter;

  const filteredTodos = useMemo(() => {
    if (!searchText) return todos;
    const search = searchText.toLowerCase();
    return todos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(search) ||
        todo.assignee.toLowerCase().includes(search) ||
        todo.meeting_title?.toLowerCase().includes(search) ||
        todo.topic_title?.toLowerCase().includes(search)
    );
  }, [todos, searchText]);

  const todoStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.status === 'completed').length;
    const pending = todos.filter((t) => t.status === 'pending').length;
    const inProgress = todos.filter((t) => t.status === 'in_progress').length;
    const overdue = todos.filter((t) => isOverdue(t)).length;
    return { total, completed, pending, inProgress, overdue };
  }, [todos]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTodos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(
          filteredTodos
            .map((t) => t.id!)
            .filter((id): id is number => id !== undefined)
        )
      );
    }
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchStatus = async () => {
    if (selectedIds.size === 0 || !batchStatus) return;
    const success = await batchUpdateTodoStatus(
      Array.from(selectedIds),
      batchStatus
    );
    if (success) {
      setSelectedIds(new Set());
      setBatchStatus('');
      fetchTodos(filter);
    }
  };

  const handleBatchAssignee = async () => {
    if (selectedIds.size === 0 || !batchAssignee) return;
    const success = await batchUpdateTodoAssignee(
      Array.from(selectedIds),
      batchAssignee
    );
    if (success) {
      setSelectedIds(new Set());
      setBatchAssignee('');
      fetchTodos(filter);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 个待办事项吗？`))
      return;
    const success = await batchDeleteTodos(Array.from(selectedIds));
    if (success) {
      setSelectedIds(new Set());
      fetchTodos(filter);
    }
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">待办事项</h1>
        <p className="text-gray-600">追踪和管理所有会议产生的待办事项</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">全部</p>
          <p className="text-2xl font-bold text-gray-900">{todoStats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">待处理</p>
          <p className="text-2xl font-bold text-yellow-600">{todoStats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">进行中</p>
          <p className="text-2xl font-bold text-blue-600">{todoStats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">已完成</p>
          <p className="text-2xl font-bold text-green-600">{todoStats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">已逾期</p>
          <p className="text-2xl font-bold text-red-600">{todoStats.overdue}</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索待办事项..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Filter className="inline h-3 w-3 mr-1" />
                负责人
              </label>
              <select
                value={selectedAssignee}
                onChange={(e) => {
                  setSelectedAssignee(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">全部</option>
                {assignees.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                状态
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">全部</option>
                <option value="pending">待处理</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={showOverdueOnly}
                  onChange={(e) => {
                    setShowOverdueOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  只看逾期
                </span>
              </label>
            </div>

            {meetingIdFilter && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setMeetingIdFilter('');
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md text-sm hover:bg-indigo-200"
                >
                  会议 #{meetingIdFilter}
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  清除筛选
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-indigo-800">
              <CheckSquare className="h-4 w-4" />
              已选择 <span className="font-semibold">{selectedCount}</span> 个待办事项
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <select
                  value={batchStatus}
                  onChange={(e) => setBatchStatus(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">批量设置状态...</option>
                  <option value="pending">待处理</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
                <button
                  onClick={handleBatchStatus}
                  disabled={!batchStatus}
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  应用状态
                </button>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={batchAssignee}
                  onChange={(e) => setBatchAssignee(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">批量设置负责人...</option>
                  {assignees.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBatchAssignee}
                  disabled={!batchAssignee}
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Users className="inline h-3.5 w-3.5 mr-1" />
                  应用
                </button>
              </div>
              <button
                onClick={handleBatchDelete}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                删除
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                取消选择
              </button>
            </div>
            {showBatchDialog}
          </div>
        </div>
      )}

      {loading && filteredTodos.length === 0 ? (
        <div className="text-center py-12">加载中...</div>
      ) : filteredTodos.length === 0 ? (
        <Empty
          title="暂无待办事项"
          description={
            hasActiveFilters
              ? '没有符合筛选条件的待办事项'
              : '还没有创建任何待办事项，在创建会议时可以添加待办事项'
          }
          actionText={hasActiveFilters ? '清除筛选' : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        <>
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button
                        onClick={toggleSelectAll}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {selectedIds.size === filteredTodos.length &&
                        filteredTodos.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      待办事项
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      负责人
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      截止日期
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      关联会议
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTodos.map((todo) => (
                    <tr
                      key={todo.id}
                      className={`hover:bg-gray-50 ${
                        todo.status === 'completed' ? 'bg-gray-50' : ''
                      } ${selectedIds.has(todo.id!) ? 'bg-indigo-50' : ''}`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleSelect(todo.id!)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {selectedIds.has(todo.id!) ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {editingTodo === todo.id ? (
                            <div className="w-32">
                              <select
                                value={editForm.status || todo.status}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    status: e.target.value as TodoItem['status'],
                                  })
                                }
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="pending">待处理</option>
                                <option value="in_progress">进行中</option>
                                <option value="completed">已完成</option>
                                <option value="cancelled">已取消</option>
                              </select>
                            </div>
                          ) : (
                            <>
                              <StatusBadge status={todo.status} />
                              {isOverdue(todo) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  逾期
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editingTodo === todo.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editForm.title || ''}
                              onChange={(e) =>
                                setEditForm({ ...editForm, title: e.target.value })
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="待办事项"
                            />
                            <input
                              type="text"
                              value={editForm.description || ''}
                              onChange={(e) =>
                                setEditForm({ ...editForm, description: e.target.value })
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              placeholder="描述"
                            />
                            {todo.topic_title && (
                              <p className="text-xs text-gray-500">议题: {todo.topic_title}</p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                todo.status === 'completed'
                                  ? 'text-gray-500 line-through'
                                  : 'text-gray-900'
                              }`}
                            >
                              {todo.title}
                            </p>
                            {todo.description && (
                              <p className="text-xs text-gray-500 mt-1">{todo.description}</p>
                            )}
                            {todo.topic_title && (
                              <p className="text-xs text-gray-400 mt-1">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                                  {todo.topic_title}
                                </span>
                              </p>
                            )}
                            {todo.completion_note && (
                              <p className="text-xs text-green-600 mt-1">
                                <Check className="inline h-3 w-3 mr-1" />
                                {todo.completion_note}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTodo === todo.id ? (
                          <input
                            type="text"
                            value={editForm.assignee || ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm, assignee: e.target.value })
                            }
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="负责人"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-indigo-600" />
                            </div>
                            <span className="text-sm text-gray-900">{todo.assignee}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingTodo === todo.id ? (
                          <input
                            type="date"
                            value={editForm.due_date || ''}
                            onChange={(e) =>
                              setEditForm({ ...editForm, due_date: e.target.value })
                            }
                            className="px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span
                              className={`text-sm ${
                                isOverdue(todo) ? 'text-red-600 font-medium' : 'text-gray-600'
                              }`}
                            >
                              {formatDate(todo.due_date)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {todo.meeting_title && (
                          <Link
                            to={`/meetings/${todo.meeting_id}`}
                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            <span className="truncate max-w-[150px]">{todo.meeting_title}</span>
                            <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingTodo === todo.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(todo.id!)}
                              className="text-green-600 hover:text-green-800"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingTodo(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              取消
                            </button>
                          </div>
                        ) : showCompletionInput === todo.id ? (
                          <div className="w-48">
                            <input
                              type="text"
                              value={completionNote}
                              onChange={(e) => setCompletionNote(e.target.value)}
                              placeholder="完成备注..."
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-1"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCompleteWithNote(todo.id!)}
                                className="text-xs px-2 py-1 bg-green-600 text-white rounded"
                              >
                                确认完成
                              </button>
                              <button
                                onClick={() => setShowCompletionInput(null)}
                                className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={todo.status}
                              onChange={(e) => handleStatusChange(todo.id!, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="pending">待处理</option>
                              <option value="in_progress">进行中</option>
                              <option value="completed">已完成</option>
                              <option value="cancelled">已取消</option>
                            </select>
                            <button
                              onClick={() => handleEdit(todo)}
                              className="p-1 text-gray-400 hover:text-indigo-600"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">
                第 {currentPage} / {pagination.totalPages} 页 (共 {pagination.total} 条)
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
