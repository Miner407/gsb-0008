import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Calendar, MapPin, Users, FileText, CheckSquare, MessageSquare, ExternalLink } from 'lucide-react';
import { useMeetingStore } from '@/store/meetingStore';
import { formatDate, isOverdue } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';
import type { TodoItem } from '@/types';

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentMeeting, fetchMeetingDetail, updateTodoStatus, loading, error, clearCurrentMeeting } = useMeetingStore();
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [completionNote, setCompletionNote] = useState('');

  useEffect(() => {
    if (id) {
      fetchMeetingDetail(Number(id));
    }
    return () => clearCurrentMeeting();
  }, [id, fetchMeetingDetail, clearCurrentMeeting]);

  const handleStatusChange = async (todoId: number, status: string) => {
    if (status === 'completed') {
      setEditingTodo(todoId);
    } else {
      await updateTodoStatus(todoId, status);
    }
  };

  const handleCompleteWithNote = async (todoId: number) => {
    await updateTodoStatus(todoId, 'completed', completionNote);
    setEditingTodo(null);
    setCompletionNote('');
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setCompletionNote('');
  };

  if (loading && !currentMeeting) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (error && !currentMeeting) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:text-indigo-700">
          返回会议列表
        </button>
      </div>
    );
  }

  if (!currentMeeting) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Empty title="会议不存在" description="该会议可能已被删除" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentMeeting.title}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(currentMeeting.meeting_date)}</span>
              </div>
              {currentMeeting.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{currentMeeting.location}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate(`/meetings/${id}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="h-4 w-4 mr-1.5" />
            编辑会议
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">参会人员</h2>
            <span className="text-sm text-gray-500">({currentMeeting.participants?.length || 0})</span>
          </div>
          {currentMeeting.participants?.length ? (
            <div className="flex flex-wrap gap-3">
              {currentMeeting.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600">
                      {p.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    {p.role && <p className="text-xs text-gray-500">{p.role}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">暂无参会人员</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">议题</h2>
            <span className="text-sm text-gray-500">({currentMeeting.topics?.length || 0})</span>
          </div>
          {currentMeeting.topics?.length ? (
            <div className="space-y-4">
              {currentMeeting.topics.map((topic, index) => (
                <div
                  key={topic.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-medium text-gray-900 mb-2">
                    {index + 1}. {topic.title}
                  </h3>
                  {topic.description && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">议题描述</p>
                      <p className="text-sm text-gray-600">{topic.description}</p>
                    </div>
                  )}
                  {topic.discussion && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">讨论内容</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{topic.discussion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">暂无议题</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">待办事项</h2>
              <span className="text-sm text-gray-500">
                ({currentMeeting.todos?.filter(t => t.status === 'completed').length || 0}/{currentMeeting.todos?.length || 0} 已完成)
              </span>
            </div>
            <Link
              to={`/todos?meeting_id=${id}`}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
            >
              查看全部待办
              <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          </div>
          {currentMeeting.todos?.length ? (
            <div className="space-y-3">
              {currentMeeting.todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    todo.status === 'completed' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={todo.status} />
                        {isOverdue(todo) && (
                          <span className="text-xs text-red-600 font-medium">已逾期</span>
                        )}
                        {todo.topic_title && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {todo.topic_title}
                          </span>
                        )}
                      </div>
                      <h4 className={`font-medium ${
                        todo.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {todo.title}
                      </h4>
                      {todo.description && (
                        <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        <span>负责人: {todo.assignee}</span>
                        {todo.due_date && <span>截止: {formatDate(todo.due_date)}</span>}
                      </div>
                      {todo.completion_note && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">完成备注:</span> {todo.completion_note}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {editingTodo === todo.id ? (
                        <div className="w-64">
                          <textarea
                            value={completionNote}
                            onChange={(e) => setCompletionNote(e.target.value)}
                            placeholder="输入完成备注..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCompleteWithNote(todo.id!)}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              确认完成
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <select
                          value={todo.status}
                          onChange={(e) => handleStatusChange(todo.id!, e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="pending">待处理</option>
                          <option value="in_progress">进行中</option>
                          <option value="completed">已完成</option>
                          <option value="cancelled">已取消</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">暂无待办事项</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">会议结论</h2>
          </div>
          {currentMeeting.conclusion ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{currentMeeting.conclusion}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">暂无会议结论</p>
          )}
        </div>
      </div>
    </div>
  );
}
