import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  User,
  BellRing,
  Sparkles,
  Flame,
  Gauge,
  SunMedium,
  MoonStar,
  Hash,
  Check,
} from 'lucide-react';
import { useMeetingStore } from '@/store/meetingStore';
import { formatDate, isOverdue } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';
import type { TodoItem } from '@/types';

interface KanbanColumnProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  headerIconBg: string;
  accentColor: string;
  todos: TodoItem[];
  emptyText: string;
  emptyIcon: React.ReactNode;
  showOverdueWarning?: boolean;
  columnBg: string;
}

function getDaysRemaining(dueDate?: string): number {
  if (!dueDate) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function TodoReminderCard({
  todo,
  showOverdueWarning,
}: {
  todo: TodoItem;
  showOverdueWarning?: boolean;
}) {
  const overdue = showOverdueWarning || isOverdue(todo);
  const isCompleted = todo.status === 'completed';
  const daysRemaining = getDaysRemaining(todo.due_date);

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all hover:shadow-md bg-white ${
        isCompleted
          ? 'border-gray-200 opacity-75'
          : overdue
          ? 'border-red-200 hover:border-red-300'
          : 'border-gray-200 hover:border-indigo-200'
      }`}
    >
      {overdue && !isCompleted && (
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
      )}

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <StatusBadge status={todo.status} className="flex-shrink-0 scale-90" />
        {overdue && !isCompleted && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
            <Flame className="h-3 w-3" />
            已逾期 {Math.abs(daysRemaining)} 天
          </span>
        )}
        {!overdue && !isCompleted && daysRemaining <= 3 && daysRemaining >= 0 && todo.due_date && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              daysRemaining === 0
                ? 'bg-orange-100 text-orange-700 border border-orange-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            {daysRemaining === 0 ? (
              <>
                <SunMedium className="h-3 w-3" />
                今天到期
              </>
            ) : (
              <>
                <Clock className="h-3 w-3" />
                剩 {daysRemaining} 天
              </>
            )}
          </span>
        )}
        {todo.topic_title && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <Hash className="h-2.5 w-2.5" />
            {todo.topic_title}
          </span>
        )}
      </div>

      <h4
        className={`text-sm font-semibold leading-snug mb-2 line-clamp-2 ${
          isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
        }`}
      >
        {todo.title}
      </h4>

      {todo.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
          {todo.description}
        </p>
      )}

      {todo.completion_note && (
        <div className="mb-3 rounded-lg bg-green-50 border border-green-100 p-2.5">
          <p className="text-xs text-green-700 flex items-start gap-1.5 leading-relaxed">
            <Check className="h-3 w-3 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{todo.completion_note}</span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
              <User className="h-3 w-3 text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">{todo.assignee}</span>
          </div>
          {todo.due_date && (
            <div className="flex items-center gap-1">
              <Calendar
                className={`h-3 w-3 ${
                  overdue && !isCompleted ? 'text-red-500' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  overdue && !isCompleted ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {formatDate(todo.due_date)}
              </span>
            </div>
          )}
        </div>

        {todo.meeting_title && (
          <Link
            to={`/meetings/${todo.meeting_id}`}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 group-hover:underline"
            title={`查看会议: ${todo.meeting_title}`}
          >
            <span className="max-w-[80px] truncate">{todo.meeting_title}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </Link>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  title,
  subtitle,
  icon,
  headerBg,
  headerBorder,
  headerText,
  headerIconBg,
  accentColor,
  todos,
  emptyText,
  emptyIcon,
  showOverdueWarning,
  columnBg,
}: KanbanColumnProps) {
  return (
    <div className={`flex flex-col rounded-2xl border ${headerBorder} ${columnBg} min-h-[500px]`}>
      <div
        className={`px-5 py-4 rounded-t-2xl border-b ${headerBorder} ${headerBg} sticky top-0 z-10`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${headerIconBg} flex items-center justify-center shadow-sm`}>
              <span className={headerText}>{icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                <span
                  className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-bold ${accentColor}`}
                >
                  {todos.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-340px)]">
        {todos.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-gray-400">{emptyIcon}</span>
            </div>
            <p className="text-sm text-gray-400 font-medium">{emptyText}</p>
          </div>
        ) : (
          todos.map((todo) => (
            <TodoReminderCard
              key={todo.id}
              todo={todo}
              showOverdueWarning={showOverdueWarning}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SummaryBar({
  todayCount,
  threeDaysCount,
  overdueCount,
  completedCount,
}: {
  todayCount: number;
  threeDaysCount: number;
  overdueCount: number;
  completedCount: number;
}) {
  const total = todayCount + threeDaysCount + overdueCount;
  const urgentPercent = total > 0 ? Math.round(((todayCount + overdueCount) / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <BellRing className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">待办提醒看板</h2>
            <p className="text-sm text-gray-500 mt-0.5">按时间优先级分类展示待办事项</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 flex-1 max-w-xl">
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/30 border border-orange-200">
            <p className="text-xs text-orange-700 font-semibold mb-1">今日到期</p>
            <p className="text-2xl font-bold text-orange-600">{todayCount}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/30 border border-blue-200">
            <p className="text-xs text-blue-700 font-semibold mb-1">三天内</p>
            <p className="text-2xl font-bold text-blue-600">{threeDaysCount}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100/30 border border-red-200">
            <p className="text-xs text-red-700 font-semibold mb-1">已逾期</p>
            <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100/30 border border-green-200">
            <p className="text-xs text-green-700 font-semibold mb-1">已完成</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">紧急待办占比</span>
              <span className="text-xs text-gray-400">(今日到期 + 已逾期)</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{urgentPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden flex">
            {overdueCount > 0 && (
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-600"
                style={{ width: `${(overdueCount / total) * 100}%` }}
              />
            )}
            {todayCount > 0 && (
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500"
                style={{ width: `${(todayCount / total) * 100}%` }}
              />
            )}
            {threeDaysCount > 0 && (
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                style={{ width: `${(threeDaysCount / total) * 100}%` }}
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                已逾期
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                今日到期
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                三天内
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-200 bg-white min-h-[500px] animate-pulse"
        >
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-200" />
              <div className="space-y-2">
                <div className="w-24 h-5 bg-gray-200 rounded" />
                <div className="w-20 h-3 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="w-14 h-5 bg-gray-100 rounded-full" />
                  <div className="w-16 h-5 bg-gray-100 rounded-full" />
                </div>
                <div className="w-full h-4 bg-gray-200 rounded" />
                <div className="w-3/4 h-3 bg-gray-100 rounded" />
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    <div className="w-20 h-4 bg-gray-100 rounded" />
                  </div>
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TodoReminders() {
  const { todoReminders, fetchTodoReminders, loading } = useMeetingStore();

  useEffect(() => {
    fetchTodoReminders();
  }, [fetchTodoReminders]);

  if (loading && !todoReminders) {
    return (
      <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 animate-pulse" />
            <div className="space-y-2">
              <div className="w-40 h-7 bg-gray-200 rounded animate-pulse" />
              <div className="w-56 h-4 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse mb-6" />
        <KanbanSkeleton />
      </div>
    );
  }

  if (!todoReminders) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <Empty title="加载失败" description="无法获取待办提醒数据" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <BellRing className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">待办提醒</h1>
            <p className="text-sm text-gray-500">看板视图按时间优先级分类</p>
          </div>
        </div>
      </div>

      <SummaryBar
        todayCount={todoReminders.today.length}
        threeDaysCount={todoReminders.inThreeDays.length}
        overdueCount={todoReminders.overdue.length}
        completedCount={todoReminders.completed.length}
      />

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        <KanbanColumn
          title="今日到期"
          subtitle="需要今天处理的待办"
          icon={<Clock className="h-5 w-5" />}
          headerBg="bg-gradient-to-r from-orange-50 to-amber-50"
          headerBorder="border-orange-200"
          headerText="text-orange-600"
          headerIconBg="bg-gradient-to-br from-orange-400 to-orange-500"
          accentColor="bg-orange-500 text-white"
          todos={todoReminders.today}
          emptyText="今天没有待办事项 🎉"
          emptyIcon={<SunMedium className="h-6 w-6" />}
          columnBg="bg-gradient-to-b from-orange-50/30 to-white"
        />

        <KanbanColumn
          title="三天内到期"
          subtitle="明后天的待办任务"
          icon={<Calendar className="h-5 w-5" />}
          headerBg="bg-gradient-to-r from-blue-50 to-indigo-50"
          headerBorder="border-blue-200"
          headerText="text-blue-600"
          headerIconBg="bg-gradient-to-br from-blue-400 to-blue-500"
          accentColor="bg-blue-500 text-white"
          todos={todoReminders.inThreeDays}
          emptyText="近期暂无待办"
          emptyIcon={<MoonStar className="h-6 w-6" />}
          columnBg="bg-gradient-to-b from-blue-50/30 to-white"
        />

        <KanbanColumn
          title="已逾期"
          subtitle="需立即处理的风险项"
          icon={<AlertTriangle className="h-5 w-5" />}
          headerBg="bg-gradient-to-r from-red-50 to-rose-50"
          headerBorder="border-red-200"
          headerText="text-red-600"
          headerIconBg="bg-gradient-to-br from-red-400 to-red-500"
          accentColor="bg-red-500 text-white"
          todos={todoReminders.overdue}
          emptyText="没有逾期，干得漂亮!"
          emptyIcon={<Sparkles className="h-6 w-6" />}
          showOverdueWarning
          columnBg="bg-gradient-to-b from-red-50/40 to-white"
        />

        <KanbanColumn
          title="已完成"
          subtitle="最近已完成的待办"
          icon={<CheckCircle2 className="h-5 w-5" />}
          headerBg="bg-gradient-to-r from-green-50 to-emerald-50"
          headerBorder="border-green-200"
          headerText="text-green-600"
          headerIconBg="bg-gradient-to-br from-green-400 to-green-500"
          accentColor="bg-green-500 text-white"
          todos={todoReminders.completed}
          emptyText="还没有已完成的待办"
          emptyIcon={<CheckCircle2 className="h-6 w-6" />}
          columnBg="bg-gradient-to-b from-green-50/30 to-white"
        />
      </div>
    </div>
  );
}
