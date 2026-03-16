"use client";

import Navbar from "@/components/layout/Navbar";
import AuthGuard from "@/components/auth/AuthGuard";
import { useState, useMemo } from "react";
import { Inbox, Check, Bell } from "lucide-react";
import { clsx } from "clsx";
import { 
    useNotifications, 
    useMarkNotificationAsRead, 
    useMarkAllNotificationsAsRead 
} from "@/hooks/api";
import { showToast } from "@/lib/toast";
import LoadingState from "@/components/ui/LoadingState";

export default function NotificationsPage() {
    const [filter, setFilter] = useState<"all" | "unread">("all");
    
    // Fetch notifications
    const { data: notifications = [], isLoading, error } = useNotifications();
    
    // Mutations
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();

    // Filter notifications
    const filtered = useMemo(() => {
        return filter === "all"
            ? notifications
            : notifications.filter(n => !n.isRead);
    }, [notifications, filter]);

    const handleMarkRead = async (id: string) => {
        try {
            await markAsReadMutation.mutateAsync(id);
            showToast.success("Notification marked as read");
        } catch (error: any) {
            showToast.error(error.message || "Failed to mark notification as read");
        }
    };

    const handleMarkAll = async () => {
        try {
            await markAllAsReadMutation.mutateAsync();
            showToast.success("All notifications marked as read");
        } catch (error: any) {
            showToast.error(error.message || "Failed to mark all notifications as read");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F9FAFB]">
                <Navbar />
                <AuthGuard>
                    <main className="max-w-4xl mx-auto px-4 py-20">
                        <LoadingState message="Loading notifications..." />
                    </main>
                </AuthGuard>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F9FAFB]">
                <Navbar />
                <AuthGuard>
                    <main className="max-w-4xl mx-auto px-4 py-20">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm">
                                Failed to load notifications. Please try again later.
                            </p>
                        </div>
                    </main>
                </AuthGuard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <Navbar />
            <AuthGuard>
                <main className="max-w-4xl mx-auto px-4 py-20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <Bell className="w-5 h-5 text-blue-600" />
                                Notifications
                            </h1>
                            <p className="text-gray-500 text-xs mt-1">Keep track of mentions and updates</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex bg-white p-0.5 rounded-lg border border-gray-200 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setFilter("all")}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                                        filter === "all" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
                                    )}
                                >
                                    All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilter("unread")}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                                        filter === "unread" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
                                    )}
                                >
                                    Unread
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={handleMarkAll}
                                disabled={markAllAsReadMutation.isPending || notifications.every(n => n.isRead)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {markAllAsReadMutation.isPending ? "Marking..." : "Mark all as read"}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
                        {filtered.length === 0 ? (
                            <div className="py-16 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 border border-gray-200">
                                    <Inbox className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">All caught up!</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    No {filter === "unread" ? "unread" : ""} notifications found.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {filtered.map((n) => (
                                    <div
                                        key={n.id}
                                        className={clsx(
                                            "p-4 flex gap-3 transition-all hover:bg-gray-50",
                                            !n.isRead && "bg-blue-50/30"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold",
                                            n.type === "mention" ? "bg-purple-100 text-purple-600" :
                                                n.type === "assignment" ? "bg-blue-100 text-blue-600" :
                                                    n.type === "deadline" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                                        )}>
                                            {n.type === "mention" ? "@" : 
                                             n.type === "assignment" ? "👤" : 
                                             n.type === "deadline" ? "⏰" : "💬"}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs font-semibold text-blue-600 uppercase mb-0.5">
                                                        {n.type}
                                                    </p>
                                                    <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                                                        {n.message}
                                                    </h4>
                                                </div>
                                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 pt-1">
                                                {!n.isRead && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMarkRead(n.id)}
                                                        disabled={markAsReadMutation.isPending}
                                                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Mark as read
                                                    </button>
                                                )}
                                                <button 
                                                    type="button"
                                                    className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                                >
                                                    View Task
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </AuthGuard>
        </div>
    );
}
