import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, AlertTriangle, Clock, CheckCircle2, ExternalLink, User } from 'lucide-react';
import { useMeetingStore } from '@/store/meetingStore';
import { formatDate, isOverdue } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';
import type { TodoItem } from '@/types';

interface GroupSectionProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  todos: TodoItem[];
  emptyText: string;
}

function GroupSection({ title, icon, iconBg, iconColor, todos, emptyText }: GroupSectionProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <span className={iconColor}>{icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{todos.length} 项</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {todos.length === 0 ? (
          <p className="text-gray-400 text-center py-4">{emptyText}</p>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                  todo.status === 'completed' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusBadge status={todo.status} />
                      {isOverdue(todo) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          逾期
                        </span>
                      )}
                      {todo.topic_title && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {todo.topic_title}
                        </span>
                      )}
                    </div>
                    <h4
                      className={`font-medium ${
                        todo.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}
                    >
                      {todo.title}
                    </h4>
                    {todo.description && (
                      <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{todo.assignee}</span>
                      </div>
                      {todo.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className={isOverdue(todo) ? 'text-red-600 font-medium' : ''}>
                            {formatDate(todo.due_date)}
                          </span>
                        </div>
                      )}
                    </div>
                    {todo.completion_note && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-green-600">
                          <CheckCircle2 className="inline h-3 w-3 mr-1" />
                          {todo.completion_note}
                        </p>
                      </div>
                    )}
                  </div>
                  {todo.meeting_title && (
                    <Link
                      to={`/meetings/${todo.meeting_id}`}
                      className="flex-shrink-0 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <span className="truncate max-w-[150px]">{todo.meeting_title}</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TodoReminders() {
  const { todoReminders, fetchTodoReminders, loading } = useMeetingStore();

  useEffect(() => {
    fetchTodoReminders();
  }, [fetchTodoReminders]);

  if (loading && !todoReminders) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (!todoReminders) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Empty title="加载失败" description="无法获取待办提醒数据" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">待办提醒</h1>
        <p className="text-gray-600">按时间维度分组查看所有待办事项</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GroupSection
          title="今日到期"
          icon={<Clock className="h-5 w-5" />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          todos={todoReminders.today}
          emptyText="今天没有待办事项"
        />
        <GroupSection
          title="三天内到期"
          icon={<Calendar className="h-5 w-5" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          todos={todoReminders.inThreeDays}
          emptyText="未来三天没有待办事项"
        />
        <GroupSection
          title="已逾期"
          icon={<AlertTriangle className="h-5 w-5" />}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          todos={todoReminders.overdue}
          emptyText="没有逾期的待办事项"
        />
        <GroupSection
          title="已完成"
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          todos={todoReminders.completed}
          emptyText="还没有已完成的待办事项"
        />
      </div>
    </div>
  );
}
