import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, CheckSquare, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMeetingStore } from '@/store/meetingStore';
import { formatDate } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';

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
