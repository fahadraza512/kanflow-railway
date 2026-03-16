export type ActivityType =
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "task_assigned"
  | "task_moved"
  | "comment_added"
  | "member_added"
  | "project_created"
  | "file_uploaded"
  | "label_added"
  | "label_removed"
  | "subtask_completed"
  | "subtask_added"
  | "priority_changed"
  | "due_date_changed";

export interface Activity {
  id: string | number;
  workspaceId: string | number;
  projectId?: string | number;
  taskId?: string | number;
  userId: string | number;
  userName: string;
  userAvatar?: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
