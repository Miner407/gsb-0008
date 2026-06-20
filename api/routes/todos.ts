import express, { type Request, type Response } from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const {
    assignee,
    overdue,
    status,
    meeting_id,
    page = '1',
    pageSize = '20',
  } = req.query;

  const offset = (Number(page) - 1) * Number(pageSize);

  const whereConditions: string[] = [];
  const params: (string | number)[] = [];

  if (assignee && assignee !== '') {
    whereConditions.push('t.assignee = ?');
    params.push(assignee as string);
  }

  if (status && status !== '') {
    whereConditions.push('t.status = ?');
    params.push(status as string);
  }

  if (meeting_id && meeting_id !== '') {
    whereConditions.push('t.meeting_id = ?');
    params.push(Number(meeting_id));
  }

  if (overdue === 'true') {
    whereConditions.push("t.due_date < DATE('now') AND t.status != 'completed'");
  }

  const whereClause = whereConditions.length > 0
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';

  const countSql = `
    SELECT COUNT(*) as total
    FROM todo_items t
    ${whereClause}
  `;

  const dataSql = `
    SELECT t.*, m.title as meeting_title, tp.title as topic_title
    FROM todo_items t
    LEFT JOIN meetings m ON t.meeting_id = m.id
    LEFT JOIN topics tp ON t.topic_id = tp.id
    ${whereClause}
    ORDER BY
      CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END,
      CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
      t.due_date ASC,
      t.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countStmt = db.prepare(countSql);
  const dataStmt = db.prepare(dataSql);

  const { total } = countStmt.get(...params) as { total: number };
  const todos = dataStmt.all(...params, Number(pageSize), offset);

  const assigneesStmt = db.prepare(`
    SELECT DISTINCT assignee
    FROM todo_items
    ORDER BY assignee
  `);
  const assignees = assigneesStmt.all().map((a: { assignee: string }) => a.assignee);

  res.json({
    success: true,
    data: todos,
    assignees,
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

  const stmt = db.prepare(`
    SELECT t.*, m.title as meeting_title, tp.title as topic_title
    FROM todo_items t
    LEFT JOIN meetings m ON t.meeting_id = m.id
    LEFT JOIN topics tp ON t.topic_id = tp.id
    WHERE t.id = ?
  `);

  const todo = stmt.get(id);
  if (!todo) {
    return res.status(404).json({ success: false, error: '待办事项不存在' });
  }

  res.json({ success: true, data: todo });
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    assignee,
    due_date,
    status,
    completion_note,
  } = req.body;

  const checkTodo = db.prepare('SELECT id FROM todo_items WHERE id = ?');
  const existing = checkTodo.get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: '待办事项不存在' });
  }

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (title !== undefined) {
    fields.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    values.push(description || null);
  }
  if (assignee !== undefined) {
    fields.push('assignee = ?');
    values.push(assignee);
  }
  if (due_date !== undefined) {
    fields.push('due_date = ?');
    values.push(due_date || null);
  }
  if (status !== undefined) {
    fields.push('status = ?');
    values.push(status);
  }
  if (completion_note !== undefined) {
    fields.push('completion_note = ?');
    values.push(completion_note || null);
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(Number(id));

  const stmt = db.prepare(`
    UPDATE todo_items
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  try {
    stmt.run(...values);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '更新待办事项失败' });
  }
});

router.patch('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, completion_note } = req.body;

  const checkTodo = db.prepare('SELECT id FROM todo_items WHERE id = ?');
  const existing = checkTodo.get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: '待办事项不存在' });
  }

  const stmt = db.prepare(`
    UPDATE todo_items
    SET status = ?, completion_note = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  try {
    stmt.run(status || 'pending', completion_note || null, Number(id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '更新状态失败' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const checkTodo = db.prepare('SELECT id FROM todo_items WHERE id = ?');
  const existing = checkTodo.get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: '待办事项不存在' });
  }

  const stmt = db.prepare('DELETE FROM todo_items WHERE id = ?');

  try {
    stmt.run(id);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '删除待办事项失败' });
  }
});

router.post('/batch-update-status', (req: Request, res: Response) => {
  const { ids, status, completion_note } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: '请选择至少一个待办事项' });
  }

  if (!status) {
    return res.status(400).json({ success: false, error: '状态不能为空' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`
    UPDATE todo_items
    SET status = ?, completion_note = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id IN (${placeholders})
  `);

  try {
    stmt.run(status, completion_note || null, ...ids);
    res.json({ success: true, data: { updated: ids.length } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '批量更新状态失败' });
  }
});

router.post('/batch-update-assignee', (req: Request, res: Response) => {
  const { ids, assignee } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: '请选择至少一个待办事项' });
  }

  if (!assignee) {
    return res.status(400).json({ success: false, error: '负责人不能为空' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`
    UPDATE todo_items
    SET assignee = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id IN (${placeholders})
  `);

  try {
    stmt.run(assignee, ...ids);
    res.json({ success: true, data: { updated: ids.length } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '批量设置负责人失败' });
  }
});

router.post('/batch-delete', (req: Request, res: Response) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: '请选择至少一个待办事项' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const stmt = db.prepare(`DELETE FROM todo_items WHERE id IN (${placeholders})`);

  try {
    stmt.run(...ids);
    res.json({ success: true, data: { deleted: ids.length } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '批量删除失败' });
  }
});

export default router;
