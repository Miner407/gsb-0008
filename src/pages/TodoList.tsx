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
  ListTodo,
  Clock,
  SlidersHorizontal,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Hash,
  Loader2,
} from 'lucide-react';
import { useMeetingStore } from '@/store/meetingStore';
import { formatDate, isOverdue } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';
import type { TodoItem } from '@/types';

function StatMiniCard({
  label,
  value,
  icon: Icon,
  active,
  onClick,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick?: () => void;
  color: string;
  bgColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-3 rounded-xl border p-4 transition-all text-left ${
        active
          ? 'border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/20'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center transition-transform group-hover:scale-105`}
      >
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${active ? 'text-indigo-600' : 'text-gray-900'}`}>
          {value}
        </p>
      </div>
      {active && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
      )}
    </button>
  );
}

function BatchToolbar({
  selectedCount,
  onClearSelection,
  onBatchStatus,
  onBatchAssignee,
  onBatchDelete,
  batchStatus,
  setBatchStatus,
  batchAssignee,
  setBatchAssignee,
  assignees,
}: {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchStatus: () => void;
  onBatchAssignee: () => void;
  onBatchDelete: () => void;
  batchStatus: string;
  setBatchStatus: (v: string) => void;
  batchAssignee: string;
  setBatchAssignee: (v: string) => void;
  assignees: string[];
}) {
  return (
    <div className="sticky top-4 z-30 mx-auto max-w-full">
      <div className="relative rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 shadow-xl shadow-indigo-500/10 p-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                已选择 <span className="text-indigo-600 text-lg">{selectedCount}</span> 个待办事项
              </p>
              <p className="text-xs text-gray-500">可对选中项执行以下批量操作</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
              <select
                value={batchStatus}
                onChange={(e) => setBatchStatus(e.target.value)}
                className="text-sm border-0 bg-transparent focus:outline-none focus:ring-0 px-2 py-1.5 text-gray-700 cursor-pointer"
              >
                <option value="">设置状态...</option>
                <option value="pending">待处理</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
              <button
                onClick={onBatchStatus}
                disabled={!batchStatus}
                className="px-4 py-1.5 text-sm font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-500/30 disabled:shadow-none"
              >
                应用
              </button>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
              <Users className="h-4 w-4 text-gray-400 ml-2" />
              <select
                value={batchAssignee}
                onChange={(e) => setBatchAssignee(e.target.value)}
                className="text-sm border-0 bg-transparent focus:outline-none focus:ring-0 px-2 py-1.5 text-gray-700 cursor-pointer"
              >
                <option value="">设置负责人...</option>
                {assignees.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <button
                onClick={onBatchAssignee}
                disabled={!batchAssignee}
                className="px-4 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-500/30 disabled:shadow-none"
              >
                应用
              </button>
            </div>

            <button
              onClick={onBatchDelete}
              className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-sm shadow-red-500/30 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </button>

            <button
              onClick={onClearSelection}
              className="px-4 py-2 text-sm font-medium bg-white text-gray-600 rounded-xl hover:bg-gray-50 border border-gray-200 transition-all flex items-center gap-2 shadow-sm"
            >
              <X className="h-4 w-4" />
              取消选择
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchFilterBar({
  searchText,
  setSearchText,
  selectedAssignee,
  setSelectedAssignee,
  showOverdueOnly,
  setShowOverdueOnly,
  selectedStatus,
  setSelectedStatus,
  meetingIdFilter,
  setMeetingIdFilter,
  clearFilters,
  hasActiveFilters,
  assignees,
}: {
  searchText: string;
  setSearchText: (v: string) => void;
  selectedAssignee: string;
  setSelectedAssignee: (v: string) => void;
  showOverdueOnly: boolean;
  setShowOverdueOnly: (v: boolean) => void;
  selectedStatus: string;
  setSelectedStatus: (v: string) => void;
  meetingIdFilter: string;
  setMeetingIdFilter: (v: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  assignees: string[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
          <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
        </div>
        <span className="text-sm font-semibold text-gray-900">筛选与搜索</span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            重置
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4.5 w-4.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="搜索待办、负责人、会议、议题..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-gray-50/50 focus:bg-white"
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
            }}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-gray-50/50 focus:bg-white cursor-pointer appearance-none"
          >
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <select
            value={selectedAssignee}
            onChange={(e) => {
              setSelectedAssignee(e.target.value);
            }}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-gray-50/50 focus:bg-white cursor-pointer appearance-none"
          >
            <option value="">全部负责人</option>
            {assignees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3 flex items-center gap-3">
          <label
            className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl border transition-all ${
              showOverdueOnly
                ? 'border-red-300 bg-red-50 ring-2 ring-red-500/10'
                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-white'
            }`}
          >
            <input
              type="checkbox"
              checked={showOverdueOnly}
              onChange={(e) => setShowOverdueOnly(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <AlertCircle className={`h-4 w-4 ${showOverdueOnly ? 'text-red-500' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${showOverdueOnly ? 'text-red-600' : 'text-gray-700'}`}>
              仅逾期
            </span>
          </label>

          {meetingIdFilter && (
            <button
              onClick={() => setMeetingIdFilter('')}
              className="flex items-center gap-1.5 px-3 py-3 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold hover:bg-indigo-200 transition-colors"
            >
              <Hash className="h-4 w-4" />
              会议 {meetingIdFilter}
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TodoTableRow({
  todo,
  selected,
  onToggleSelect,
  editingTodo,
  editForm,
  setEditForm,
  setEditingTodo,
  handleSaveEdit,
  showCompletionInput,
  completionNote,
  setCompletionNote,
  setShowCompletionInput,
  handleCompleteWithNote,
  handleStatusChange,
  handleEdit,
}: {
  todo: TodoItem;
  selected: boolean;
  onToggleSelect: () => void;
  editingTodo: number | null;
  editForm: Partial<TodoItem>;
  setEditForm: (v: Partial<TodoItem>) => void;
  setEditingTodo: (v: number | null) => void;
  handleSaveEdit: (id: number) => void;
  showCompletionInput: number | null;
  completionNote: string;
  setCompletionNote: (v: string) => void;
  setShowCompletionInput: (v: number | null) => void;
  handleCompleteWithNote: (id: number) => void;
  handleStatusChange: (id: number, status: string) => void;
  handleEdit: (todo: TodoItem) => void;
}) {
  const overdue = isOverdue(todo);
  const isCompleted = todo.status === 'completed';

  return (
    <tr
      className={`border-b border-gray-100 transition-colors ${
        selected
          ? 'bg-indigo-50/60'
          : isCompleted
          ? 'bg-gray-50/30'
          : overdue
          ? 'bg-red-50/30'
          : 'hover:bg-gray-50/60'
      }`}
    >
      <td className="px-4 py-4 whitespace-nowrap">
        <button
          onClick={onToggleSelect}
          className={`p-1.5 rounded-lg transition-all ${
            selected
              ? 'bg-indigo-100 hover:bg-indigo-200'
              : 'hover:bg-gray-100'
          }`}
        >
          {selected ? (
            <CheckSquare className="h-5 w-5 text-indigo-600" />
          ) : (
            <Square className="h-5 w-5 text-gray-300 hover:text-gray-400" />
          )}
        </button>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap items-center gap-2">
          {editingTodo === todo.id ? (
            <select
              value={editForm.status || todo.status}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  status: e.target.value as TodoItem['status'],
                })
              }
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pending">待处理</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          ) : (
            <>
              <StatusBadge status={todo.status} />
              {overdue && !isCompleted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                  <AlertTriangle className="h-3 w-3" />
                  逾期
                </span>
              )}
            </>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        {editingTodo === todo.id ? (
          <div className="space-y-2 max-w-md">
            <input
              type="text"
              value={editForm.title || ''}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="待办事项标题"
            />
            <input
              type="text"
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="描述"
            />
            {todo.topic_title && (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Hash className="h-3 w-3" />
                关联议题: {todo.topic_title}
              </p>
            )}
          </div>
        ) : (
          <div className="max-w-md">
            <p
              className={`text-sm font-semibold ${
                isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
              }`}
            >
              {todo.title}
            </p>
            {todo.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{todo.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {todo.topic_title && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Hash className="h-3 w-3" />
                  {todo.topic_title}
                </span>
              )}
              {todo.completion_note && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-100">
                  <Check className="h-3 w-3" />
                  {todo.completion_note}
                </span>
              )}
            </div>
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {editingTodo === todo.id ? (
          <input
            type="text"
            value={editForm.assignee || ''}
            onChange={(e) => setEditForm({ ...editForm, assignee: e.target.value })}
            className="w-28 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="负责人"
          />
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shadow-sm">
              <span className="text-xs font-bold text-indigo-700">{todo.assignee.charAt(0)}</span>
            </div>
            <span className="text-sm font-medium text-gray-700">{todo.assignee}</span>
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {editingTodo === todo.id ? (
          <input
            type="date"
            value={editForm.due_date || ''}
            onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              overdue && !isCompleted
                ? 'bg-red-50 border border-red-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <Calendar
              className={`h-3.5 w-3.5 ${
                overdue && !isCompleted ? 'text-red-500' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                overdue && !isCompleted ? 'text-red-700' : 'text-gray-700'
              }`}
            >
              {formatDate(todo.due_date)}
            </span>
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap max-w-[200px]">
        {todo.meeting_title && (
          <Link
            to={`/meetings/${todo.meeting_id}`}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium group"
          >
            <span className="truncate group-hover:underline">{todo.meeting_title}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center justify-end gap-2">
          {editingTodo === todo.id ? (
            <>
              <button
                onClick={() => handleSaveEdit(todo.id!)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-sm shadow-green-500/30"
              >
                <Check className="h-3.5 w-3.5" />
                保存
              </button>
              <button
                onClick={() => setEditingTodo(null)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                取消
              </button>
            </>
          ) : showCompletionInput === todo.id ? (
            <div className="w-52">
              <input
                type="text"
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                placeholder="完成备注..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleCompleteWithNote(todo.id!)}
                  className="flex-1 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                >
                  确认完成
                </button>
                <button
                  onClick={() => setShowCompletionInput(null)}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <>
              <select
                value={todo.status}
                onChange={(e) => handleStatusChange(todo.id!, e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer font-medium text-gray-700 hover:border-gray-300"
              >
                <option value="pending">待处理</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
              <button
                onClick={() => handleEdit(todo)}
                className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="编辑"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function TableHeader({
  allSelected,
  onToggleSelectAll,
}: {
  allSelected: boolean;
  onToggleSelectAll: () => void;
}) {
  return (
    <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
      <tr>
        <th className="px-4 py-4 text-left w-12">
          <button
            onClick={onToggleSelectAll}
            className="p-1.5 rounded-lg hover:bg-gray-200/50 transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="h-5 w-5 text-indigo-600" />
            ) : (
              <Square className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            )}
          </button>
        </th>
        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
          状态
        </th>
        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
          待办事项
        </th>
        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
          负责人
        </th>
        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
          截止日期
        </th>
        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
          关联会议
        </th>
        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
          操作
        </th>
      </tr>
    </thead>
  );
}

function LoadingRows() {
  return (
    <tbody>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b border-gray-100 animate-pulse">
          <td className="px-4 py-4">
            <div className="w-5 h-5 bg-gray-200 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="w-16 h-6 bg-gray-200 rounded-full" />
          </td>
          <td className="px-6 py-4">
            <div className="space-y-2">
              <div className="w-48 h-4 bg-gray-200 rounded" />
              <div className="w-32 h-3 bg-gray-100 rounded" />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="w-16 h-4 bg-gray-200 rounded" />
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="w-24 h-6 bg-gray-200 rounded-lg" />
          </td>
          <td className="px-6 py-4">
            <div className="w-28 h-4 bg-gray-200 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="flex justify-end gap-2">
              <div className="w-20 h-8 bg-gray-200 rounded-lg" />
              <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

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
  const [selectedAssignee, setSelectedAssignee] = useState(searchParams.get('assignee') || '');
  const [showOverdueOnly, setShowOverdueOnly] = useState(searchParams.get('overdue') === 'true');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [meetingIdFilter, setMeetingIdFilter] = useState(searchParams.get('meeting_id') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<TodoItem>>({});
  const [completionNote, setCompletionNote] = useState('');
  const [showCompletionInput, setShowCompletionInput] = useState<number | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchStatus, setBatchStatus] = useState('');
  const [batchAssignee, setBatchAssignee] = useState('');

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
    setSearchText('');
  };

  const hasActiveFilters = !!(
    selectedAssignee || showOverdueOnly || selectedStatus || meetingIdFilter || searchText
  );

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
    const cancelled = todos.filter((t) => t.status === 'cancelled').length;
    return { total, completed, pending, inProgress, overdue, cancelled };
  }, [todos]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTodos.length && filteredTodos.length > 0) {
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
    const success = await batchUpdateTodoStatus(Array.from(selectedIds), batchStatus);
    if (success) {
      setSelectedIds(new Set());
      setBatchStatus('');
      fetchTodos(filter);
    }
  };

  const handleBatchAssignee = async () => {
    if (selectedIds.size === 0 || !batchAssignee) return;
    const success = await batchUpdateTodoAssignee(Array.from(selectedIds), batchAssignee);
    if (success) {
      setSelectedIds(new Set());
      setBatchAssignee('');
      fetchTodos(filter);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定要删除选中的 ${selectedIds.size} 个待办事项吗？`)) return;
    const success = await batchDeleteTodos(Array.from(selectedIds));
    if (success) {
      setSelectedIds(new Set());
      fetchTodos(filter);
    }
  };

  const selectedCount = selectedIds.size;
  const allSelected =
    filteredTodos.length > 0 && selectedIds.size === filteredTodos.length;

  const handleStatusFilterClick = (status: string) => {
    if (selectedStatus === status) {
      setSelectedStatus('');
    } else {
      setSelectedStatus(status);
    }
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <ListTodo className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">待办事项</h1>
            <p className="text-sm text-gray-500">追踪和管理所有会议产生的待办</p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatMiniCard
          label="全部"
          value={todoStats.total}
          icon={ListTodo}
          color="text-gray-600"
          bgColor="bg-gray-100"
          active={!selectedStatus && !showOverdueOnly}
          onClick={() => {
            setSelectedStatus('');
            setShowOverdueOnly(false);
          }}
        />
        <StatMiniCard
          label="待处理"
          value={todoStats.pending}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
          active={selectedStatus === 'pending'}
          onClick={() => handleStatusFilterClick('pending')}
        />
        <StatMiniCard
          label="进行中"
          value={todoStats.inProgress}
          icon={TrendingUp}
          color="text-blue-600"
          bgColor="bg-blue-100"
          active={selectedStatus === 'in_progress'}
          onClick={() => handleStatusFilterClick('in_progress')}
        />
        <StatMiniCard
          label="已完成"
          value={todoStats.completed}
          icon={Check}
          color="text-green-600"
          bgColor="bg-green-100"
          active={selectedStatus === 'completed'}
          onClick={() => handleStatusFilterClick('completed')}
        />
        <StatMiniCard
          label="已逾期"
          value={todoStats.overdue}
          icon={AlertTriangle}
          color="text-red-600"
          bgColor="bg-red-100"
          active={showOverdueOnly}
          onClick={() => {
            setShowOverdueOnly(!showOverdueOnly);
            setCurrentPage(1);
          }}
        />
        <StatMiniCard
          label="已取消"
          value={todoStats.cancelled}
          icon={X}
          color="text-gray-500"
          bgColor="bg-gray-100"
          active={selectedStatus === 'cancelled'}
          onClick={() => handleStatusFilterClick('cancelled')}
        />
      </div>

      <div className="mb-6">
        <SearchFilterBar
          searchText={searchText}
          setSearchText={setSearchText}
          selectedAssignee={selectedAssignee}
          setSelectedAssignee={(v) => {
            setSelectedAssignee(v);
            setCurrentPage(1);
          }}
          showOverdueOnly={showOverdueOnly}
          setShowOverdueOnly={(v) => {
            setShowOverdueOnly(v);
            setCurrentPage(1);
          }}
          selectedStatus={selectedStatus}
          setSelectedStatus={(v) => {
            setSelectedStatus(v);
            setCurrentPage(1);
          }}
          meetingIdFilter={meetingIdFilter}
          setMeetingIdFilter={(v) => {
            setMeetingIdFilter(v);
            setCurrentPage(1);
          }}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          assignees={assignees}
        />
      </div>

      {selectedCount > 0 && (
        <div className="mb-6">
          <BatchToolbar
            selectedCount={selectedCount}
            onClearSelection={() => setSelectedIds(new Set())}
            onBatchStatus={handleBatchStatus}
            onBatchAssignee={handleBatchAssignee}
            onBatchDelete={handleBatchDelete}
            batchStatus={batchStatus}
            setBatchStatus={setBatchStatus}
            batchAssignee={batchAssignee}
            setBatchAssignee={setBatchAssignee}
            assignees={assignees}
          />
        </div>
      )}

      {loading && filteredTodos.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <table className="min-w-full">
            <TableHeader allSelected={false} onToggleSelectAll={() => {}} />
            <LoadingRows />
          </table>
        </div>
      ) : filteredTodos.length === 0 ? (
        <Empty
          title={hasActiveFilters ? '没有匹配的待办' : '暂无待办事项'}
          description={
            hasActiveFilters
              ? '尝试调整筛选条件或清除筛选'
              : '还没有创建任何待办事项，在创建会议时可以添加待办事项'
          }
          actionText={hasActiveFilters ? '清除筛选条件' : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
          icon={Sparkles}
        />
      ) : (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <TableHeader allSelected={allSelected} onToggleSelectAll={toggleSelectAll} />
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredTodos.map((todo) => (
                    <TodoTableRow
                      key={todo.id}
                      todo={todo}
                      selected={selectedIds.has(todo.id!)}
                      onToggleSelect={() => toggleSelect(todo.id!)}
                      editingTodo={editingTodo}
                      editForm={editForm}
                      setEditForm={setEditForm}
                      setEditingTodo={setEditingTodo}
                      handleSaveEdit={handleSaveEdit}
                      showCompletionInput={showCompletionInput}
                      completionNote={completionNote}
                      setCompletionNote={setCompletionNote}
                      setShowCompletionInput={setShowCompletionInput}
                      handleCompleteWithNote={handleCompleteWithNote}
                      handleStatusChange={handleStatusChange}
                      handleEdit={handleEdit}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-white flex items-center justify-between flex-wrap gap-3">
              <div className="text-sm text-gray-500">
                显示 <span className="font-semibold text-gray-900">{filteredTodos.length}</span> 条，
                共 <span className="font-semibold text-gray-900">{pagination.total}</span> 条待办
                {selectedCount > 0 && (
                  <span className="ml-3 text-indigo-600 font-medium">
                    (已选 {selectedCount} 条)
                  </span>
                )}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                  </button>
                  <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <span className="text-sm text-gray-600">
                      第 <span className="font-bold text-gray-900">{currentPage}</span> /{' '}
                      {pagination.totalPages} 页
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="p-2.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
