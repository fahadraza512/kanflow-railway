import { useState, useEffect, useCallback } from "react";
import { TaskDependency, DependencyType } from "@/types/dependency";
import {
  getDependenciesForTask,
  createDependency,
  deleteDependency,
  canCompleteTask,
  hasCircularDependency,
} from "@/lib/dependencies";

export function useDependencies(taskId: string | number) {
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDependencies = useCallback(() => {
    const taskDeps = getDependenciesForTask(taskId);
    setDependencies(taskDeps);
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    loadDependencies();

    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === "taskDependencies") {
        loadDependencies();
      }
    };

    window.addEventListener("storage-change", handleStorageChange);
    return () =>
      window.removeEventListener("storage-change", handleStorageChange);
  }, [loadDependencies]);

  const addDependency = useCallback(
    (dependsOnTaskId: string | number, type: DependencyType) => {
      setError(null);

      // Check for circular dependency
      if (hasCircularDependency(taskId, dependsOnTaskId)) {
        setError("Cannot create circular dependency");
        return null;
      }

      // Check if trying to depend on itself
      if (taskId === dependsOnTaskId) {
        setError("Task cannot depend on itself");
        return null;
      }

      const newDep = createDependency(taskId, dependsOnTaskId, type);
      return newDep;
    },
    [taskId],
  );

  const removeDependency = useCallback((id: string | number) => {
    deleteDependency(id);
  }, []);

  const checkCanComplete = useCallback(() => {
    return canCompleteTask(taskId);
  }, [taskId]);

  const getBlockingTasks = useCallback(() => {
    return dependencies.filter(
      (dep) => dep.taskId === taskId && dep.type === "blocked_by",
    );
  }, [dependencies, taskId]);

  const getBlockedTasks = useCallback(() => {
    return dependencies.filter(
      (dep) => dep.dependsOnTaskId === taskId && dep.type === "blocks",
    );
  }, [dependencies, taskId]);

  const getRelatedTasks = useCallback(() => {
    return dependencies.filter(
      (dep) =>
        (dep.taskId === taskId || dep.dependsOnTaskId === taskId) &&
        dep.type === "relates_to",
    );
  }, [dependencies, taskId]);

  return {
    dependencies,
    loading,
    error,
    addDependency,
    removeDependency,
    checkCanComplete,
    getBlockingTasks,
    getBlockedTasks,
    getRelatedTasks,
    refresh: loadDependencies,
  };
}
