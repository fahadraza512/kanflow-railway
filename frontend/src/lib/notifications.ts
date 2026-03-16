import { Notification } from "@/types/kanban";
import {
  getNotificationsByUser,
  saveNotification,
  markNotificationAsRead as markAsRead,
  markAllNotificationsAsRead as markAllAsRead,
} from "./storage";

export function getNotifications(userId: string | number): Notification[] {
  return getNotificationsByUser(userId);
}

export function createNotification(notification: Omit<Notification, "id" | "createdAt">): void {
  const newNotification: Notification = {
    ...notification,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  saveNotification(newNotification);
}

export function markNotificationAsRead(notificationId: string | number): void {
  markAsRead(notificationId);
}

export function markAllNotificationsAsRead(userId: string | number): void {
  markAllAsRead(userId);
}

export function checkDueDateReminders(): void {
  // Get current user from localStorage
  const currentUserStr = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
  if (!currentUserStr) return;

  const currentUser = JSON.parse(currentUserStr);
  if (!currentUser || !currentUser.id) return;

  // Get all tasks from storage
  const tasksStr = typeof window !== "undefined" ? localStorage.getItem("tasks") : null;
  if (!tasksStr) return;

  const tasks = JSON.parse(tasksStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Check for tasks due tomorrow that haven't been notified
  tasks.forEach((task: any) => {
    if (!task.dueDate || task.isArchived) return;

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    // If task is due tomorrow and assigned to current user
    if (
      dueDate.getTime() === tomorrow.getTime() &&
      task.assignedTo === currentUser.id
    ) {
      // Check if we already sent a reminder for this task
      const notificationKey = `reminder_sent_${task.id}_${dueDate.toISOString()}`;
      const alreadySent = localStorage.getItem(notificationKey);

      if (!alreadySent) {
        createNotification({
          userId: currentUser.id,
          type: "deadline",
          message: `Task "${task.title}" is due tomorrow`,
          taskId: task.id,
          isRead: false,
        });

        // Mark that we sent this reminder
        localStorage.setItem(notificationKey, "true");
      }
    }
  });
}
