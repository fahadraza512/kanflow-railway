import { TaskDependency, DependencyType } from "@/types/dependency";
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
  dispatchStorageEvent,
} from "./storage";

const STORAGE_KEY = "taskDependencies";

// Get all dependencies
export function getDependencies(): TaskDependency[] {
  return getFromStorage<TaskDependency>(STORAGE_KEY);
}

// Get dependencies for a task
export function getDependenciesForTask(taskId: string | number): TaskDependency[] {
  return getDependencies().filter(
    (dep) => dep.taskId === taskId || dep.dependsOnTaskId === taskId,
  );
}

// Get tasks that block a specific task
export function getBlockingTasks(taskId: string | number): TaskDependency[] {
  return getDependencies().filter(
    (dep) => dep.taskId === taskId && dep.type === "blocked_by",
  );
}

// Get tasks that are blocked by a specific task
export function getBlockedTasks(taskId: string | number): TaskDependency[] {
  return getDependencies().filter(
    (dep) => dep.dependsOnTaskId === taskId && dep.type === "blocks",
  );
}

// Get related tasks
export function getRelatedTasks(taskId: string | number): TaskDependency[] {
  return getDependencies().filter(
    (dep) =>
      (dep.taskId === taskId || dep.dependsOnTaskId === taskId) &&
      dep.type === "relates_to",
  );
}

// Create dependency
export function createDependency(
  taskId: string | number,
  dependsOnTaskId: string | number,
  type: DependencyType,
): TaskDependency {
  // Check if dependency already exists
  const existing = getDependencies().find(
    (dep) =>
      dep.taskId === taskId &&
      dep.dependsOnTaskId === dependsOnTaskId &&
      dep.type === type,
  );

  if (existing) {
    return existing;
  }

  const newDependency: TaskDependency = {
    id: Date.now().toString(),
    taskId,
    dependsOnTaskId,
    type,
    createdAt: new Date().toISOString(),
  };

  saveToStorage(STORAGE_KEY, newDependency);
  dispatchStorageEvent(STORAGE_KEY);

  return newDependency;
}

// Delete dependency
export function deleteDependency(id: string | number): void {
  removeFromStorage<TaskDependency>(STORAGE_KEY, id);
  dispatchStorageEvent(STORAGE_KEY);
}

// Delete all dependencies for a task
export function deleteDependenciesForTask(taskId: string | number): void {
  const dependencies = getDependencies();
  const filtered = dependencies.filter(
    (dep) => dep.taskId !== taskId && dep.dependsOnTaskId !== taskId,
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  dispatchStorageEvent(STORAGE_KEY);
}

// Check if task can be completed (not blocked)
export function canCompleteTask(taskId: string | number): {
  canComplete: boolean;
  blockingTasks: string[];
} {
  const blocking = getBlockingTasks(taskId);
  return {
    canComplete: blocking.length === 0,
    blockingTasks: blocking.map((dep) => String(dep.dependsOnTaskId)),
  };
}

// Check for circular dependencies
export function hasCircularDependency(
  taskId: string | number,
  dependsOnTaskId: string | number,
): boolean {
  const visited = new Set<string | number>();
  const stack = [dependsOnTaskId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === taskId) return true;
    if (visited.has(current)) continue;

    visited.add(current);
    const deps = getDependencies().filter((d) => d.taskId === current);
    deps.forEach((d) => stack.push(d.dependsOnTaskId));
  }

  return false;
}
