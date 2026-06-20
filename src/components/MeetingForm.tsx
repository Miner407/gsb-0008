import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useMeetingStore } from '@/store/meetingStore';
import type { Meeting, Participant, Topic, TodoItem } from '@/types';

interface MeetingFormProps {
  mode: 'create' | 'edit';
}

export default function MeetingForm({ mode }: MeetingFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { fetchMeetingDetail, createMeeting, updateMeeting, currentMeeting, loading, error } = useMeetingStore();

  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [location, setLocation] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([{ name: '', role: '' }]);
  const [topics, setTopics] = useState<Topic[]>([{ title: '', description: '', discussion: '' }]);
  const [todos, setTodos] = useState<(Partial<TodoItem> & { topic_index?: number | null })[]>([
    { title: '', assignee: '', due_date: '', description: '', topic_index: null },
  ]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchMeetingDetail(Number(id));
    }
  }, [mode, id, fetchMeetingDetail]);

  useEffect(() => {
    if (mode === 'edit' && currentMeeting) {
      setTitle(currentMeeting.title);
      setMeetingDate(currentMeeting.meeting_date);
      setLocation(currentMeeting.location || '');
      setConclusion(currentMeeting.conclusion || '');
      setParticipants(currentMeeting.participants?.length ? currentMeeting.participants : [{ name: '', role: '' }]);
      setTopics(currentMeeting.topics?.length ? currentMeeting.topics : [{ title: '', description: '', discussion: '' }]);

      if (currentMeeting.todos?.length) {
        const topicMap = new Map<number, number>();
        currentMeeting.topics?.forEach((t, idx) => {
          if (t.id) topicMap.set(t.id, idx);
        });
        setTodos(
          currentMeeting.todos.map((t) => ({
            ...t,
            topic_index: t.topic_id ? topicMap.get(t.topic_id) ?? null : null,
          }))
        );
      }
    }
  }, [mode, currentMeeting]);

  const addParticipant = () => {
    setParticipants([...participants, { name: '', role: '' }]);
  };

  const updateParticipant = (index: number, field: keyof Participant, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const addTopic = () => {
    setTopics([...topics, { title: '', description: '', discussion: '' }]);
  };

  const updateTopic = (index: number, field: keyof Topic, value: string) => {
    const updated = [...topics];
    updated[index] = { ...updated[index], [field]: value };
    setTopics(updated);
  };

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      const updatedTopics = topics.filter((_, i) => i !== index);
      setTopics(updatedTopics);
      setTodos(
        todos.map((t) => ({
          ...t,
          topic_index: t.topic_index === index ? null : t.topic_index !== undefined && t.topic_index > index ? t.topic_index - 1 : t.topic_index,
        }))
      );
    }
  };

  const addTodo = () => {
    setTodos([...todos, { title: '', assignee: '', due_date: '', description: '', topic_index: null }]);
  };

  const updateTodo = (index: number, field: string, value: string | number | null) => {
    const updated = [...todos];
    updated[index] = { ...updated[index], [field]: value };
    setTodos(updated);
  };

  const removeTodo = (index: number) => {
    if (todos.length > 1) {
      setTodos(todos.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validParticipants = participants.filter((p) => p.name.trim());
    const validTopics = topics.filter((t) => t.title.trim());
    const validTodos = todos
      .filter((t) => t.title?.trim() && t.assignee?.trim())
      .map((t) => ({
        ...t,
        topic_id: t.topic_index !== undefined && t.topic_index !== null ? t.topic_index : null,
      }));

    const meetingData: Partial<Meeting> = {
      title: title.trim(),
      meeting_date: meetingDate,
      location: location.trim() || undefined,
      conclusion: conclusion.trim() || undefined,
      participants: validParticipants,
      topics: validTopics,
      todos: validTodos.map(({ topic_index, ...rest }) => ({
        ...rest,
        status: rest.status || 'pending',
      })) as TodoItem[],
    };

    let success = false;
    let meetingId: number | null = null;

    if (mode === 'create') {
      meetingId = await createMeeting(meetingData);
      success = meetingId !== null;
    } else if (mode === 'edit' && id) {
      success = await updateMeeting(Number(id), meetingData);
      meetingId = Number(id);
    }

    if (success && meetingId) {
      navigate(`/meetings/${meetingId}`);
    }
  };

  if (mode === 'edit' && loading && !currentMeeting) {
    return <div className="text-center py-12">加载中...</div>;
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
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? '新建会议' : '编辑会议'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会议标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入会议标题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会议日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">会议地点</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="请输入会议地点"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">参会人员</h2>
            <button
              type="button"
              onClick={addParticipant}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加参会人
            </button>
          </div>
          <div className="space-y-3">
            {participants.map((participant, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    value={participant.name}
                    onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="姓名"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={participant.role || ''}
                    onChange={(e) => updateParticipant(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="角色/部门"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeParticipant(index)}
                  disabled={participants.length <= 1}
                  className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">议题</h2>
            <button
              type="button"
              onClick={addTopic}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加议题
            </button>
          </div>
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                <button
                  type="button"
                  onClick={() => removeTopic(index)}
                  disabled={topics.length <= 1}
                  className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      议题 {index + 1} 标题
                    </label>
                    <input
                      type="text"
                      value={topic.title}
                      onChange={(e) => updateTopic(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="议题标题"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">议题描述</label>
                    <textarea
                      value={topic.description || ''}
                      onChange={(e) => updateTopic(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="议题背景和说明"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">讨论内容</label>
                    <textarea
                      value={topic.discussion || ''}
                      onChange={(e) => updateTopic(index, 'discussion', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="讨论过程和要点"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">待办事项</h2>
            <button
              type="button"
              onClick={addTodo}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加待办
            </button>
          </div>
          <div className="space-y-4">
            {todos.map((todo, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                <button
                  type="button"
                  onClick={() => removeTodo(index)}
                  disabled={todos.length <= 1}
                  className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      待办事项 {index + 1}
                    </label>
                    <input
                      type="text"
                      value={todo.title || ''}
                      onChange={(e) => updateTodo(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="待办事项内容"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      负责人 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={todo.assignee || ''}
                      onChange={(e) => updateTodo(index, 'assignee', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="负责人姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                    <input
                      type="date"
                      value={todo.due_date || ''}
                      onChange={(e) => updateTodo(index, 'due_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">关联议题</label>
                    <select
                      value={todo.topic_index === undefined || todo.topic_index === null ? '' : todo.topic_index}
                      onChange={(e) =>
                        updateTodo(index, 'topic_index', e.target.value === '' ? null : Number(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">不关联</option>
                      {topics.map((t, i) => (
                        <option key={i} value={i}>
                          {t.title || `议题 ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                    <input
                      type="text"
                      value={todo.description || ''}
                      onChange={(e) => updateTodo(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="补充说明"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">会议结论</h2>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="请输入会议最终结论..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '保存中...' : mode === 'create' ? '创建会议' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  );
}
