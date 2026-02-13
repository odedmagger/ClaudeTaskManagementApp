import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const result = await pool.query(
    'SELECT * FROM tasks ORDER BY created_at DESC'
  );
  res.json(result.rows);
});

router.post('/', async (req: Request, res: Response) => {
  const { title, priority, due_date } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  const result = await pool.query(
    'INSERT INTO tasks (title, priority, due_date) VALUES ($1, $2, $3) RETURNING *',
    [title.trim(), priority || 'medium', due_date || null]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, priority, due_date, completed } = req.body;

  const result = await pool.query(
    `UPDATE tasks SET
      title = COALESCE($1, title),
      priority = COALESCE($2, priority),
      due_date = COALESCE($3, due_date),
      completed = COALESCE($4, completed)
    WHERE id = $5
    RETURNING *`,
    [title, priority, due_date, completed, id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.json(result.rows[0]);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM tasks WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.status(204).send();
});

export default router;
