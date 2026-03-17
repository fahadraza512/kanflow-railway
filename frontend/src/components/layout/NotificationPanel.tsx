import { useNotifications, useMarkAllNotificationsAsRead, useClearAllNotifications } from "@/hooks/api";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { NotificationItem } from "./NotificationItem";
import { CheckCheck, Bell, Trash2, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface NotificationPanelProps {
  onClose: () => void;
}

type FilterTab = 'all' | 'unread' | 'assignments' | 'mentions' | 'comments' | 'deadlines';

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { workspaces } = useWorkspaceStore();
  const { data: notificationsData = [], isLoading } = useNotifications(); // global — no workspace filter
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const clearAllMutation = useClearAllNotifications();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [workspaceTab, setWorkspaceTab] = useState<string>('all');

  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

  // Build workspace name map from store
  const workspaceNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    workspaces.forEach(ws => { map[String(ws.id)] = ws.name; });
    return map;
  }, [workspaces]);

  // Workspaces that have at least one notification
  const activeWorkspaceIds = useMemo(() => {
    const ids = new Set<string>();
    notifications.forEach(n => { if (n.workspaceId) ids.add(n.workspaceId); });
    return Array.from(ids);
  }, [notifications]);

  // Filter by workspace tab first, then by type filter
  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (workspaceTab !== 'all') {
      result = result.filter(n => n.workspaceId === workspaceTab);
    }

    switch (filter) {
      case 'unread': return result.filter(n => !n.isRead);
      case 'assignments': return result.filter(n => ['task_assigned','task_unassigned','assignment'].includes(n.type));
      case 'mentions': return result.filter(n => ['comment_mention','mention'].includes(n.type));
      case 'comments': return result.filter(n => ['task_commented','comment_reply','comment'].includes(n.type));
      case 'deadlines': return result.filter(n => ['task_due_soon','deadline'].includes(n.type));
      default: return result;
    }
  }, [notifications, filter, workspaceTab]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Unread count per workspace for dot indicators
  const unreadByWorkspace = useMemo(() => {
    const map: Record<string, number> = {};
    notifications.filter(n => !n.isRead && n.workspaceId).forEach(n => {
      map[n.workspaceId!] = (map[n.workspaceId!] || 0) + 1;
    });
    return map;
  }, [notifications]);

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

  const filterLabels: FilterTab[] = ['all', 'unread', 'assignments', 'mentions', 'comments', 'deadlines'];

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden" style={{ width: 320, maxHeight: 480 }}>

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

      {/* Workspace tabs — only show if user has notifications from multiple workspaces */}
      {activeWorkspaceIds.length > 1 && (
        <div className="px-2 pt-1.5 pb-1 border-b border-gray-100 bg-white flex-shrink-0 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            <button
              onClick={() => setWorkspaceTab('all')}
              className={"px-2 py-0.5 text-[10px] font-medium rounded-full transition-all whitespace-nowrap " +
                (workspaceTab === 'all' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100')}
            >
              All workspaces
            </button>
            {activeWorkspaceIds.map(wsId => (
              <button
                key={wsId}
                onClick={() => setWorkspaceTab(wsId)}
                className={"relative px-2 py-0.5 text-[10px] font-medium rounded-full transition-all whitespace-nowrap " +
                  (workspaceTab === wsId ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100')}
              >
                {workspaceNameMap[wsId] || 'Workspace'}
                {unreadByWorkspace[wsId] > 0 && workspaceTab !== wsId && (
                  <span className="ml-1 inline-flex items-center justify-center w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full">
                    {unreadByWorkspace[wsId] > 9 ? '9+' : unreadByWorkspace[wsId]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Type filter tabs */}
      <div className="px-2 py-1.5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
        <div className="grid grid-cols-3 gap-1">
          {filterLabels.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={"py-1 text-[10px] font-medium rounded capitalize transition-all " +
                (filter === f ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-200')}>
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
            <p className="text-xs font-medium text-gray-500">{filter === 'all' ? 'No notifications' : `No ${filter}`}</p>
            {filter === 'all' && <p className="text-[10px] text-gray-400 mt-0.5">You are all caught up</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map(n => (
              <NotificationItem
                key={n.id}
                notification={n}
                workspaceName={workspaceNameMap[n.workspaceId!]}
                showWorkspace={workspaceTab === 'all' && activeWorkspaceIds.length > 1}
                onClose={onClose}
              />
            ))}
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
