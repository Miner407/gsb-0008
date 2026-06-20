import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, CheckSquare, Edit2, Trash2, ChevronLeft, ChevronRight, BarChart3, AlertTriangle, User, TrendingUp } from 'lucide-react';
import { useMeetingStore } from '@/store/meetingStore';
import { formatDate } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';

function Dashboard() {
  const navigate = useNavigate();
  const { dashboardStats, fetchDashboardStats, loading } = useMeetingStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading && !dashboardStats) {
    return null;
  }

  if (!dashboardStats) {
    return null;
  }

  const formatChartDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const maxMeetings = Math.max(...dashboardStats.meetingsLast7Days.map((d) => d.count), 1);

  return (
    <div className="mb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            统计概览
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">会议总数</p>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalMeetings}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">待办总数</p>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalTodos}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">已完成待办</p>
            <CheckSquare className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{dashboardStats.completedTodos}</p>
          {dashboardStats.totalTodos > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {Math.round((dashboardStats.completedTodos / dashboardStats.totalTodos) * 100)}% 完成率
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">进行中</p>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingTodos}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">逾期待办</p>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{dashboardStats.overdueTodos}</p>
          {dashboardStats.overdueTodos > 0 && (
            <button
              onClick={() => navigate('/reminders')}
              className="text-xs text-red-600 hover:text-red-700 mt-1"
            >
              查看 →
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">近 7 天会议数量</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {dashboardStats.meetingsLast7Days.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    className="w-full max-w-[32px] bg-indigo-500 rounded-t transition-all hover:bg-indigo-600 relative group"
                    style={{ height: `${(day.count / maxMeetings) * 100}%`, minHeight: day.count > 0 ? '8px' : '4px' }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.count} 场
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{formatChartDate(day.date)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">按负责人统计待办</h3>
          {dashboardStats.todosByAssignee.length === 0 ? (
            <p className="text-gray-400 text-center py-8 text-sm">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {dashboardStats.todosByAssignee.map((item) => {
                const maxCount = Math.max(...dashboardStats.todosByAssignee.map((a) => a.total), 1);
                const pendingPercent = (item.pending / maxCount) * 100;
                return (
                  <div key={item.assignee}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{item.assignee}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-green-600">{item.completed}完成</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-yellow-600">{item.pending}待办</span>
                        {item.overdue > 0 && (
                          <>
                            <span className="text-gray-400">/</span>
                            <span className="text-red-600">{item.overdue}逾期</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${(item.completed / maxCount) * 100}%` }}
                      ></div>
                      <div
                        className="h-2 rounded-full bg-yellow-500 -mt-2"
                        style={{ width: `${pendingPercent}%`, marginLeft: `${(item.completed / maxCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { meetings, fetchMeetings, deleteMeeting, loading, pagination } = useMeetingStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchMeetings(currentPage);
  }, [currentPage, fetchMeetings]);

  const handleDelete = async (id: number) => {
    const success = await deleteMeeting(id);
    if (success) {
      fetchMeetings(currentPage);
      setShowDeleteConfirm(null);
    }
  };

  const getProgressColor = (completed: number = 0, total: number = 0) => {
    if (total === 0) return 'bg-gray-200';
    const percent = (completed / total) * 100;
    if (percent === 100) return 'bg-green-500';
    if (percent > 0) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">会议列表</h1>
        <p className="text-gray-600">管理所有会议纪要和待办事项</p>
      </div>

      <Dashboard />

      {loading && meetings.length === 0 ? (
        <div className="text-center py-12">加载中...</div>
      ) : meetings.length === 0 ? (
        <Empty
          title="暂无会议"
          description="点击右上角&quot;创建会议&quot;按钮开始创建您的第一个会议"
          actionText="创建会议"
          onAction={() => navigate('/meetings/new')}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/meetings/${meeting.id}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{meeting.title}</h3>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/meetings/${meeting.id}/edit`)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(meeting.id!)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(meeting.meeting_date)}</span>
                    </div>
                    {meeting.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="truncate">{meeting.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{meeting.participant_count || 0} 人参会</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {meeting.completed_todo_count || 0}/{meeting.todo_count || 0} 待办完成
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(meeting.completed_todo_count, meeting.todo_count)}`}
                        style={{ width: `${meeting.todo_count ? ((meeting.completed_todo_count || 0) / (meeting.todo_count || 1)) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {meeting.todos && meeting.todos.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-700 mb-2">待办概览</p>
                      <div className="space-y-1">
                        {meeting.todos.slice(0, 2).map((todo) => (
                          <div key={todo.id} className="flex items-center gap-2 text-sm">
                            <StatusBadge status={todo.status} />
                            <span className="truncate text-gray-600">{todo.title}</span>
                          </div>
                        ))}
                        {meeting.todos.length > 2 && (
                          <p className="text-xs text-gray-400">还有 {meeting.todos.length - 2} 项...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {showDeleteConfirm === meeting.id && (
                  <div
                  className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-sm text-gray-700 mb-3">确定要删除这个会议吗？</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(meeting.id!)}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      确认删除
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">
                第 {currentPage} / {pagination.totalPages} 页
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
