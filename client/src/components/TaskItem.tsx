import { useState } from 'react';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, updates: Partial<Task>) => void;
  onDelete: (id: number) => void;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  function handleSave() {
    if (!editTitle.trim()) return;
    onUpdate(task.id, { title: editTitle.trim() });
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  }

  const priorityClass = `priority-${task.priority}`;

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onUpdate(task.id, { completed: !task.completed })}
      />

      {isEditing ? (
        <input
          className="edit-input"
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span className="task-title" onDoubleClick={() => setIsEditing(true)}>
          {task.title}
        </span>
      )}

      <span className={`priority-badge ${priorityClass}`}>{task.priority}</span>

      {task.due_date && (
        <span className="due-date">
          {new Date(task.due_date).toLocaleDateString()}
        </span>
      )}

      <div className="task-actions">
        <button onClick={() => setIsEditing(true)} title="Edit">✎</button>
        <button onClick={() => onDelete(task.id)} title="Delete">✕</button>
      </div>
    </li>
  );
}
