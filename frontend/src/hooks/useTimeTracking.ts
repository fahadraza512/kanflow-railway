import { useState, useEffect, useCallback } from "react";
import { TimeEntry, formatDuration } from "@/types/timeTracking";
import {
  getTimeEntriesByTask,
  getActiveTimeEntry,
  getTotalTrackedTime,
  startTimeTracking,
  stopTimeTracking,
  addManualTimeEntry,
  deleteTimeEntry,
} from "@/lib/timeTracking";
import { useAuthStore } from "@/store/useAuthStore";
import { getActiveWorkspace } from "@/lib/storage";

export function useTimeTracking(taskId: string | number) {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadTimeEntries = useCallback(() => {
    const taskEntries = getTimeEntriesByTask(taskId);
    const active = getActiveTimeEntry(taskId);
    const total = getTotalTrackedTime(taskId);

    setEntries(taskEntries);
    setActiveEntry(active);
    setTotalTime(total);
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    loadTimeEntries();

    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === "timeEntries") {
        loadTimeEntries();
      }
    };

    window.addEventListener("storage-change", handleStorageChange);
    return () =>
      window.removeEventListener("storage-change", handleStorageChange);
  }, [loadTimeEntries]);

  // Update current duration every second when tracking
  useEffect(() => {
    if (!activeEntry) {
      setCurrentDuration(0);
      return;
    }

    const updateDuration = () => {
      const elapsed = Math.floor(
        (Date.now() - new Date(activeEntry.startTime).getTime()) / 1000,
      );
      setCurrentDuration(elapsed);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [activeEntry]);

  const startTracking = useCallback(
    (description?: string) => {
      if (!user) return null;

      const workspaceId = getActiveWorkspace();
      if (!workspaceId) return null;

      const entry = startTimeTracking(
        taskId,
        user.id,
        user.name,
        workspaceId,
        description,
      );

      return entry;
    },
    [taskId, user],
  );

  const stopTracking = useCallback(() => {
    if (!activeEntry) return null;
    return stopTimeTracking(activeEntry.id);
  }, [activeEntry]);

  const addManualEntry = useCallback(
    (duration: number, description?: string) => {
      if (!user) return null;

      const workspaceId = getActiveWorkspace();
      if (!workspaceId) return null;

      const now = new Date();
      const startTime = new Date(now.getTime() - duration * 1000).toISOString();

      return addManualTimeEntry({
        taskId,
        userId: user.id,
        userName: user.name,
        workspaceId,
        startTime,
        endTime: now.toISOString(),
        duration,
        description,
      });
    },
    [taskId, user],
  );

  const removeEntry = useCallback((id: string | number) => {
    deleteTimeEntry(id);
  }, []);

  return {
    entries,
    activeEntry,
    totalTime,
    currentDuration,
    loading,
    isTracking: !!activeEntry,
    formattedTotal: formatDuration(totalTime),
    formattedCurrent: formatDuration(currentDuration),
    startTracking,
    stopTracking,
    addManualEntry,
    removeEntry,
    refresh: loadTimeEntries,
  };
}
