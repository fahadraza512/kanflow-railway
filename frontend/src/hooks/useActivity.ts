import { useState, useEffect, useCallback } from "react";
import { Activity, ActivityType } from "@/types/activity";
import {
  getActivitiesByWorkspace,
  getActivitiesByProject,
  getActivitiesByTask,
} from "@/lib/activity";
import { getActiveWorkspace } from "@/lib/storage";

interface UseActivityOptions {
  projectId?: string | number;
  taskId?: string | number;
  limit?: number;
  filterType?: ActivityType;
}

export function useActivity(options: UseActivityOptions = {}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ActivityType | "all">("all");

  const loadActivities = useCallback(() => {
    let loadedActivities: Activity[] = [];

    if (options.taskId) {
      loadedActivities = getActivitiesByTask(options.taskId);
    } else if (options.projectId) {
      loadedActivities = getActivitiesByProject(options.projectId, options.limit);
    } else {
      const workspaceId = getActiveWorkspace();
      if (workspaceId) {
        loadedActivities = getActivitiesByWorkspace(workspaceId, options.limit);
      }
    }

    setActivities(loadedActivities);
    setLoading(false);
  }, [options.taskId, options.projectId, options.limit]);

  useEffect(() => {
    loadActivities();

    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === "activities") {
        loadActivities();
      }
    };

    window.addEventListener("storage-change", handleStorageChange);
    return () =>
      window.removeEventListener("storage-change", handleStorageChange);
  }, [loadActivities]);

  useEffect(() => {
    if (filterType === "all") {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter((a) => a.type === filterType));
    }
  }, [activities, filterType]);

  return {
    activities: filteredActivities,
    loading,
    filterType,
    setFilterType,
    refresh: loadActivities,
  };
}
