import { useEffect, useState } from 'react';
import type { Task } from './types';
import { getTasks, createTask, updateTask, deleteTask } from './api/tasks';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchTasks() {
    try {
      const data = await getTasks();
      setTasks(data);
      setError(null);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleCreate(task: { title: string; priority: Task['priority']; due_date?: string }) {
    try {
      const newTask = await createTask(task);
      setTasks((prev) => [newTask, ...prev]);
    } catch {
      setError('Failed to create task');
    }
  }

  async function handleUpdate(id: number, updates: Partial<Task>) {
    try {
      const updated = await updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setError('Failed to update task');
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Failed to delete task');
    }
  }

  return (
    <div className="container">
      <h1>Task Manager</h1>
      {error && <p className="error">{error}</p>}
      <TaskForm onSubmit={handleCreate} />
      {loading ? <p>Loading...</p> : (
        <TaskList tasks={tasks} onUpdate={handleUpdate} onDelete={handleDelete} />
      )}
    </div>
  );
}

export default App;
