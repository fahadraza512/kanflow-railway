export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "inProgress" | "inReview" | "done";

export interface User {
    id: string | number;
    name: string;
    email: string;
    role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "VIEWER";
    avatar?: string;
}

export interface Workspace {
    id: string | number;
    name: string;
    description?: string;
    createdBy: string;
    plan: "free" | "pro";
    createdAt: string;
}

export interface Project {
    id: string | number;
    workspaceId: string | number;
    name: string;
    description?: string;
    createdBy: string;
    createdAt: string;
}

export interface Board {
    id: string | number;
    projectId: string | number;
    workspaceId: string | number;
    name: string;
    coverColor?: string;
    archived?: boolean;
    position?: number;
    createdBy: string;
    createdAt: string;
    updatedAt?: string;
}

export interface List {
    id: string | number;
    boardId: string | number;
    name: string;
    position: number;
    status?: string | null;
    createdAt: string;
}

export interface Task {
    id: string | number;
    listId: string | number;
    boardId: string | number;
    projectId: string | number;
    workspaceId: string | number;
    title: string;
    description?: string;
    assignedTo: string | number | null;
    assignedToName: string | null;
    labels: string[];
    priority: Priority;
    dueDate: string | null;
    position: number;
    status: TaskStatus;
    archived?: boolean;
    customFields?: { fieldId: string | number; value: any }[];
    createdBy: string | number;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string | number;
    taskId: string | number;
    userId: string | number;
    userName: string;
    userAvatar?: string;
    text: string;
    mentions: (string | number)[];
    createdAt: string;
}

export interface ActivityLog {
    id: string | number;
    taskId: string | number;
    userId: string | number;
    userName: string;
    userAvatar?: string;
    action: "created" | "moved" | "assigned" | "commented" | "updated" | "completed" | "archived" | "restored";
    detail: string;
    createdAt: string;
}

export interface Notification {
    id: string | number;
    userId: string | number;
    type: "assignment" | "mention" | "deadline" | "comment";
    message: string;
    taskId: string | number;
    isRead: boolean;
    createdAt: string;
}
