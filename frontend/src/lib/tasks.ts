import { getFromStorage, addToStorage, updateInStorage, removeFromStorage, getUsers } from "./storage";
import { Task, List, Board, Project, TaskStatus, Workspace, Comment as KanbanComment } from "@/types/kanban";
import { addActivityLog, getActivityLog } from "./activityLog";
import { createNotification } from "./notifications";

export { getActivityLog };

const TASKS_KEY = "tasks";
const LISTS_KEY = "lists";
const BOARDS_KEY = "boards";
const PROJECTS_KEY = "projects";

// --- Projects ---

export const getWorkspaces = () => getFromStorage<Workspace>("workspaces");
export const getWorkspace = (id: string | number) => getWorkspaces().find(w => w.id === id);

export const getProjects = (workspaceId: string) =>
    getFromStorage<Project>(PROJECTS_KEY).filter(p => p.workspaceId === workspaceId);

export const getProject = (id: string | number) => getFromStorage<Project>(PROJECTS_KEY).find(p => p.id === id);

export const createProject = (projectData: Omit<Project, "id" | "createdAt">) => {
    const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
    };
    addToStorage(PROJECTS_KEY, newProject);
    return newProject;
};

// --- Tasks ---

export const getTasks = (boardId: string | number) =>
    getFromStorage<Task>(TASKS_KEY).filter(t => t.boardId === boardId);

export const getTask = (id: string | number) => 
    getFromStorage<Task>(TASKS_KEY).find(t => t.id === id);

export const createTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    addToStorage(TASKS_KEY, newTask);

    addActivityLog({
        taskId: newTask.id,
        action: "created",
        detail: "created this task"
    });

    if (newTask.assignedTo) {
        const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("currentUser") || "{}") : {};
        createNotification({
            userId: newTask.assignedTo,
            type: "assignment",
            message: `You were assigned to: ${newTask.title}`,
            taskId: newTask.id,
            taskTitle: newTask.title,
            senderName: currentUser.name || "Team Member"
        });
    }

    return newTask;
};

export const updateTask = (taskId: string | number, updates: Partial<Task>) => {
    updateInStorage(TASKS_KEY, taskId, { ...updates, updatedAt: new Date().toISOString() });
};

export const moveTask = (taskId: string | number, newListId: string | number, oldListName: string, newListName: string) => {
    // Map list names to statuses as per requirements
    let status: TaskStatus = "todo";
    if (newListName === "In Progress") status = "inProgress";
    else if (newListName === "In Review") status = "inReview";
    else if (newListName === "Done") status = "done";

    updateTask(taskId, { listId: newListId, status });

    addActivityLog({
        taskId,
        action: "moved",
        detail: `Moved task from ${oldListName} to ${newListName}`
    });

    if (status === "done") {
        addActivityLog({
            taskId,
            action: "completed",
            detail: "marked this task as complete"
        });

        const task = getFromStorage<Task>(TASKS_KEY).find(t => t.id === taskId);
        if (task) {
            createNotification({
                userId: task.createdBy,
                type: "deadline",
                message: `Task completed: ${task.title}`,
                taskId
            });
        }
    }

    if (status === "inProgress") {
        const task = getFromStorage<Task>(TASKS_KEY).find(t => t.id === taskId);
        if (task && task.assignedTo) {
            createNotification({
                userId: task.assignedTo,
                type: "assignment",
                message: `Task moved to In Progress: ${task.title}`,
                taskId
            });
        }
    }
};

export const deleteProject = (projectId: string | number) => removeFromStorage(PROJECTS_KEY, projectId);
export const deleteBoard = (boardId: string | number) => removeFromStorage(BOARDS_KEY, boardId);
export const deleteTask = (taskId: string | number) => removeFromStorage(TASKS_KEY, taskId);

// --- Boards & Lists ---

export const getBoards = (projectId: string | number) =>
    getFromStorage<Board>(BOARDS_KEY).filter(b => b.projectId === projectId);

export const getLists = (boardId: string | number) =>
    getFromStorage<List>(LISTS_KEY).filter(l => l.boardId === boardId).sort((a, b) => a.position - b.position);

export const updateBoard = (boardId: string | number, updates: Partial<Board>) => {
    updateInStorage(BOARDS_KEY, boardId, updates);
};

export const updateList = (listId: string | number, updates: Partial<List>) => {
    updateInStorage(LISTS_KEY, listId, updates);
};

export const deleteList = (listId: string | number) => {
    removeFromStorage(LISTS_KEY, listId);
    // Cleanup tasks in that list
    const tasks = getFromStorage<Task>(TASKS_KEY).filter(t => t.listId !== listId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

// --- Comments ---
const COMMENTS_KEY = "comments";

export const getComments = (taskId: string | number) =>
    getFromStorage<KanbanComment>(COMMENTS_KEY).filter(c => c.taskId === taskId);

export const addComment = (taskId: string | number, text: string) => {
    const authRaw = typeof window !== "undefined" ? localStorage.getItem("auth-storage") : null;
    let user = { id: "unknown", name: "System" };
    if (authRaw) {
        try {
            const parsed = JSON.parse(authRaw);
            if (parsed.state?.user) {
                user = parsed.state.user;
            }
        } catch { }
    }

    const id = Date.now().toString();

    // Simple @mention detection
    const mentions = text.match(/@(\w+)/g)?.map(m => m.substring(1)) || [];
    const allUsers = getUsers();
    const mentionUserIds = allUsers.filter(u => mentions.includes(u.name)).map(u => u.id);

    const newComment: KanbanComment = {
        id,
        taskId,
        userId: user.id,
        userName: user.name,
        text,
        mentions: mentionUserIds,
        createdAt: new Date().toISOString()
    };

    addToStorage(COMMENTS_KEY, newComment);

    addActivityLog({
        taskId,
        action: "commented",
        detail: `added a comment: "${text.substring(0, 30)}${text.length > 30 ? "..." : ""}"`
    });

    // Get task details for notifications
    const task = getFromStorage<Task>(TASKS_KEY).find(t => t.id === taskId);
    const taskTitle = task?.title || "Task";

    // Handle Mention Notifications
    mentionUserIds.forEach(targetId => {
        createNotification({
            userId: targetId,
            type: "mention",
            message: `${user.name} mentioned you in a comment`,
            taskId,
            taskTitle,
            senderName: user.name,
            commentText: text
        });
    });

    return newComment;
};

export const deleteComment = (commentId: string | number) => removeFromStorage(COMMENTS_KEY, commentId);

export const createBoardWithDefaultLists = (boardData: Omit<Board, "id" | "createdAt">) => {
    const id = Date.now().toString();
    const newBoard = { ...boardData, id, createdAt: new Date().toISOString() };
    addToStorage(BOARDS_KEY, newBoard);

    const defaultLists = ["Backlog", "In Progress", "In Review", "Done"];
    defaultLists.forEach((name, index) => {
        addToStorage(LISTS_KEY, {
            id: `${id}-list-${index}`,
            boardId: id,
            name,
            position: index,
            createdAt: new Date().toISOString()
        });
    });

    return newBoard;
};
