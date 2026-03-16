import { Subtask, SubtaskProgress } from "@/types/subtask";
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
  dispatchStorageEvent,
} from "./storage";

const STORAGE_KEY = "subtasks";

// Get all subtasks
export function getSubtasks(): Subtask[] {
  return getFromStorage<Subtask>(STORAGE_KEY);
}

// Get subtasks by task
export function getSubtasksByTask(taskId: string | number): Subtask[] {
  return getSubtasks()
    .filter((subtask) => subtask.taskId === taskId)
    .sort((a, b) => a.order - b.order);
}

// Get subtask by ID
export function getSubtaskById(id: string | number): Subtask | undefined {
  return getSubtasks().find((subtask) => subtask.id === id);
}

// Create subtask
export function createSubtask(
  subtaskData: Omit<Subtask, "id" | "createdAt" | "order">,
): Subtask {
  const existingSubtasks = getSubtasksByTask(subtaskData.taskId);
  const maxOrder = existingSubtasks.length > 0
    ? Math.max(...existingSubtasks.map((s) => s.order))
    : -1;

  const newSubtask: Subtask = {
    ...subtaskData,
    id: Date.now().toString(),
    order: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };

  saveToStorage(STORAGE_KEY, newSubtask);
  dispatchStorageEvent(STORAGE_KEY);

  return newSubtask;
}

// Update subtask
export function updateSubtask(
  id: string | number,
  updates: Partial<Omit<Subtask, "id" | "taskId" | "createdAt">>,
): Subtask | null {
  const subtasks = getSubtasks();
  const index = subtasks.findIndex((subtask) => subtask.id === id);

  if (index === -1) return null;

  const updatedSubtask = { ...subtasks[index], ...updates };
  subtasks[index] = updatedSubtask;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(subtasks));
  dispatchStorageEvent(STORAGE_KEY);

  return updatedSubtask;
}

// Toggle subtask completion
export function toggleSubtaskCompletion(id: string | number): Subtask | null {
  const subtask = getSubtaskById(id);
  if (!subtask) return null;

  return updateSubtask(id, { completed: !subtask.completed });
}

// Delete subtask
export function deleteSubtask(id: string | number): void {
  removeFromStorage<Subtask>(STORAGE_KEY, id);
  dispatchStorageEvent(STORAGE_KEY);
}

// Delete all subtasks for a task
export function deleteSubtasksByTask(taskId: string | number): void {
  const subtasks = getSubtasks();
  const filtered = subtasks.filter((subtask) => subtask.taskId !== taskId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  dispatchStorageEvent(STORAGE_KEY);
}

// Reorder subtasks
export function reorderSubtasks(
  taskId: string | number,
  subtaskIds: (string | number)[],
): void {
  const subtasks = getSubtasks();
  const taskSubtasks = subtasks.filter((s) => s.taskId === taskId);

  taskSubtasks.forEach((subtask) => {
    const newOrder = subtaskIds.indexOf(subtask.id);
    if (newOrder !== -1) {
      subtask.order = newOrder;
    }
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(subtasks));
  dispatchStorageEvent(STORAGE_KEY);
}

// Calculate subtask progress
export function calculateSubtaskProgress(
  taskId: string | number,
): SubtaskProgress {
  const subtasks = getSubtasksByTask(taskId);
  const total = subtasks.length;
  const completed = subtasks.filter((s) => s.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage };
}
