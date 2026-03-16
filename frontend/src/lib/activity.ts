import { Activity, ActivityType } from "@/types/activity";
import {
  getFromStorage,
  saveToStorage,
  dispatchStorageEvent,
} from "./storage";

const STORAGE_KEY = "activities";

// Get all activities
export function getActivities(): Activity[] {
  return getFromStorage<Activity>(STORAGE_KEY).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// Get activities by workspace
export function getActivitiesByWorkspace(
  workspaceId: string | number,
  limit?: number,
): Activity[] {
  const activities = getActivities().filter(
    (activity) => activity.workspaceId === workspaceId,
  );
  return limit ? activities.slice(0, limit) : activities;
}

// Get activities by project
export function getActivitiesByProject(
  projectId: string | number,
  limit?: number,
): Activity[] {
  const activities = getActivities().filter(
    (activity) => activity.projectId === projectId,
  );
  return limit ? activities.slice(0, limit) : activities;
}

// Get activities by task
export function getActivitiesByTask(
  taskId: string | number,
): Activity[] {
  return getActivities().filter((activity) => activity.taskId === taskId);
}

// Log activity
export function logActivity(
  activityData: Omit<Activity, "id" | "createdAt">,
): Activity {
  const newActivity: Activity = {
    ...activityData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  saveToStorage(STORAGE_KEY, newActivity);
  dispatchStorageEvent(STORAGE_KEY);

  return newActivity;
}

// Helper functions for common activities
export function logTaskCreated(
  workspaceId: string | number,
  projectId: string | number,
  taskId: string | number,
  userId: string | number,
  userName: string,
  taskTitle: string,
) {
  return logActivity({
    workspaceId,
    projectId,
    taskId,
    userId,
    userName,
    type: "task_created",
    description: `created task "${taskTitle}"`,
    metadata: { taskTitle },
  });
}

export function logTaskCompleted(
  workspaceId: string | number,
  projectId: string | number,
  taskId: string | number,
  userId: string | number,
  userName: string,
  taskTitle: string,
) {
  return logActivity({
    workspaceId,
    projectId,
    taskId,
    userId,
    userName,
    type: "task_completed",
    description: `completed task "${taskTitle}"`,
    metadata: { taskTitle },
  });
}

export function logTaskAssigned(
  workspaceId: string | number,
  projectId: string | number,
  taskId: string | number,
  userId: string | number,
  userName: string,
  taskTitle: string,
  assigneeName: string,
) {
  return logActivity({
    workspaceId,
    projectId,
    taskId,
    userId,
    userName,
    type: "task_assigned",
    description: `assigned "${taskTitle}" to ${assigneeName}`,
    metadata: { taskTitle, assigneeName },
  });
}

export function logCommentAdded(
  workspaceId: string | number,
  projectId: string | number,
  taskId: string | number,
  userId: string | number,
  userName: string,
  taskTitle: string,
) {
  return logActivity({
    workspaceId,
    projectId,
    taskId,
    userId,
    userName,
    type: "comment_added",
    description: `commented on "${taskTitle}"`,
    metadata: { taskTitle },
  });
}

export function logLabelAdded(
  workspaceId: string | number,
  projectId: string | number,
  taskId: string | number,
  userId: string | number,
  userName: string,
  taskTitle: string,
  labelName: string,
) {
  return logActivity({
    workspaceId,
    projectId,
    taskId,
    userId,
    userName,
    type: "label_added",
    description: `added label "${labelName}" to "${taskTitle}"`,
    metadata: { taskTitle, labelName },
  });
}

export function logSubtaskCompleted(
  workspaceId: string | number,
  projectId: string | number,
  taskId: string | number,
  userId: string | number,
  userName: string,
  taskTitle: string,
  subtaskTitle: string,
) {
  return logActivity({
    workspaceId,
    projectId,
    taskId,
    userId,
    userName,
    type: "subtask_completed",
    description: `completed subtask "${subtaskTitle}" in "${taskTitle}"`,
    metadata: { taskTitle, subtaskTitle },
  });
}
