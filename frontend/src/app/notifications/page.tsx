"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Bell, Check, Inbox, Trash2, CheckCheck,
    UserPlus, UserMinus, ArrowRightLeft, Clock, Trash2 as TrashIcon,
    Move, MessageSquare, AtSign, Reply, LayoutGrid, UserX,
    Mail, Shield, Users, CreditCard, AlertCircle, DollarSign, CheckCircle2
} from "lucide-react";
import { clsx } from "clsx";
import {
    useNotifications,
    useMarkNotificationAsRead,
    useMarkAllNotificationsAsRead,
    useClearAllNotifications,
    useDeleteNotification,
} from "@/hooks/api";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { showToast } from "@/lib/toast";
import { formatDistanceToNow, format } from "date-fns";
import { Notification } from "@/types/api.types";

const iconMap: Record<string, React.ReactNode> = {
    task_assigned: <UserPlus className="w-4 h-4" />,
    task_unassigned: <UserMinus className="w-4 h-4" />,
    task_status_changed: <ArrowRightLeft className="w-4 h-4" />,
    task_due_soon: <Clock className="w-4 h-4" />,
    task_deleted: <TrashIcon className="w-4 h-4" />,
    task_moved: <Move className="w-4 h-4" />,
    task_commented: <MessageSquare className="w-4 h-4" />,
    comment_mention: <AtSign className="w-4 h-4" />,
    comment_reply: <Reply className="w-4 h-4" />,
    board_member_added: <LayoutGrid className="w-4 h-4" />,
    board_member_removed: <UserX className="w-4 h-4" />,
    board_created: <LayoutGrid className="w-4 h-4" />,
    workspace_invite: <Mail className="w-4 h-4" />,
    workspace_role_changed: <Shield className="w-4 h-4" />,
    workspace_member_joined: <Users className="w-4 h-4" />,
    payment_failed: <AlertCircle className="w-4 h-4" />,
    payment_succeeded: <CheckCircle2 className="w-4 h-4" />,
    subscription_expiring: <Clock className="w-4 h-4" />,
    subscription_expired: <AlertCircle className="w-4 h-4" />,
    subscription_renewed: <CreditCard className="w-4 h-4" />,
};

const colorMap: Record<string, string> = {
    task_assigned: "bg-purple-100 text-purple-600",
    task_unassigned: "bg-gray-100 text-gray-600",
    task_status_changed: "bg-blue-100 text-blue-600",
    task_due_soon: "bg-orange-100 text-orange-600",
    task_deleted: "bg-red-100 text-red-600",
    task_moved: "bg-indigo-100 text-indigo-600",
    task_commented: "bg-blue-100 text-blue-600",
    comment_mention: "bg-yellow-100 text-yellow-600",
    comment_reply: "bg-cyan-100 text-cyan-600",
    board_member_added: "bg-green-100 text-green-600",
    board_member_removed: "bg-red-100 text-red-600",
    board_created: "bg-emerald-100 text-emerald-600",
    workspace_invite: "bg-pink-100 text-pink-600",
    workspace_role_changed: "bg-violet-100 text-violet-600",
    workspace_member_joined: "bg-teal-100 text-teal-600",
    payment_failed: "bg-red-100 text-red-600",
    payment_succeeded: "bg-green-100 text-green-600",
    subscription_expiring: "bg-amber-100 text-amber-600",
    subscription_expired: "bg-red-100 text-red-600",
    subscription_renewed: "bg-emerald-100 text-emerald-600",
};

type FilterTab = "all" | "unread" | "assignments" | "mentions" | "comments" | "workspace";

export default function NotificationsPage() {
    const router = useRouter();
    const { workspaces } = useWorkspaceStore();
    const [filter, setFilter] = useState<FilterTab>("all");
    const [workspaceFilter, setWorkspaceFilter] = useState<string>("all");

    const { data: notificationsData = [], isLoading, error } = useNotifications();
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();
    const clearAllMutation = useClearAllNotifications();
    const deleteNotificationMutation = useDeleteNotification();

    const notifications = Array.isArray(notificationsData) ? notificationsData : [];

    const workspaceNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        workspaces.forEach(ws => { map[String(ws.id)] = ws.name; });
        return map;
    }, [workspaces]);

    const activeWorkspaceIds = useMemo(() => {
        const ids = new Set<string>();
        notifications.forEach(n => { if (n.workspaceId) ids.add(n.workspaceId); });
        return Array.from(ids);
    }, [notifications]);

    const filtered = useMemo(() => {
        let result = notifications;

        if (workspaceFilter !== "all") {
            result = result.filter(n => n.workspaceId === workspaceFilter);
        }

        switch (filter) {
            case "unread": return result.filter(n => !n.isRead);
            case "assignments": return result.filter(n => n.type.startsWith("task_"));
            case "mentions": return result.filter(n => ["comment_mention", "comment_reply", "task_commented"].includes(n.type));
            case "comments": return result.filter(n => n.type.includes("comment"));
            case "workspace": return result.filter(n => n.type.startsWith("workspace_") || n.type.startsWith("payment") || n.type.startsWith("subscription"));
            default: return result;
        }
    }, [notifications, filter, workspaceFilter]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkRead = (id: string) => {
        markAsReadMutation.mutate(id);
    };

    const handleMarkAll = async () => {
        try {
            await markAllAsReadMutation.mutateAsync();
            showToast.success("All notifications marked as read");
        } catch {
            showToast.error("Failed to mark all as read");
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Clear all notifications? This cannot be undone.")) return;
        try {
            await clearAllMutation.mutateAsync();
            showToast.success("All notifications cleared");
        } catch {
            showToast.error("Failed to clear notifications");
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        await deleteNotificationMutation.mutateAsync(id);
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.isRead) handleMarkRead(n.id);

        const wsId = n.workspaceId;
        switch (n.type) {
            case "task_assigned":
            case "task_unassigned":
            case "task_status_changed":
            case "task_due_soon":
            case "task_deleted":
            case "task_moved":
                if (n.relatedEntityId) router.push(`/dashboard?taskId=${n.relatedEntityId}`);
                break;
            case "task_commented":
            case "comment_mention":
            case "comment_reply":
                if (n.metadata?.taskId) router.push(`/dashboard?taskId=${n.metadata.taskId}`);
                break;
            case "board_member_added":
            case "board_member_removed":
            case "board_created":
                if (wsId && n.metadata?.projectId && n.relatedEntityId)
                    router.push(`/workspaces/${wsId}/projects/${n.metadata.projectId}/boards/${n.relatedEntityId}`);
                break;
            case "workspace_invite":
                if (n.relatedEntityId) router.push(`/invite/accept?token=${n.relatedEntityId}`);
                break;
            case "workspace_role_changed":
            case "workspace_member_joined":
                router.push("/settings/members");
                break;
            case "payment_failed":
            case "payment_succeeded":
            case "subscription_expiring":
            case "subscription_expired":
            case "subscription_renewed":
                router.push("/settings/billing");
                break;
        }
    };

    const filterTabs: { key: FilterTab; label: string }[] = [
        { key: "all", label: "All" },
        { key: "unread", label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
        { key: "assignments", label: "Tasks" },
        { key: "mentions", label: "Mentions" },
        { key: "comments", label: "Comments" },
        { key: "workspace", label: "Workspace" },
    ];

    return (
        <AuthGuard>
            <DashboardLayout>
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-blue-600" />
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-500 text-xs mt-0.5">All notifications across all your workspaces</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAll}
                                    disabled={markAllAsReadMutation.isPending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    disabled={clearAllMutation.isPending}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Workspace filter — only if multiple workspaces have notifications */}
                    {activeWorkspaceIds.length > 1 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                            <button
                                onClick={() => setWorkspaceFilter("all")}
                                className={clsx("px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                                    workspaceFilter === "all" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}
                            >
                                All workspaces
                            </button>
                            {activeWorkspaceIds.map(wsId => (
                                <button
                                    key={wsId}
                                    onClick={() => setWorkspaceFilter(wsId)}
                                    className={clsx("px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-all",
                                        workspaceFilter === wsId ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}
                                >
                                    {workspaceNameMap[wsId] || "Workspace"}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Type filter tabs */}
                    <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-lg p-1 overflow-x-auto">
                        {filterTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={clsx(
                                    "px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-all",
                                    filter === tab.key ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="divide-y divide-gray-100">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="p-4 flex gap-3 animate-pulse">
                                        <div className="w-9 h-9 bg-gray-200 rounded-lg shrink-0" />
                                        <div className="flex-1">
                                            <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1.5" />
                                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="py-12 text-center">
                                <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-700">Failed to load notifications</p>
                                <p className="text-xs text-gray-500 mt-1">Please try refreshing the page</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-16 text-center">
                                <Inbox className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <h3 className="text-sm font-bold text-gray-900">All caught up</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {filter === "all" ? "No notifications yet" : `No ${filter} notifications`}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filtered.map(n => {
                                    const icon = iconMap[n.type] || <Bell className="w-4 h-4" />;
                                    const color = colorMap[n.type] || "bg-gray-100 text-gray-600";
                                    const wsName = n.workspaceId ? workspaceNameMap[n.workspaceId] : null;

                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={clsx(
                                                "p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors group",
                                                !n.isRead && "bg-blue-50/40"
                                            )}
                                        >
                                            <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", color)}>
                                                {icon}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        {wsName && activeWorkspaceIds.length > 1 && workspaceFilter === "all" && (
                                                            <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-0.5">{wsName}</p>
                                                        )}
                                                        <p className={clsx("text-sm leading-snug", !n.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                                                            {n.title || n.type.replace(/_/g, " ")}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {!n.isRead && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                        )}
                                                        <span
                                                            className="text-[10px] text-gray-400 whitespace-nowrap"
                                                            title={format(new Date(n.createdAt), "PPpp")}
                                                        >
                                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 mt-2">
                                                    {!n.isRead && (
                                                        <button
                                                            onClick={e => { e.stopPropagation(); handleMarkRead(n.id); }}
                                                            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                                                        >
                                                            <Check className="w-3 h-3" /> Mark as read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={e => handleDelete(e, n.id)}
                                                        disabled={deleteNotificationMutation.isPending}
                                                        className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </AuthGuard>
    );
}
