import { getFromStorage, addToStorage } from "./storage";

export interface ActivityLog {
    id: string;
    taskId: string;
    userId: string;
    userName: string;
    action: string;
    timestamp: string;
    details?: string;
}

const ACTIVITY_LOG_KEY = "activityLogs";

export function getActivityLog(taskId: string): ActivityLog[] {
    const allLogs = getFromStorage<ActivityLog[]>(ACTIVITY_LOG_KEY) || [];
    return allLogs.filter(log => log.taskId === taskId);
}

export function addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
    const newLog: ActivityLog = {
        ...log,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
    };
    
    const allLogs = getFromStorage<ActivityLog[]>(ACTIVITY_LOG_KEY) || [];
    allLogs.push(newLog);
    addToStorage(ACTIVITY_LOG_KEY, allLogs);
    
    return newLog;
}

export function clearActivityLogs(taskId: string): void {
    const allLogs = getFromStorage<ActivityLog[]>(ACTIVITY_LOG_KEY) || [];
    const filteredLogs = allLogs.filter(log => log.taskId !== taskId);
    addToStorage(ACTIVITY_LOG_KEY, filteredLogs);
}
