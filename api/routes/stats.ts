import express, { type Request, type Response } from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/dashboard', (_req: Request, res: Response) => {
  const totalMeetingsStmt = db.prepare('SELECT COUNT(*) as count FROM meetings');
  const totalTodosStmt = db.prepare('SELECT COUNT(*) as count FROM todo_items');
  const completedTodosStmt = db.prepare(
    "SELECT COUNT(*) as count FROM todo_items WHERE status = 'completed'"
  );
  const overdueTodosStmt = db.prepare(
    "SELECT COUNT(*) as count FROM todo_items WHERE due_date < DATE('now') AND status != 'completed'"
  );

  const todosByAssigneeStmt = db.prepare(`
    SELECT assignee,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status != 'completed' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN due_date < DATE('now') AND status != 'completed' THEN 1 ELSE 0 END) as overdue
    FROM todo_items
    GROUP BY assignee
    ORDER BY assignee
  `);

  const meetingsLast7DaysStmt = db.prepare(`
    SELECT
      date(meeting_date) as date,
      COUNT(*) as count
    FROM meetings
    WHERE meeting_date >= DATE('now', '-6 days')
      AND meeting_date <= DATE('now')
    GROUP BY date(meeting_date)
    ORDER BY date(meeting_date)
  `);

  const { count: totalMeetings } = totalMeetingsStmt.get() as { count: number };
  const { count: totalTodos } = totalTodosStmt.get() as { count: number };
  const { count: completedTodos } = completedTodosStmt.get() as { count: number };
  const { count: overdueTodos } = overdueTodosStmt.get() as { count: number };
  const todosByAssignee = todosByAssigneeStmt.all() as Array<{
    assignee: string;
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }>;
  const meetingsByDate = meetingsLast7DaysStmt.all() as Array<{ date: string; count: number }>;

  const last7Days: Array<{ date: string; count: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const existing = meetingsByDate.find((m) => m.date === dateStr);
    last7Days.push({ date: dateStr, count: existing?.count ?? 0 });
  }

  res.json({
    success: true,
    data: {
      totalMeetings,
      totalTodos,
      completedTodos,
      pendingTodos: totalTodos - completedTodos,
      overdueTodos,
      todosByAssignee,
      meetingsLast7Days: last7Days,
    },
  });
});

router.get('/todo-reminders', (_req: Request, res: Response) => {
  const todayStart = "DATE('now', 'start of day')";
  const todayEnd = "DATE('now', '+1 day', 'start of day')";
  const in3Days = "DATE('now', '+3 days', 'start of day')";

  const todayStmt = db.prepare(`
    SELECT t.*, m.title as meeting_title, tp.title as topic_title
    FROM todo_items t
    LEFT JOIN meetings m ON t.meeting_id = m.id
    LEFT JOIN topics tp ON t.topic_id = tp.id
    WHERE t.status != 'completed'
      AND t.due_date >= ${todayStart}
      AND t.due_date < ${todayEnd}
    ORDER BY t.due_date ASC, t.created_at DESC
  `);

  const next3DaysStmt = db.prepare(`
    SELECT t.*, m.title as meeting_title, tp.title as topic_title
    FROM todo_items t
    LEFT JOIN meetings m ON t.meeting_id = m.id
    LEFT JOIN topics tp ON t.topic_id = tp.id
    WHERE t.status != 'completed'
      AND t.due_date >= ${todayEnd}
      AND t.due_date < ${in3Days}
    ORDER BY t.due_date ASC, t.created_at DESC
  `);

  const overdueStmt = db.prepare(`
    SELECT t.*, m.title as meeting_title, tp.title as topic_title
    FROM todo_items t
    LEFT JOIN meetings m ON t.meeting_id = m.id
    LEFT JOIN topics tp ON t.topic_id = tp.id
    WHERE t.status != 'completed'
      AND t.due_date < ${todayStart}
    ORDER BY t.due_date ASC, t.created_at DESC
  `);

  const completedStmt = db.prepare(`
    SELECT t.*, m.title as meeting_title, tp.title as topic_title
    FROM todo_items t
    LEFT JOIN meetings m ON t.meeting_id = m.id
    LEFT JOIN topics tp ON t.topic_id = tp.id
    WHERE t.status = 'completed'
    ORDER BY t.updated_at DESC
    LIMIT 50
  `);

  const today = todayStmt.all();
  const next3Days = next3DaysStmt.all();
  const overdue = overdueStmt.all();
  const completed = completedStmt.all();

  res.json({
    success: true,
    data: {
      today,
      inThreeDays: next3Days,
      overdue,
      completed,
    },
  });
});

export default router;
