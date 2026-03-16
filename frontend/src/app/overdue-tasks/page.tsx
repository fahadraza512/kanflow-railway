"use client";

import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useOverdueTasks, useUpdateTask } from "@/hooks/api";
import { showToast } from "@/lib/toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingState from "@/components/ui/LoadingState";
import { AlertCircle, Calendar, Clock } from "lucide-react";

export default function OverdueTasksPage() {
    const router = useRouter();
    const { activeWorkspace } = useWorkspaceStore();
    const { data: overdueTasks = [], isLoading } = useOverdueTasks(activeWorkspace?.id);
    const updateTaskMutation = useUpdateTask();

    const getDaysOverdue = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        due.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleUpdateDueDate = (taskId: string, newDueDate: string) => {
        updateTaskMutation.mutate(
            { id: taskId, data: { dueDate: newDueDate } },
            {
                onSuccess: () => showToast.success("Due date updated"),
                onError: (error: any) => {
                    const errorMessage = error?.response?.data?.message || "Failed to update due date";
                    showToast.error(errorMessage);
                }
            }
        );
    };

    const handleMarkComplete = (taskId: string) => {
        updateTaskMutation.mutate(
            { id: taskId, data: { status: "done" } },
            {
                onSuccess: () => showToast.success("Task marked as complete!"),
                onError: (error: any) => {
                    const errorMessage = error?.response?.data?.message || "Failed to mark task complete";
                    showToast.error(errorMessage);
                }
            }
        );
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <main className="max-w-6xl mx-auto px-4 py-6">
                    <LoadingState message="Loading overdue tasks..." />
                </main>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <main className="max-w-6xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Overdue Tasks</h1>
                            <p className="text-sm text-gray-600">
                                {overdueTasks.length} task{overdueTasks.length !== 1 ? 's' : ''} need{overdueTasks.length === 1 ? 's' : ''} your attention
                            </p>
                        </div>
                    </div>
                </div>

                {overdueTasks.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                        <p className="text-gray-600">You have no overdue tasks. Great job staying on track!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {overdueTasks.map((task) => (
                            <div
                                key={task.id}
                                className="bg-white rounded-lg border border-red-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                                            {task.title}
                                        </h3>
                                        {task.description && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {task.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs">
                                            <div className="flex items-center gap-1.5 text-red-600 font-semibold">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                Overdue by {getDaysOverdue(task.dueDate!)} day{getDaysOverdue(task.dueDate!) !== 1 ? 's' : ''}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Due: {new Date(task.dueDate!).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-600">New due date:</label>
                                            <input
                                                type="date"
                                                defaultValue={task.dueDate || ""}
                                                onChange={(e) => handleUpdateDueDate(task.id, e.target.value)}
                                                className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleMarkComplete(task.id)}
                                            disabled={updateTaskMutation.isPending}
                                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            Mark Complete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6">
                    <button
                        onClick={() => router.replace('/dashboard')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </main>
        </DashboardLayout>
    );
}
