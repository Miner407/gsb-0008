import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  CheckSquare,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  AlertTriangle,
  User,
  TrendingUp,
  Plus,
  BellRing,
  ListTodo,
  Clock,
  ArrowRight,
  LayoutDashboard,
  FileText,
} from 'lucide-react';
import { useMeetingStore } from '@/store/meetingStore';
import { formatDate } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';

function QuickActions({ navigate }: { navigate: (path: string) => void }) {
  const actions = [
    {
      title: '新建会议',
      description: '创建新的会议纪要',
      icon: Plus,
      path: '/meetings/new',
      color: 'from-indigo-500 to-indigo-600',
      hoverBg: 'hover:bg-indigo-50',
      iconBg: 'bg-indigo-500',
    },
    {
      title: '待办提醒',
      description: '查看待办时间分组',
      icon: BellRing,
      path: '/reminders',
      color: 'from-orange-500 to-orange-600',
      hoverBg: 'hover:bg-orange-50',
      iconBg: 'bg-orange-500',
    },
    {
      title: '全部待办',
      description: '管理所有待办事项',
      icon: ListTodo,
      path: '/todos',
      color: 'from-blue-500 to-blue-600',
      hoverBg: 'hover:bg-blue-50',
      iconBg: 'bg-blue-500',
    },
    {
      title: '最近会议',
      description: '浏览最近的会议记录',
      icon: FileText,
      path: '#meetings',
      color: 'from-emerald-500 to-emerald-600',
      hoverBg: 'hover:bg-emerald-50',
      iconBg: 'bg-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => navigate(action.path)}
          className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5 ${action.hoverBg}`}
        >
          <div className="flex items-start justify-between">
            <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center shadow-sm`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-gray-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-900">{action.title}</h3>
            <p className="mt-1 text-xs text-gray-500">{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  trendLabel,
  onClick,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
  trendLabel?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 transition-all ${onClick ? 'hover:shadow-md cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
          {trend && trendLabel && (
            <p className="mt-1 text-xs text-gray-400">
              <span className="text-gray-500">{trendLabel}</span> {trend}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100').replace('500', '100')} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

function OverdueRiskCard({ count, onNavigate }: { count: number; onNavigate: () => void }) {
  if (count === 0) return null;
  return (
    <div
      onClick={onNavigate}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 p-5 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -translate-y-16 translate-x-16 opacity-50" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-700">逾期风险预警</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {count} 项待办已逾期
            </p>
          </div>
        </div>
        <button className="px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors shadow-sm">
          立即处理
          <ArrowRight className="inline h-3 w-3 ml-1" />
        </button>
      </div>
    </div>
  );
}

function MeetingsChart({ data }: { data: Array<{ date: string; count: number }> }) {
  const maxMeetings = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const formatChartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">近期会议趋势</h3>
          <p className="mt-1 text-sm text-gray-500">最近 7 天共 {total} 场会议</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-600">近 7 天</span>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2 h-40 px-2">
        {data.map((day, idx) => {
          const heightPercent = (day.count / maxMeetings) * 100;
          const isMax = day.count === maxMeetings && day.count > 0;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-3">
              <div className="w-full flex items-end justify-center h-32">
                <div
                  className={`w-full max-w-[36px] rounded-t-lg transition-all relative group ${
                    isMax
                      ? 'bg-gradient-to-t from-indigo-500 to-indigo-400'
                      : 'bg-gradient-to-t from-indigo-200 to-indigo-100 hover:from-indigo-400 hover:to-indigo-300'
                  }`}
                  style={{ height: `${heightPercent}%`, minHeight: day.count > 0 ? '12px' : '4px' }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {day.count} 场
                  </div>
                  {isMax && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full border-2 border-indigo-500" />
                  )}
                </div>
              </div>
              <span className={`text-xs ${isMax ? 'font-semibold text-indigo-600' : 'text-gray-500'}`}>
                {formatChartDate(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssigneeDistribution({
  data,
}: {
  data: Array<{
    assignee: string;
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }>;
}) {
  const maxCount = Math.max(...data.map((a) => a.total), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">负责人待办分布</h3>
          <p className="mt-1 text-sm text-gray-500">按人员统计待办完成情况</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
            <span className="text-gray-600">已完成</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />
            <span className="text-gray-600">进行中</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
            <span className="text-gray-600">逾期</span>
          </div>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Users className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm">暂无负责人数据</p>
        </div>
      ) : (
        <div className="space-y-5">
          {data.map((item) => {
            const completedPercent = (item.completed / maxCount) * 100;
            const pendingPercent = (item.pending / maxCount) * 100;
            const overduePercent = (item.overdue / maxCount) * 100;
            const completionRate = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;

            return (
              <div key={item.assignee}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-indigo-700">
                        {item.assignee.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{item.assignee}</span>
                    <span className="text-xs text-gray-400">({item.total}项)</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-medium text-green-600">{item.completed}</span>
                    <span className="text-gray-300">/</span>
                    <span className="text-yellow-600">{item.pending}</span>
                    {item.overdue > 0 && (
                      <>
                        <span className="text-gray-300">/</span>
                        <span className="font-medium text-red-600">{item.overdue}逾期</span>
                      </>
                    )}
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      completionRate >= 80
                        ? 'bg-green-50 text-green-600'
                        : completionRate >= 50
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {completionRate}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all"
                    style={{ width: `${completedPercent}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all"
                    style={{ width: `${pendingPercent}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all"
                    style={{ width: `${overduePercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TodoStatusOverview({
  total,
  completed,
  pending,
  onNavigate,
}: {
  total: number;
  completed: number;
  pending: number;
  onNavigate: () => void;
}) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900">待办完成概览</h3>
        <button
          onClick={onNavigate}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          查看详情
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      <div className="flex items-center gap-8">
        <div className="relative flex-shrink-0">
          <svg width="96" height="96" className="-rotate-90">
            <circle
              cx="48"
              cy="48"
              r="36"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="48"
              cy="48"
              r="36"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{percent}%</span>
            <span className="text-xs text-gray-500">完成率</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-sm text-gray-600">总待办</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">{total}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-green-700">已完成</span>
            </div>
            <span className="text-lg font-semibold text-green-700">{completed}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-sm text-yellow-700">进行中</span>
            </div>
            <span className="text-lg font-semibold text-yellow-700">{pending}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingCard({
  meeting,
  onEdit,
  onDelete,
  onClick,
  showDeleteConfirm,
  setShowDeleteConfirm,
}: {
  meeting: ReturnType<typeof useMeetingStore.getState>['meetings'][number];
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (v: boolean) => void;
}) {
  const progress = meeting.todo_count
    ? ((meeting.completed_todo_count || 0) / (meeting.todo_count || 1)) * 100
    : 0;
  const progressColor =
    progress === 100
      ? 'from-green-400 to-green-500'
      : progress > 50
      ? 'from-blue-400 to-blue-500'
      : 'from-yellow-400 to-yellow-500';

  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer overflow-hidden"
    >
      <div className={`h-1 w-full bg-gradient-to-r ${progressColor}`} style={{ width: `${progress}%` }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors flex-1">
            {meeting.title}
          </h3>
          <div className="flex gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="编辑"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="删除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="truncate">{formatDate(meeting.meeting_date)}</span>
          </div>
          {meeting.location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{meeting.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{meeting.participant_count || 0} 人参会</span>
          </div>
        </div>

        {meeting.todo_count ? (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-2.5">
              <div className="flex items-center gap-1.5 text-gray-600">
                <CheckSquare className="h-4 w-4 text-gray-400" />
                <span>待办进度</span>
              </div>
              <span className="font-medium text-gray-900">
                {meeting.completed_todo_count || 0}/{meeting.todo_count}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : null}

        {meeting.todos && meeting.todos.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {meeting.todos.slice(0, 2).map((todo) => (
              <div key={todo.id} className="flex items-center gap-2 text-sm">
                <StatusBadge status={todo.status} className="flex-shrink-0 scale-90" />
                <span className="truncate text-gray-600">{todo.title}</span>
              </div>
            ))}
            {meeting.todos.length > 2 && (
              <p className="text-xs text-gray-400 pl-1">
                还有 {meeting.todos.length - 2} 项待办...
              </p>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div
          className="bg-gray-50 px-5 py-4 border-t border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">确认删除会议</p>
              <p className="text-xs text-gray-500 mt-0.5">删除后相关的参会人、议题、待办也将一并删除，此操作不可恢复。</p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={onDelete}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              确认删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const {
    meetings,
    fetchMeetings,
    deleteMeeting,
    dashboardStats,
    fetchDashboardStats,
    loading,
    pagination,
  } = useMeetingStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchMeetings(currentPage);
    fetchDashboardStats();
  }, [currentPage, fetchMeetings, fetchDashboardStats]);

  const handleDelete = async (id: number) => {
    const success = await deleteMeeting(id);
    if (success) {
      fetchMeetings(currentPage);
      fetchDashboardStats();
      setShowDeleteConfirm(null);
    }
  };

  const isStatsLoading = loading && !dashboardStats;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">会议工作台</h1>
                <p className="text-sm text-gray-500">总览会议管理与待办追踪</p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            <Clock className="inline h-3.5 w-3.5 mr-1" />
            最后更新：{new Date().toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {isStatsLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-indigo-400 rounded-full" />
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">快捷操作</h2>
            </div>
            <QuickActions navigate={navigate} />
          </div>

          {dashboardStats && dashboardStats.overdueTodos > 0 && (
            <div className="mb-8">
              <OverdueRiskCard
                count={dashboardStats.overdueTodos}
                onNavigate={() => navigate('/reminders')}
              />
            </div>
          )}

          {dashboardStats && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-indigo-400 rounded-full" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">核心指标</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  label="会议总数"
                  value={dashboardStats.totalMeetings}
                  icon={Calendar}
                  color="text-indigo-600"
                />
                <StatCard
                  label="待办总数"
                  value={dashboardStats.totalTodos}
                  icon={CheckSquare}
                  color="text-blue-600"
                  onClick={() => navigate('/todos')}
                />
                <StatCard
                  label="已完成待办"
                  value={dashboardStats.completedTodos}
                  icon={CheckSquare}
                  color="text-green-600"
                  onClick={() => navigate('/todos?status=completed')}
                />
                <StatCard
                  label="进行中待办"
                  value={dashboardStats.pendingTodos}
                  icon={TrendingUp}
                  color="text-yellow-600"
                  onClick={() => navigate('/todos?status=pending')}
                />
                <StatCard
                  label="逾期待办"
                  value={dashboardStats.overdueTodos}
                  icon={AlertTriangle}
                  color="text-red-600"
                  onClick={() => navigate('/reminders')}
                />
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            {dashboardStats && (
              <div className="lg:col-span-1">
                <TodoStatusOverview
                  total={dashboardStats.totalTodos}
                  completed={dashboardStats.completedTodos}
                  pending={dashboardStats.pendingTodos}
                  onNavigate={() => navigate('/todos')}
                />
              </div>
            )}
            {dashboardStats && (
              <div className="lg:col-span-2">
                <MeetingsChart data={dashboardStats.meetingsLast7Days} />
              </div>
            )}
          </div>

          {dashboardStats && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">人员分布</h2>
              </div>
              <AssigneeDistribution data={dashboardStats.todosByAssignee} />
            </div>
          )}

          <div id="meetings" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-400 rounded-full" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">会议列表</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {pagination.total} 场
                </span>
              </div>
              <button
                onClick={() => navigate('/meetings/new')}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                新建会议
              </button>
            </div>

            {loading && meetings.length === 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-56 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : meetings.length === 0 ? (
              <Empty
                title="暂无会议"
                description="点击上方&quot;新建会议&quot;按钮开始创建您的第一个会议"
                actionText="创建会议"
                onAction={() => navigate('/meetings/new')}
              />
            ) : (
              <>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {meetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      onEdit={() => navigate(`/meetings/${meeting.id}/edit`)}
                      onDelete={() => handleDelete(meeting.id!)}
                      onClick={() => navigate(`/meetings/${meeting.id}`)}
                      showDeleteConfirm={showDeleteConfirm === meeting.id}
                      setShowDeleteConfirm={(v) =>
                        setShowDeleteConfirm(v ? meeting.id! : null)
                      }
                    />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-600">
                        第 <span className="font-semibold text-gray-900">{currentPage}</span> / {pagination.totalPages} 页
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                      }
                      disabled={currentPage === pagination.totalPages}
                      className="p-2.5 rounded-lg border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
