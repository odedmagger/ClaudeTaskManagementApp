export interface Task {
  id: number;
  title: string;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  completed: boolean;
  created_at: string;
}
