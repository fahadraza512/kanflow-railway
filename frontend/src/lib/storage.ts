/**
 * Generic localStorage helper for array-based data structures
 * 
 * ⚠️ DEPRECATION WARNING:
 * These data operation functions are being phased out in favor of API-based operations.
 * 
 * CURRENT STATUS:
 * - ✅ Authentication: Use API (useAuth hooks)
 * - ✅ Workspaces: Use API (useWorkspaces hooks)
 * - ✅ Projects: Use API (useProjects hooks)
 * - ✅ Boards: Use API (useBoards hooks)
 * - ✅ Tasks: Use API (useTasks hooks)
 * - ✅ Comments: Use API (useComments hooks)
 * - ✅ Notifications: Use API (useNotifications hooks)
 * - ✅ Analytics: Use API (useAnalytics hooks)
 * - ✅ Billing: Use API (useBilling hooks)
 * - ✅ Preferences: Use API (usePreferences hooks)
 * 
 * These functions remain for:
 * 1. Session persistence (activeWorkspaceId, currentUser token)
 * 2. Backward compatibility during migration
 * 3. Offline fallback (future PWA feature)
 * 
 * DO NOT use these for new features. Use React Query hooks instead.
 */

// Dispatch custom event when localStorage changes
export function dispatchStorageEvent(key: string) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key } }));
    }
}

export function getFromStorage<T>(key: string): T[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        // Ensure we always return an array
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveToStorage<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(data));
    dispatchStorageEvent(key);
}

export function addToStorage<T extends { id: string | number }>(key: string, item: T): void {
    const data = getFromStorage<T>(key);
    data.push(item);
    saveToStorage(key, data);
}

export function updateInStorage<T extends { id: string | number }>(key: string, id: string | number, updates: Partial<T>): void {
    const data = getFromStorage<T>(key);
    const index = data.findIndex((item) => item.id === id);
    if (index !== -1) {
        data[index] = { ...data[index], ...updates };
        saveToStorage(key, data);
    }
}

export function removeFromStorage<T extends { id: string | number }>(key: string, id: string | number): void {
    const data = getFromStorage<T>(key);
    const filtered = data.filter((item) => item.id !== id);
    saveToStorage(key, filtered);
}

// ===== USERS =====
export type UserType = { id: string | number; name: string; email: string; role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "VIEWER" };

export function getUsers(): UserType[] {
    return getFromStorage<UserType>("users");
}

export function getCurrentUser(): UserType | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
}

// ===== WORKSPACES =====
export interface Workspace {
    id: string | number;
    name: string;
    description?: string;
    createdBy: string | number;
    plan: "free" | "pro";
    subscriptionStatus?: "active" | "cancelled" | "expired";
    subscriptionCancelledAt?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    billingCycle?: "annual" | "monthly";
    members?: (string | number)[];
    icon?: string;
    createdAt: string;
}

export function getWorkspaces(): Workspace[] {
    return getFromStorage<Workspace>("workspaces");
}

export function getWorkspaceById(id: string | number): Workspace | null {
    const workspace = getWorkspaces().find(w => w.id === id) || null;
    
    // Migration: Add creator as member if members array doesn't exist
    if (workspace && !workspace.members) {
        workspace.members = [workspace.createdBy];
        updateWorkspace(workspace.id, { members: workspace.members });
    }
    
    return workspace;
}

export function saveWorkspace(workspace: Workspace): void {
    addToStorage("workspaces", workspace);
}

export function updateWorkspace(id: string | number, updates: Partial<Workspace>): void {
    updateInStorage<Workspace>("workspaces", id, updates);
}

export function deleteWorkspace(id: string | number): void {
    // Delete the workspace
    removeFromStorage<Workspace>("workspaces", id);

    // Delete all projects in this workspace
    const projects = getProjectsByWorkspace(id);
    projects.forEach(project => {
        deleteProject(project.id);
    });

    // Delete all archived projects in this workspace
    const archivedProjects = getArchivedProjectsByWorkspace(id);
    archivedProjects.forEach(project => {
        deleteProject(project.id);
    });

    // Clear active workspace if it was the deleted one
    const activeWs = getActiveWorkspace();
    if (activeWs === String(id)) {
        localStorage.removeItem("activeWorkspace");
    }
}


// ===== SUBSCRIPTION EVENTS =====
export interface SubscriptionEvent {
    id: string | number;
    workspaceId: string | number;
    eventType: "upgraded" | "cancelled" | "reactivated" | "expired" | "plan_changed";
    fromPlan?: "free" | "pro";
    toPlan?: "free" | "pro";
    billingCycle?: "annual" | "monthly";
    reason?: string;
    timestamp: string;
}

export function getSubscriptionEvents(): SubscriptionEvent[] {
    return getFromStorage<SubscriptionEvent>("subscriptionEvents");
}

export function getSubscriptionEventsByWorkspace(workspaceId: string | number): SubscriptionEvent[] {
    return getSubscriptionEvents().filter(event => event.workspaceId === workspaceId);
}

export function createSubscriptionEvent(event: SubscriptionEvent): void {
    addToStorage("subscriptionEvents", event);
}


// ===== INVOICES =====
export interface Invoice {
    id: string | number;
    workspaceId: string | number;
    invoiceNumber: string;
    date: string;
    amount: string;
    billingCycle: "annual" | "monthly";
    status: "paid" | "pending" | "failed";
    description: string;
    createdAt: string;
}

export function getInvoices(): Invoice[] {
    return getFromStorage<Invoice>("invoices");
}

export function getInvoicesByWorkspace(workspaceId: string | number): Invoice[] {
    return getInvoices().filter(inv => inv.workspaceId === workspaceId);
}

export function createInvoice(invoice: Invoice): void {
    addToStorage("invoices", invoice);
}


// ===== PROJECTS =====
export interface Project {
    id: string | number;
    workspaceId: string | number;
    name: string;
    description?: string;
    coverColor?: string;
    archived?: boolean;
    members?: (string | number)[];
    createdBy: string | number;
    createdAt: string;
    updatedAt?: string;
}

export function getProjects(): Project[] {
    return getFromStorage<Project>("projects");
}

export function getProjectsByWorkspace(workspaceId: string | number): Project[] {
    return getProjects().filter(p => p.workspaceId === workspaceId && !p.archived);
}

export function getArchivedProjectsByWorkspace(workspaceId: string | number): Project[] {
    return getProjects().filter(p => p.workspaceId === workspaceId && p.archived);
}

export function getProjectById(id: string | number): Project | null {
    return getProjects().find(p => p.id === id) || null;
}

export function saveProject(project: Project): void {
    addToStorage("projects", project);
}

export function updateProject(id: string | number, updates: Partial<Project>): void {
    updateInStorage<Project>("projects", id, { ...updates, updatedAt: new Date().toISOString() });
}

export function deleteProject(id: string | number): void {
    removeFromStorage<Project>("projects", id);
    
    // Also delete all boards in this project
    const boards = getBoardsByProject(id);
    boards.forEach(board => {
        removeFromStorage<Board>("boards", board.id);
        
        // Delete all lists in this board
        const lists = getListsByBoard(board.id);
        lists.forEach(list => {
            removeFromStorage<List>("lists", list.id);
        });
        
        // Delete all tasks in this board
        const tasks = getTasksByBoard(board.id);
        tasks.forEach(task => {
            removeFromStorage<Task>("tasks", task.id);
        });
    });
}

// ===== BOARDS =====
export interface Board {
    id: string | number;
    projectId: string | number;
    workspaceId: string | number;
    name: string;
    coverColor?: string;
    archived?: boolean;
    position?: number;
    createdBy: string | number;
    createdAt: string;
    updatedAt?: string;
}

export function getBoards(): Board[] {
    return getFromStorage<Board>("boards");
}

export function getBoardsByProject(projectId: string | number): Board[] {
    return getBoards()
        .filter(b => b.projectId === projectId && !b.archived)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
}

export function getArchivedBoardsByProject(projectId: string | number): Board[] {
    return getBoards().filter(b => b.projectId === projectId && b.archived);
}

export function getBoardById(id: string | number): Board | null {
    return getBoards().find(b => b.id === id) || null;
}

export function saveBoard(board: Board): void {
    addToStorage("boards", board);
}

export function updateBoard(id: string | number, updates: Partial<Board>): void {
    updateInStorage<Board>("boards", id, { ...updates, updatedAt: new Date().toISOString() });
}

export function deleteBoard(id: string | number): void {
    removeFromStorage<Board>("boards", id);
    
    // Delete all lists in this board
    const lists = getListsByBoard(id);
    lists.forEach(list => {
        removeFromStorage<List>("lists", list.id);
    });
    
    // Delete all tasks in this board
    const tasks = getTasksByBoard(id);
    tasks.forEach(task => {
        removeFromStorage<Task>("tasks", task.id);
    });
}

export function reorderBoards(projectId: string | number, boardIds: (string | number)[]): void {
    boardIds.forEach((boardId, index) => {
        updateBoard(boardId, { position: index });
    });
}

// ===== LISTS =====
export interface List {
    id: string | number;
    boardId: string | number;
    name: string;
    position: number;
    createdAt: string;
}

export function getLists(): List[] {
    return getFromStorage<List>("lists");
}

export function getListsByBoard(boardId: string | number): List[] {
    return getLists()
        .filter(l => l.boardId === boardId)
        .sort((a, b) => a.position - b.position);
}

export function getListById(id: string | number): List | null {
    return getLists().find(l => l.id === id) || null;
}

export function saveList(list: List): void {
    addToStorage("lists", list);
}

export function updateList(id: string | number, updates: Partial<List>): void {
    updateInStorage<List>("lists", id, updates);
}

export function deleteList(id: string | number): void {
    removeFromStorage<List>("lists", id);
    
    // Delete all tasks in this list
    const tasks = getTasksByList(id);
    tasks.forEach(task => {
        removeFromStorage<Task>("tasks", task.id);
    });
}

export function reorderLists(boardId: string | number, listIds: (string | number)[]): void {
    listIds.forEach((listId, index) => {
        updateList(listId, { position: index });
    });
}

// ===== TASKS =====
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
    priority: "low" | "medium" | "high" | "urgent";
    dueDate: string | null;
    position: number;
    status: "todo" | "inProgress" | "inReview" | "done";
    archived?: boolean;
    createdBy: string | number;
    createdAt: string;
    updatedAt: string;
}

export function getTasks(): Task[] {
    return getFromStorage<Task>("tasks");
}

export function getTasksByBoard(boardId: string | number): Task[] {
    return getTasks().filter(t => t.boardId === boardId && !t.archived);
}

export function getTasksByList(listId: string | number): Task[] {
    return getTasks()
        .filter(t => t.listId === listId && !t.archived)
        .sort((a, b) => a.position - b.position);
}

export function getArchivedTasksByBoard(boardId: string | number): Task[] {
    return getTasks().filter(t => t.boardId === boardId && t.archived);
}

export function getTaskById(id: string | number): Task | null {
    return getTasks().find(t => t.id === id) || null;
}

export function saveTask(task: Task): void {
    addToStorage("tasks", task);
}

export function updateTask(id: string | number, updates: Partial<Task>): void {
    const oldTask = getTaskById(id);
    updateInStorage<Task>("tasks", id, { ...updates, updatedAt: new Date().toISOString() });
    
    // Trigger notification if task is being assigned to someone
    if (updates.assignedTo && oldTask && updates.assignedTo !== oldTask.assignedTo) {
        const currentUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("currentUser") || "{}") : {};
        // Import dynamically to avoid circular dependency
        import("./notifications").then(({ createNotification }) => {
            createNotification({
                userId: updates.assignedTo!,
                type: "assignment",
                message: `You were assigned to: ${oldTask.title}`,
                taskId: id,
                taskTitle: oldTask.title,
                senderName: currentUser.name || "Team Member"
            });
        });
    }
}

export function deleteTask(id: string | number): void {
    removeFromStorage<Task>("tasks", id);
}

export function reorderTasks(listId: string | number, taskIds: (string | number)[]): void {
    taskIds.forEach((taskId, index) => {
        updateTask(taskId, { position: index });
    });
}

// ===== COMMENTS =====
export interface Comment {
    id: string | number;
    taskId: string | number;
    userId: string | number;
    userName: string;
    userAvatar: string | null;
    text: string;
    mentions: (string | number)[];
    createdAt: string;
}

export function getComments(): Comment[] {
    return getFromStorage<Comment>("comments");
}

export function getCommentsByTask(taskId: string | number): Comment[] {
    return getComments()
        .filter(c => c.taskId === taskId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveComment(comment: Comment): void {
    addToStorage("comments", comment);
}

export function updateComment(id: string | number, updates: Partial<Comment>): void {
    updateInStorage<Comment>("comments", id, updates);
}

export function deleteComment(id: string | number): void {
    removeFromStorage<Comment>("comments", id);
}

// ===== ACTIVITY LOG =====
export interface ActivityLog {
    id: string | number;
    taskId: string | number;
    userId: string | number;
    userName: string;
    action: "created" | "moved" | "assigned" | "commented" | "updated" | "completed";
    detail: string;
    createdAt: string;
}

export function getActivityLogs(): ActivityLog[] {
    return getFromStorage<ActivityLog>("activityLog");
}

export function getActivityLogsByTask(taskId: string | number): ActivityLog[] {
    return getActivityLogs()
        .filter(a => a.taskId === taskId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addActivityLog(log: ActivityLog): void {
    addToStorage("activityLog", log);
}

// ===== NOTIFICATIONS =====
export interface Notification {
    id: string | number;
    userId: string | number;
    type: "assignment" | "mention" | "deadline" | "comment";
    message: string;
    taskId: string | number;
    isRead: boolean;
    createdAt: string;
}

export function getNotifications(): Notification[] {
    return getFromStorage<Notification>("notifications");
}

export function getNotificationsByUser(userId: string | number): Notification[] {
    return getNotifications()
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUnreadNotificationsCount(userId: string | number): number {
    return getNotifications().filter(n => n.userId === userId && !n.isRead).length;
}

export function saveNotification(notification: Notification): void {
    addToStorage("notifications", notification);
}

export function markNotificationAsRead(id: string | number): void {
    updateInStorage<Notification>("notifications", id, { isRead: true });
}

export function markAllNotificationsAsRead(userId: string | number): void {
    const notifications = getNotifications();
    const updated = notifications.map(n =>
        n.userId === userId ? { ...n, isRead: true } : n
    );
    saveToStorage("notifications", updated);
}

// ===== ACTIVE STATE =====
export function setActiveWorkspace(workspaceId: string | number): void {
    localStorage.setItem("activeWorkspace", String(workspaceId));
    dispatchStorageEvent("activeWorkspace");
}

export function getActiveWorkspace(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("activeWorkspace");
}

export function setActiveProject(projectId: string | number): void {
    localStorage.setItem("activeProject", String(projectId));
    dispatchStorageEvent("activeProject");
}

export function getActiveProject(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("activeProject");
}

// ===== DEFAULT LISTS =====
export function createDefaultLists(boardId: string | number): void {
    const defaultLists = [
        { id: Date.now(), boardId, name: "Backlog", position: 0, createdAt: new Date().toISOString() },
        { id: Date.now() + 1, boardId, name: "In Progress", position: 1, createdAt: new Date().toISOString() },
        { id: Date.now() + 2, boardId, name: "In Review", position: 2, createdAt: new Date().toISOString() },
        { id: Date.now() + 3, boardId, name: "Done", position: 3, createdAt: new Date().toISOString() },
    ];
    const existing = getLists();
    saveToStorage("lists", [...existing, ...defaultLists]);
}
