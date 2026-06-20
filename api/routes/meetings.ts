import express, { type Request, type Response } from 'express';
import db from '../db.js';

const router = express.Router();

interface Participant {
  id?: number;
  name: string;
  role?: string;
}

interface Topic {
  id?: number;
  title: string;
  description?: string;
  discussion?: string;
  sort_order?: number;
}

interface TodoItem {
  id?: number;
  title: string;
  description?: string;
  assignee: string;
  due_date?: string;
  status?: string;
  completion_note?: string;
  topic_id?: number | null;
}

router.get('/', (req: Request, res: Response) => {
  const { page = '1', pageSize = '10' } = req.query;
  const offset = (Number(page) - 1) * Number(pageSize);

  const meetingsStmt = db.prepare(`
    SELECT m.*,
      (SELECT COUNT(*) FROM participants p WHERE p.meeting_id = m.id) as participant_count,
      (SELECT COUNT(*) FROM todo_items t WHERE t.meeting_id = m.id) as todo_count,
      (SELECT COUNT(*) FROM todo_items t WHERE t.meeting_id = m.id AND t.status = 'completed') as completed_todo_count
    FROM meetings m
    ORDER BY m.meeting_date DESC, m.created_at DESC
    LIMIT ? OFFSET ?
  `);

  const countStmt = db.prepare('SELECT COUNT(*) as total FROM meetings');

  const meetings = meetingsStmt.all(Number(pageSize), offset);
  const { total } = countStmt.get() as { total: number };

  res.json({
    success: true,
    data: meetings,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total,
      totalPages: Math.ceil(total / Number(pageSize)),
    },
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const meetingStmt = db.prepare('SELECT * FROM meetings WHERE id = ?');
  const participantsStmt = db.prepare('SELECT * FROM participants WHERE meeting_id = ? ORDER BY id');
  const topicsStmt = db.prepare('SELECT * FROM topics WHERE meeting_id = ? ORDER BY sort_order, id');
  const todosStmt = db.prepare(`
    SELECT t.*, tp.title as topic_title
    FROM todo_items t
    LEFT JOIN topics tp ON t.topic_id = tp.id
    WHERE t.meeting_id = ?
    ORDER BY t.created_at DESC
  `);

  const meeting = meetingStmt.get(id) as Record<string, unknown> | undefined;
  if (!meeting) {
    return res.status(404).json({ success: false, error: '会议不存在' });
  }

  const participants = participantsStmt.all(id);
  const topics = topicsStmt.all(id);
  const todos = todosStmt.all(id);

  res.json({
    success: true,
    data: {
      ...meeting,
      participants,
      topics,
      todos,
    },
  });
});

router.post('/', (req: Request, res: Response) => {
  const {
    title,
    meeting_date,
    location,
    conclusion,
    participants = [],
    topics = [],
    todos = [],
  } = req.body;

  if (!title || !meeting_date) {
    return res.status(400).json({ success: false, error: '会议标题和日期为必填项' });
  }

  const insertMeeting = db.prepare(`
    INSERT INTO meetings (title, meeting_date, location, conclusion, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);

  const insertParticipant = db.prepare(`
    INSERT INTO participants (meeting_id, name, role)
    VALUES (?, ?, ?)
  `);

  const insertTopic = db.prepare(`
    INSERT INTO topics (meeting_id, title, description, discussion, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertTodo = db.prepare(`
    INSERT INTO todo_items (meeting_id, topic_id, title, description, assignee, due_date, status, completion_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    const result = insertMeeting.run(title, meeting_date, location || null, conclusion || null);
    const meetingId = result.lastInsertRowid as number;

    participants.forEach((p: Participant) => {
      insertParticipant.run(meetingId, p.name, p.role || null);
    });

    const topicIds: { [key: number]: number } = {};
    topics.forEach((t: Topic, index: number) => {
      const result = insertTopic.run(
        meetingId,
        t.title,
        t.description || null,
        t.discussion || null,
        t.sort_order ?? index
      );
      topicIds[index] = result.lastInsertRowid as number;
    });

    todos.forEach((todo: TodoItem) => {
      const topicId = todo.topic_id !== undefined && todo.topic_id !== null
        ? topicIds[todo.topic_id as number] ?? null
        : null;
      insertTodo.run(
        meetingId,
        topicId,
        todo.title,
        todo.description || null,
        todo.assignee,
        todo.due_date || null,
        todo.status || 'pending',
        todo.completion_note || null
      );
    });

    return meetingId;
  });

  try {
    const meetingId = tx();
    res.json({ success: true, data: { id: meetingId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '创建会议失败' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    meeting_date,
    location,
    conclusion,
    participants = [],
    topics = [],
    todos = [],
  } = req.body;

  if (!title || !meeting_date) {
    return res.status(400).json({ success: false, error: '会议标题和日期为必填项' });
  }

  const checkMeeting = db.prepare('SELECT id FROM meetings WHERE id = ?');
  const existing = checkMeeting.get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: '会议不存在' });
  }

  const updateMeeting = db.prepare(`
    UPDATE meetings
    SET title = ?, meeting_date = ?, location = ?, conclusion = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const deleteParticipants = db.prepare('DELETE FROM participants WHERE meeting_id = ?');
  const deleteTopics = db.prepare('DELETE FROM topics WHERE meeting_id = ?');
  const deleteTodos = db.prepare('DELETE FROM todo_items WHERE meeting_id = ?');

  const insertParticipant = db.prepare(`
    INSERT INTO participants (meeting_id, name, role)
    VALUES (?, ?, ?)
  `);

  const insertTopic = db.prepare(`
    INSERT INTO topics (meeting_id, title, description, discussion, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertTodo = db.prepare(`
    INSERT INTO todo_items (meeting_id, topic_id, title, description, assignee, due_date, status, completion_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    updateMeeting.run(title, meeting_date, location || null, conclusion || null, id);
    deleteParticipants.run(id);
    deleteTopics.run(id);
    deleteTodos.run(id);

    participants.forEach((p: Participant) => {
      insertParticipant.run(Number(id), p.name, p.role || null);
    });

    const topicIds: { [key: number]: number } = {};
    topics.forEach((t: Topic, index: number) => {
      const result = insertTopic.run(
        Number(id),
        t.title,
        t.description || null,
        t.discussion || null,
        t.sort_order ?? index
      );
      topicIds[index] = result.lastInsertRowid as number;
    });

    todos.forEach((todo: TodoItem) => {
      const topicId = todo.topic_id !== undefined && todo.topic_id !== null
        ? topicIds[todo.topic_id as number] ?? null
        : null;
      insertTodo.run(
        Number(id),
        topicId,
        todo.title,
        todo.description || null,
        todo.assignee,
        todo.due_date || null,
        todo.status || 'pending',
        todo.completion_note || null
      );
    });
  });

  try {
    tx();
    res.json({ success: true, data: { id: Number(id) } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '更新会议失败' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const checkMeeting = db.prepare('SELECT id FROM meetings WHERE id = ?');
  const existing = checkMeeting.get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: '会议不存在' });
  }

  const deleteMeeting = db.prepare('DELETE FROM meetings WHERE id = ?');

  try {
    deleteMeeting.run(id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '删除会议失败' });
  }
});

export default router;
