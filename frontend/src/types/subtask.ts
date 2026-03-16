export interface Subtask {
  id: string | number;
  taskId: string | number;
  title: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export interface SubtaskProgress {
  completed: number;
  total: number;
  percentage: number;
}
