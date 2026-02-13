import request from 'supertest';
import app from '../app';

// Mock the db module
jest.mock('../db', () => {
  const mockQuery = jest.fn();
  return {
    __esModule: true,
    default: { query: mockQuery },
    initDb: jest.fn(),
  };
});

import pool from '../db';

const mockQuery = pool.query as jest.Mock;

beforeEach(() => {
  mockQuery.mockReset();
});

describe('GET /api/tasks', () => {
  it('returns all tasks', async () => {
    const tasks = [
      { id: 1, title: 'Task 1', priority: 'high', completed: false },
      { id: 2, title: 'Task 2', priority: 'low', completed: true },
    ];
    mockQuery.mockResolvedValue({ rows: tasks });

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(tasks);
    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
  });

  it('returns empty array when no tasks exist', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/tasks', () => {
  it('creates a task with all fields', async () => {
    const newTask = {
      id: 1,
      title: 'New task',
      priority: 'high',
      due_date: '2026-03-01',
      completed: false,
    };
    mockQuery.mockResolvedValue({ rows: [newTask] });

    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'New task', priority: 'high', due_date: '2026-03-01' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(newTask);
  });

  it('creates a task with defaults when only title provided', async () => {
    const newTask = { id: 1, title: 'Simple task', priority: 'medium', completed: false };
    mockQuery.mockResolvedValue({ rows: [newTask] });

    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Simple task' });

    expect(res.status).toBe(201);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.any(String),
      ['Simple task', 'medium', null]
    );
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/tasks').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('returns 400 when title is empty string', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });
});

describe('PUT /api/tasks/:id', () => {
  it('updates a task', async () => {
    const updated = { id: 1, title: 'Updated', priority: 'low', completed: true };
    mockQuery.mockResolvedValue({ rows: [updated] });

    const res = await request(app)
      .put('/api/tasks/1')
      .send({ title: 'Updated', completed: true });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(updated);
  });

  it('returns 404 when task does not exist', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const res = await request(app)
      .put('/api/tasks/999')
      .send({ title: 'Nope' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task', async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });

    const res = await request(app).delete('/api/tasks/1');

    expect(res.status).toBe(204);
  });

  it('returns 404 when task does not exist', async () => {
    mockQuery.mockResolvedValue({ rows: [] });

    const res = await request(app).delete('/api/tasks/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Task not found');
  });
});
