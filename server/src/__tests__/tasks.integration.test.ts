import request from 'supertest';

// Set test environment before importing app/db
process.env.NODE_ENV = 'test';

import app from '../app';
import pool, { initDb } from '../db';

beforeAll(async () => {
  await initDb();
});

beforeEach(async () => {
  await pool.query('DELETE FROM tasks');
});

afterAll(async () => {
  await pool.query('DROP TABLE IF EXISTS tasks');
  await pool.end();
});

describe('GET /api/tasks', () => {
  it('returns empty array when no tasks', async () => {
    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns tasks sorted by created_at desc', async () => {
    await pool.query(
      "INSERT INTO tasks (title, priority, created_at) VALUES ('First', 'low', '2026-01-01'), ('Second', 'high', '2026-01-02')"
    );

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].title).toBe('Second');
    expect(res.body[1].title).toBe('First');
  });
});

describe('POST /api/tasks', () => {
  it('creates a task and returns it with 201', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Integration task', priority: 'high', due_date: '2026-06-15' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Integration task',
      priority: 'high',
      completed: false,
    });
    expect(res.body.id).toBeDefined();

    // Verify it was persisted
    const dbResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [res.body.id]);
    expect(dbResult.rows).toHaveLength(1);
  });

  it('uses default priority when not provided', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Default priority' });

    expect(res.status).toBe(201);
    expect(res.body.priority).toBe('medium');
  });

  it('returns 400 for missing title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ priority: 'high' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Title is required');
  });

  it('trims whitespace from title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: '  Trimmed task  ' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Trimmed task');
  });
});

describe('PUT /api/tasks/:id', () => {
  it('updates task fields', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'Original', priority: 'low' });

    const res = await request(app)
      .put(`/api/tasks/${created.body.id}`)
      .send({ title: 'Updated', priority: 'high', completed: true });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
    expect(res.body.priority).toBe('high');
    expect(res.body.completed).toBe(true);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app)
      .put('/api/tasks/99999')
      .send({ title: 'Nope' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/tasks/:id', () => {
  it('deletes a task and returns 204', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: 'To delete' });

    const res = await request(app).delete(`/api/tasks/${created.body.id}`);
    expect(res.status).toBe(204);

    // Verify it was removed
    const dbResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [created.body.id]);
    expect(dbResult.rows).toHaveLength(0);
  });

  it('returns 404 for non-existent task', async () => {
    const res = await request(app).delete('/api/tasks/99999');
    expect(res.status).toBe(404);
  });
});
