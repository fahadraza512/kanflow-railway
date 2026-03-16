import { TimeEntry } from "@/types/timeTracking";
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
  dispatchStorageEvent,
} from "./storage";

const STORAGE_KEY = "timeEntries";

// Get all time entries
export function getTimeEntries(): TimeEntry[] {
  return getFromStorage<TimeEntry>(STORAGE_KEY).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// Get time entries by task
export function getTimeEntriesByTask(taskId: string | number): TimeEntry[] {
  return getTimeEntries().filter((entry) => entry.taskId === taskId);
}

// Get active time entry for task
export function getActiveTimeEntry(taskId: string | number): TimeEntry | null {
  const entries = getTimeEntriesByTask(taskId);
  return entries.find((entry) => !entry.endTime) || null;
}

// Get total tracked time for task
export function getTotalTrackedTime(taskId: string | number): number {
  const entries = getTimeEntriesByTask(taskId);
  return entries.reduce((total, entry) => total + entry.duration, 0);
}

// Start time tracking
export function startTimeTracking(
  taskId: string | number,
  userId: string | number,
  userName: string,
  workspaceId: string | number,
  description?: string,
): TimeEntry {
  // Check if already tracking
  const active = getActiveTimeEntry(taskId);
  if (active) {
    return active;
  }

  const newEntry: TimeEntry = {
    id: Date.now().toString(),
    taskId,
    userId,
    userName,
    workspaceId,
    startTime: new Date().toISOString(),
    duration: 0,
    description,
    createdAt: new Date().toISOString(),
  };

  saveToStorage(STORAGE_KEY, newEntry);
  dispatchStorageEvent(STORAGE_KEY);

  return newEntry;
}

// Stop time tracking
export function stopTimeTracking(entryId: string | number): TimeEntry | null {
  const entries = getTimeEntries();
  const index = entries.findIndex((entry) => entry.id === entryId);

  if (index === -1) return null;

  const entry = entries[index];
  const endTime = new Date().toISOString();
  const duration = Math.floor(
    (new Date(endTime).getTime() - new Date(entry.startTime).getTime()) / 1000,
  );

  const updatedEntry = {
    ...entry,
    endTime,
    duration,
  };

  entries[index] = updatedEntry;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  dispatchStorageEvent(STORAGE_KEY);

  return updatedEntry;
}

// Add manual time entry
export function addManualTimeEntry(
  entryData: Omit<TimeEntry, "id" | "createdAt">,
): TimeEntry {
  const newEntry: TimeEntry = {
    ...entryData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  saveToStorage(STORAGE_KEY, newEntry);
  dispatchStorageEvent(STORAGE_KEY);

  return newEntry;
}

// Delete time entry
export function deleteTimeEntry(id: string | number): void {
  removeFromStorage<TimeEntry>(STORAGE_KEY, id);
  dispatchStorageEvent(STORAGE_KEY);
}

// Update time entry
export function updateTimeEntry(
  id: string | number,
  updates: Partial<Omit<TimeEntry, "id" | "taskId" | "userId" | "workspaceId" | "createdAt">>,
): TimeEntry | null {
  const entries = getTimeEntries();
  const index = entries.findIndex((entry) => entry.id === id);

  if (index === -1) return null;

  const updatedEntry = { ...entries[index], ...updates };
  entries[index] = updatedEntry;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  dispatchStorageEvent(STORAGE_KEY);

  return updatedEntry;
}
