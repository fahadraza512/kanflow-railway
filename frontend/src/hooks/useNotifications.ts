import { useState, useEffect, useCallback } from "react";
import { Notification } from "@/types/kanban";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/notifications";
import { useAuthStore } from "@/store/useAuthStore";
import { useHydration } from "./useHydration";

export function useNotifications() {
  const { user } = useAuthStore();
  const isHydrated = useHydration();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const userNotifications = getNotifications(user.id);
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter((n) => !n.isRead).length);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!isHydrated) return;
    
    loadNotifications();

    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === "notifications") {
        loadNotifications();
      }
    };

    window.addEventListener("local-storage-change", handleStorageChange);
    return () =>
      window.removeEventListener("local-storage-change", handleStorageChange);
  }, [loadNotifications, isHydrated]);

  const markAsRead = useCallback((notificationId: string | number) => {
    markNotificationAsRead(notificationId);
    loadNotifications();
  }, [loadNotifications]);

  const markAllAsRead = useCallback(() => {
    if (user) {
      markAllNotificationsAsRead(user.id);
      loadNotifications();
    }
  }, [user, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
}
