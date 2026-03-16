import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useNotifications, useMarkAllNotificationsAsRead, useClearAllNotifications } from "@/hooks/api";
import { NotificationItem } from "./NotificationItem";
import { CheckCheck, Bell, Trash2, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { activeWorkspace } = useWorkspaceStore();
  const { data: notificationsData = [], isLoading } = useNotifications(activeWorkspace?.id || null);
  const markAllAsReadMutation = useMarkAllNotificationsAsRead(activeWorkspace?.id || null);
  const clearAllMutation = useClearAllNotifications(activeWorkspace?.id || null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'assignments' | 'mentions' | 'comments' | 'deadlines'>('all');

  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'unread': return notifications.filter(n => !n.isRead);
      case 'assignments': return notifications.filter(n => ['task_assigned','task_unassigned','assignment'].includes(n.type));
      case 'mentions': return notifications.filter(n => ['comment_mention','mention'].includes(n.type));
      case 'comments': return notifications.filter(n => ['task_commented','comment_reply','comment'].includes(n.type));
      case 'deadlines': return notifications.filter(n => ['task_due_soon','deadline'].includes(n.type));
      default: return notifications;
    }
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => markAllAsReadMutation.mutateAsync();
  const handleClearAll = async () => {
    if (confirm('Clear all notifications? This cannot be undone.')) {
      await clearAllMutation.mutateAsync();
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const filterLabels = ['all', 'unread', 'assignments', 'mentions', 'comments', 'deadlines'] as const;

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden" style={{ width: 300, maxHeight: 440 }}>

      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-bold text-gray-900">Notifications</span>
          {unreadCount > 0 && <span className="text-[10px] text-gray-500">· {unreadCount} unread</span>}
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/70 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="px-2 py-1.5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="grid grid-cols-3 gap-1">
          {filterLabels.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={"py-1 text-[10px] font-medium rounded capitalize transition-all " + (filter === f ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      {notifications.length > 0 && (
        <div className="px-2 py-1 border-b border-gray-100 flex gap-1 flex-shrink-0">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} disabled={markAllAsReadMutation.isPending}
              className="flex-1 py-1 text-[10px] text-blue-600 hover:bg-blue-50 font-semibold rounded flex items-center justify-center gap-1 disabled:opacity-50">
              <CheckCheck className="w-3 h-3" /> Mark all read
            </button>
          )}
          <button onClick={handleClearAll} disabled={clearAllMutation.isPending}
            className="flex-1 py-1 text-[10px] text-red-500 hover:bg-red-50 font-semibold rounded flex items-center justify-center gap-1 disabled:opacity-50">
            <Trash2 className="w-3 h-3" /> Clear all
          </button>
        </div>
      )}

      {/* List */}
      <div className="overflow-y-auto flex-1 bg-white">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3 animate-pulse flex gap-2">
                <div className="w-7 h-7 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-2.5 bg-gray-200 rounded w-3/4 mb-1.5" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Bell className="w-8 h-8 mb-2 text-gray-300" />
            <p className="text-xs font-medium text-gray-500">{filter === 'all' ? 'No notifications' : "No " + filter}</p>
            {filter === 'all' && <p className="text-[10px] text-gray-400 mt-0.5">You are all caught up</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map(n => <NotificationItem key={n.id} notification={n} onClose={onClose} />)}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-100 flex-shrink-0">
          <a href="/notifications" onClick={onClose}
            className="block px-3 py-2 text-center text-[10px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
}
