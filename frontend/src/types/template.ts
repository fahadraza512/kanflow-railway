import { Priority } from "./kanban";

export interface TaskTemplate {
  id: string | number;
  workspaceId: string | number;
  name: string;
  description: string;
  // Template data
  title: string;
  taskDescription?: string;
  priority: Priority;
  labels: (string | number)[];
  subtasks: { title: string }[];
  customFields?: { fieldId: string | number; value: any }[];
  estimatedTime?: number; // hours
  createdBy: string | number;
  createdAt: string;
}
