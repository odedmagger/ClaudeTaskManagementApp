import axios from 'axios';
import type { Task } from '../types';

const api = axios.create({ baseURL: '/api/tasks' });

export async function getTasks(): Promise<Task[]> {
  const { data } = await api.get('/');
  return data;
}

export async function createTask(
  task: Pick<Task, 'title' | 'priority'> & { due_date?: string }
): Promise<Task> {
  const { data } = await api.post('/', task);
  return data;
}

export async function updateTask(
  id: number,
  updates: Partial<Pick<Task, 'title' | 'priority' | 'due_date' | 'completed'>>
): Promise<Task> {
  const { data } = await api.put(`/${id}`, updates);
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/${id}`);
}
