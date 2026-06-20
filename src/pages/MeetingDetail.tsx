import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Calendar,
  MapPin,
  Users,
  FileText,
  CheckSquare,
  MessageSquare,
  ExternalLink,
  Download,
  Hash,
  Clock,
  AlertTriangle,
  User,
  Check,
  Copy,
  Share2,
  Info,
  X,
} from 'lucide-react';
import { useMeetingStore } from '@/store/meetingStore';
import { formatDate, isOverdue } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Empty from '@/components/Empty';

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  count?: number;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

function SectionCard({
  title,
  icon,
  iconBg,
  iconColor,
  count,
  children,
  action,
  className = '',
}: SectionCardProps) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <span className={iconColor}>{icon}</span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {typeof count === 'number' && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {count} 项
              </span>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  children?: React.ReactNode;
}

function InfoItem({ icon, label, value, children }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-gray-500">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        {value ? <p className="text-sm text-gray-800 font-medium truncate">{value}</p> : children}
      </div>
    </div>
  );
}

function ParticipantTag({ name, role }: { name: string; role?: string }) {
  return (
    <div className="group relative flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:border-indigo-200 hover:shadow-sm transition-all">
      <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center shadow-sm shadow-indigo-500/20 flex-shrink-0">
        <span className="text-sm font-semibold text-white">{name.charAt(0)}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        {role && <p className="text-xs text-gray-500 truncate">{role}</p>}
      </div>
    </div>
  );
}

function TopicCard({
  topic,
  index,
}: {
  topic: { id?: number; title: string; description?: string; discussion?: string };
  index: number;
}) {
  return (
    <div className="group rounded-xl border border-gray-200 p-5 hover:border-indigo-200 hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50/30">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-500/30">
          <span className="text-sm font-bold text-white">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
            {topic.title}
          </h3>
        </div>
      </div>

      <div className="space-y-4 pl-13" style={{ marginLeft: '3.25rem' }}>
        {topic.description && (
          <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3.5 w-3.5 text-blue-600" />
              <p className="text-xs font-semibold text-blue-700">议题描述</p>
            </div>
            <p className="text-sm text-blue-900/80 leading-relaxed">{topic.description}</p>
          </div>
        )}
        {topic.discussion && (
          <div className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
              <p className="text-xs font-semibold text-amber-700">讨论内容</p>
            </div>
            <p className="text-sm text-amber-900/80 leading-relaxed whitespace-pre-wrap">
              {topic.discussion}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TodoCard({
  todo,
  isEditing,
  completionNote,
  setCompletionNote,
  onStatusChange,
  onConfirmComplete,
  onCancelEdit,
}: {
  todo: ReturnType<typeof useMeetingStore.getState>['currentMeeting'] extends infer T
    ? T extends { todos?: (infer U)[] }
      ? U
      : never
    : never;
  isEditing: boolean;
  completionNote: string;
  setCompletionNote: (v: string) => void;
  onStatusChange: (status: string) => void;
  onConfirmComplete: () => void;
  onCancelEdit: () => void;
}) {
  const overdue = isOverdue(todo as any);
  const isCompleted = todo.status === 'completed';

  return (
    <div
      className={`relative rounded-xl border transition-all overflow-hidden ${
        isCompleted
          ? 'bg-gray-50/50 border-gray-200'
          : overdue
          ? 'bg-gradient-to-br from-red-50/30 to-orange-50/20 border-red-200 hover:border-red-300'
          : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-md'
      }`}
    >
      {overdue && !isCompleted && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500" />
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusBadge status={todo.status as any} className="flex-shrink-0" />
              {overdue && !isCompleted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                  <AlertTriangle className="h-3 w-3" />
                  已逾期
                </span>
              )}
              {todo.topic_title && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Hash className="h-3 w-3" />
                  {todo.topic_title}
                </span>
              )}
            </div>

            <h4
              className={`text-base font-semibold leading-snug ${
                isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
              }`}
            >
              {todo.title}
            </h4>

            {todo.description && (
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{todo.description}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <span className="font-medium text-gray-700">{todo.assignee}</span>
                <span className="text-xs text-gray-400">负责人</span>
              </div>
              {todo.due_date && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    overdue && !isCompleted ? 'text-red-600' : 'text-gray-600'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      overdue && !isCompleted
                        ? 'bg-red-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Clock
                      className={`h-3.5 w-3.5 ${
                        overdue && !isCompleted ? 'text-red-600' : 'text-gray-500'
                      }`}
                    />
                  </div>
                  <span className="font-medium">{formatDate(todo.due_date)}</span>
                  <span className="text-xs text-gray-400">截止日期</span>
                </div>
              )}
            </div>

            {todo.completion_note && (
              <div className="mt-4 rounded-lg bg-green-50 border border-green-100 p-4">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-700 mb-0.5">完成备注</p>
                    <p className="text-sm text-green-800/80 leading-relaxed">
                      {todo.completion_note}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            {isEditing ? (
              <div className="w-72">
                <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-lg">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    完成备注（可选）
                  </label>
                  <textarea
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    placeholder="输入完成备注..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={onConfirmComplete}
                      className="flex-1 px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm shadow-green-500/30"
                    >
                      <Check className="inline h-3.5 w-3.5 mr-1.5" />
                      确认完成
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={todo.status}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="pl-3 pr-10 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer appearance-none"
                >
                  <option value="pending">待处理</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentMeeting,
    fetchMeetingDetail,
    updateTodoStatus,
    exportMeeting,
    loading,
    error,
    clearCurrentMeeting,
  } = useMeetingStore();
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [copied, setCopied] = useState(false);

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

  const handleCopyTitle = () => {
    if (currentMeeting?.title) {
      navigator.clipboard.writeText(currentMeeting.title);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const completedTodos = currentMeeting?.todos?.filter((t) => t.status === 'completed').length || 0;
  const totalTodos = currentMeeting?.todos?.length || 0;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  if (loading && !currentMeeting) {
    return <LoadingSkeleton />;
  }

  if (error && !currentMeeting) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-lg font-semibold text-red-700 mb-2">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回会议列表
          </button>
        </div>
      </div>
    );
  }

  if (!currentMeeting) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <Empty title="会议不存在" description="该会议可能已被删除" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
          返回列表
        </button>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative p-8">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-sm font-medium">
                    <Hash className="h-3.5 w-3.5" />
                    会议 #{currentMeeting.id}
                  </span>
                  {totalTodos > 0 && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur text-sm font-medium ${
                        completionRate === 100
                          ? 'bg-green-400/30'
                          : completionRate >= 50
                          ? 'bg-blue-400/30'
                          : 'bg-yellow-400/30'
                      }`}
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      待办进度 {completedTodos}/{totalTodos} ({completionRate}%)
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold mb-3 flex items-center gap-3 flex-wrap">
                  <span className="break-words">{currentMeeting.title}</span>
                  <button
                    onClick={handleCopyTitle}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    title="复制标题"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-300" />
                    ) : (
                      <Copy className="h-4 w-4 opacity-70 hover:opacity-100" />
                    )}
                  </button>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                    <Calendar className="h-5 w-5 opacity-80 flex-shrink-0" />
                    <div>
                      <p className="text-xs opacity-70 font-medium">会议日期</p>
                      <p className="text-sm font-semibold">{formatDate(currentMeeting.meeting_date)}</p>
                    </div>
                  </div>
                  {currentMeeting.location && (
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
                      <MapPin className="h-5 w-5 opacity-80 flex-shrink-0" />
                      <div>
                        <p className="text-xs opacity-70 font-medium">会议地点</p>
                        <p className="text-sm font-semibold truncate">{currentMeeting.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyTitle}
                  className="inline-flex items-center px-4 py-2.5 bg-white/15 backdrop-blur border border-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/25 transition-all"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  分享
                </button>
                <button
                  onClick={() => exportMeeting(Number(id))}
                  className="inline-flex items-center px-4 py-2.5 bg-white text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-lg shadow-black/10"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  导出 Markdown
                </button>
                <button
                  onClick={() => navigate(`/meetings/${id}/edit`)}
                  className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-white/90 to-white text-indigo-600 text-sm font-semibold rounded-xl hover:from-white hover:to-indigo-50 transition-all shadow-lg shadow-black/10"
                >
                  <Edit2 className="h-4 w-4 mr-1.5" />
                  编辑会议
                </button>
              </div>
            </div>

            {totalTodos > 0 && (
              <div className="mt-8 pt-6 border-t border-white/15">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium opacity-90">整体完成度</span>
                  <span className="text-sm font-bold">{completionRate}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      completionRate === 100
                        ? 'bg-gradient-to-r from-green-300 to-green-400'
                        : 'bg-gradient-to-r from-white to-indigo-200'
                    }`}
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="基础信息"
            icon={<FileText className="h-4.5 w-4.5" />}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          >
            <div className="grid gap-5">
              <InfoItem icon={<Hash className="h-4 w-4" />} label="会议编号" value={`#${currentMeeting.id}`} />
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="会议日期"
                value={formatDate(currentMeeting.meeting_date)}
              />
              {currentMeeting.location && (
                <InfoItem icon={<MapPin className="h-4 w-4" />} label="会议地点" value={currentMeeting.location} />
              )}
              {currentMeeting.created_at && (
                <InfoItem
                  icon={<Clock className="h-4 w-4" />}
                  label="创建时间"
                  value={new Date(currentMeeting.created_at).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                />
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="参会人员"
            icon={<Users className="h-4.5 w-4.5" />}
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
            count={currentMeeting.participants?.length}
          >
            {currentMeeting.participants?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentMeeting.participants.map((p) => (
                  <ParticipantTag key={p.id} name={p.name} role={p.role} />
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">暂无参会人员</p>
              </div>
            )}
          </SectionCard>
        </div>

        <SectionCard
          title="议题讨论"
          icon={<MessageSquare className="h-4.5 w-4.5" />}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          count={currentMeeting.topics?.length}
        >
          {currentMeeting.topics?.length ? (
            <div className="space-y-4">
              {currentMeeting.topics.map((topic, index) => (
                <TopicCard key={topic.id} topic={topic} index={index} />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">暂无议题记录</p>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="待办事项"
          icon={<CheckSquare className="h-4.5 w-4.5" />}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          count={totalTodos}
          action={
            totalTodos > 0 && (
              <Link
                to={`/todos?meeting_id=${id}`}
                className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                查看全部
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            )
          }
        >
          {currentMeeting.todos?.length ? (
            <div className="space-y-4">
              {currentMeeting.todos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  isEditing={editingTodo === todo.id}
                  completionNote={completionNote}
                  setCompletionNote={setCompletionNote}
                  onStatusChange={(status) => handleStatusChange(todo.id!, status)}
                  onConfirmComplete={() => handleCompleteWithNote(todo.id!)}
                  onCancelEdit={handleCancelEdit}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">暂无待办事项</p>
              <p className="text-xs text-gray-300 mt-1">在编辑会议时可以添加待办</p>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="会议结论"
          icon={<FileText className="h-4.5 w-4.5" />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        >
          {currentMeeting.conclusion ? (
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50/30 border border-purple-100 p-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {currentMeeting.conclusion}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">暂无会议结论</p>
              <button
                onClick={() => navigate(`/meetings/${id}/edit`)}
                className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + 添加会议结论
              </button>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
