export type DependencyType = "blocks" | "blocked_by" | "relates_to";

export interface TaskDependency {
  id: string | number;
  taskId: string | number; // The task that has the dependency
  dependsOnTaskId: string | number; // The task it depends on
  type: DependencyType;
  createdAt: string;
}

export interface TaskWithDependencies {
  taskId: string | number;
  taskTitle: string;
  blocks: string[]; // Task IDs this task blocks
  blockedBy: string[]; // Task IDs blocking this task
  relatesTo: string[]; // Related task IDs
}
