import { useState, useEffect } from "react";
import { Task, ActivityLog, Priority } from "@/types/kanban";
import { useUpdateTask, useDeleteTask, useTask } from "@/hooks/api/useTasks";
import { useTaskActivity } from "@/hooks/api/useActivity";
import { useAuthStore } from "@/store/useAuthStore";
import { validateTaskTitle as validateTaskTitleCharacters } from "@/lib/validation";
import { ToastType } from "../components/ui/Toast";
import { showToast as showToastNotification } from "@/lib/toast";

interface Breadcrumb {
    workspace: string;
    project: string;
    board: string;
    list: string;
}

export function useTaskDetail(task: Task, isOpen: boolean, onClose: () => void, onUpdate: () => void, lists: any[] = []) {
    const [title, setTitle] = useState(task.title);
    const [titleError, setTitleError] = useState("");
    const [description, setDescription] = useState(task.description);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [showLabelInput, setShowLabelInput] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // API hooks
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();
    const { data: taskDetail } = useTask(isOpen ? task.id : null);
    const { data: activities = [] } = useTaskActivity(isOpen ? task.id.toString() : "");

    // Use taskDetail from API if available, otherwise use prop
    const currentTask = taskDetail || task;

    const showToast = (message: string, type: ToastType = "success") => {
        setToast({ message, type });
    };

    useEffect(() => {
        if (isOpen) {
            setTitle(currentTask.title);
            setDescription(currentTask.description || "");
        }
    }, [isOpen, currentTask.title, currentTask.description]);

    const handleTitleBlur = () => {
        if (title.trim() && title !== currentTask.title) {
            const charValidation = validateTaskTitleCharacters(title);
            if (!charValidation.isValid) {
                setTitleError(charValidation.error || "Invalid task title");
                showToast(charValidation.error || "Invalid task title", "error");
                setTitle(currentTask.title);
                setIsEditingTitle(false);
                return;
            }

            updateTaskMutation.mutate({
                id: currentTask.id,
                data: { title: title.trim() }
            }, {
                onSuccess: () => {
                    onUpdate();
                    showToast("Task title updated");
                    setTitleError("");
                },
                onError: () => {
                    showToast("Failed to update title", "error");
                    setTitle(currentTask.title);
                }
            });
        } else if (!title.trim()) {
            setTitle(currentTask.title);
        }
        setIsEditingTitle(false);
    };

    const handleDescriptionBlur = () => {
        if (description !== currentTask.description) {
            updateTaskMutation.mutate({
                id: currentTask.id,
                data: { description }
            }, {
                onSuccess: () => {
                    onUpdate();
                    showToast("Description updated");
                },
                onError: () => {
                    showToast("Failed to update description", "error");
                }
            });
        }
    };

    const handleDelete = () => {
        if (confirm(`Delete "${currentTask.title}"? This action cannot be undone.`)) {
            deleteTaskMutation.mutate({
                id: currentTask.id,
                boardId: currentTask.boardId,
                listId: currentTask.listId
            }, {
                onSuccess: () => {
                    onClose();
                    onUpdate();
                    showToast("Task deleted", "info");
                },
                onError: () => {
                    showToast("Failed to delete task", "error");
                }
            });
        }
    };

    const handleArchive = () => {
        updateTaskMutation.mutate({
            id: currentTask.id,
            data: { isArchived: !currentTask.isArchived }  // Backend uses isArchived, not archived
        }, {
            onSuccess: () => {
                onClose();
                onUpdate();
                showToast(currentTask.isArchived ? "Task restored" : "Task archived", "info");
            },
            onError: () => {
                showToast("Failed to archive task", "error");
            }
        });
    };

    const handlePriorityChange = (p: Priority) => {
        updateTaskMutation.mutate({
            id: currentTask.id,
            data: { priority: p }
        }, {
            onSuccess: () => {
                onUpdate();
                showToast(`Priority set to ${p}`);
            },
            onError: () => {
                showToast("Failed to update priority", "error");
            }
        });
    };

    const handleStatusChange = (status: string) => {
        // Find the list that corresponds to this status by matching list names
        let targetListId = currentTask.listId; // Default to current list
        
        if (lists && lists.length > 0) {
            // Map status to expected list name patterns
            const statusToListName: Record<string, string[]> = {
                todo: ['to do', 'todo', 'backlog'],
                inProgress: ['in progress', 'progress', 'doing'],
                inReview: ['in review', 'review', 'reviewing'],
                done: ['done', 'complete', 'completed']
            };
            
            const patterns = statusToListName[status] || [];
            const matchingList = lists.find(list => {
                const listName = list.name.toLowerCase();
                return patterns.some(pattern => listName.includes(pattern));
            });
            
            if (matchingList) {
                targetListId = matchingList.id;
            }
        }
        
        updateTaskMutation.mutate({
            id: currentTask.id,
            data: { 
                status,
                listId: targetListId // Update listId to move task to correct column
            }
        }, {
            onSuccess: () => {
                onUpdate();
                const statusLabels: Record<string, string> = {
                    todo: "To Do",
                    inProgress: "In Progress",
                    inReview: "In Review",
                    done: "Done"
                };
                showToast(`Status changed to ${statusLabels[status] || status}`);
            },
            onError: () => {
                showToast("Failed to update status", "error");
            }
        });
    };

    const handleAssigneeChange = (userId: string | number | null, userName: string) => {
        // Explicitly handle null/empty values
        const assigneeIdToSend = (userId === null || userId === '' || userId === undefined) ? null : (userId as string);
        
        // Guard: Don't re-fire if we're already unassigned and trying to unassign again
        if (assigneeIdToSend === null && currentTask.assigneeId === null) {
            console.log('[handleAssigneeChange] SKIPPED - Task is already unassigned');
            return;
        }
        
        // Guard: Don't re-fire if we're trying to assign to the same user
        if (assigneeIdToSend !== null && assigneeIdToSend === currentTask.assigneeId) {
            console.log('[handleAssigneeChange] SKIPPED - Task is already assigned to this user');
            return;
        }
        
        console.log('[handleAssigneeChange] START - userId:', userId, 'assigneeIdToSend:', assigneeIdToSend, 'taskId:', currentTask.id);
        
        updateTaskMutation.mutate({
            id: currentTask.id,
            data: {
                assigneeId: assigneeIdToSend,  // Send null for unassigned, not empty string
            }
        }, {
            onSuccess: (updatedTask) => {
                console.log('[handleAssigneeChange] SUCCESS! Updated task:', updatedTask);
                console.log('[handleAssigneeChange] Updated assigneeId:', updatedTask?.assigneeId);
                onUpdate();
                showToast(assigneeIdToSend ? `Assigned to ${userName}` : 'Task unassigned');
            },
            onError: (error) => {
                console.error('[handleAssigneeChange] ERROR:', error);
                showToast("Failed to assign task", "error");
            }
        });
    };

    const handleLabelsChange = (labels: (string | number)[]) => {
        updateTaskMutation.mutate({
            id: currentTask.id,
            data: { labels: labels as string[] }
        }, {
            onSuccess: () => {
                onUpdate();
                showToast("Labels updated");
            },
            onError: () => {
                showToast("Failed to update labels", "error");
            }
        });
    };

    const handleDueDateChange = (dueDate: string) => {
        updateTaskMutation.mutate({
            id: currentTask.id,
            data: { dueDate: dueDate || null }
        }, {
            onSuccess: () => {
                onUpdate();
                showToast(dueDate ? "Due date updated" : "Due date removed");
            },
            onError: () => {
                showToast("Failed to update due date", "error");
            }
        });
    };

    // Build breadcrumb from task data
    const breadcrumb = {
        workspace: currentTask?.board?.project?.workspace?.name || "Workspace",
        project: currentTask?.board?.project?.name || "Project",
        board: currentTask?.board?.name || "Board",
        list: "List" // Lists don't have names in the current schema, use status as fallback
    };

    return {
        title,
        setTitle,
        titleError,
        description,
        setDescription,
        isEditingTitle,
        setIsEditingTitle,
        activity: activities,
        breadcrumb,
        newLabel,
        setNewLabel,
        showLabelInput,
        setShowLabelInput,
        toast,
        setToast,
        currentTask, // Export currentTask so components can use fresh data
        handleTitleBlur,
        handleDescriptionBlur,
        handleDelete,
        handleArchive,
        handlePriorityChange,
        handleStatusChange,
        handleAssigneeChange,
        handleLabelsChange,
        handleDueDateChange,
    };
}
