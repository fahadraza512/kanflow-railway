import { useState, useEffect, useCallback } from "react";
import { Subtask, SubtaskProgress } from "@/types/subtask";
import {
  getSubtasksByTask,
  createSubtask,
  updateSubtask,
  toggleSubtaskCompletion,
  deleteSubtask,
  reorderSubtasks,
  calculateSubtaskProgress,
} from "@/lib/subtasks";

export function useSubtasks(taskId: string | number) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [progress, setProgress] = useState<SubtaskProgress>({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadSubtasks = useCallback(() => {
    const taskSubtasks = getSubtasksByTask(taskId);
    const taskProgress = calculateSubtaskProgress(taskId);
    setSubtasks(taskSubtasks);
    setProgress(taskProgress);
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    loadSubtasks();

    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === "subtasks") {
        loadSubtasks();
      }
    };

    window.addEventListener("storage-change", handleStorageChange);
    return () =>
      window.removeEventListener("storage-change", handleStorageChange);
  }, [loadSubtasks]);

  const addSubtask = useCallback(
    (title: string) => {
      if (!title.trim()) return null;

      const newSubtask = createSubtask({
        taskId,
        title: title.trim(),
        completed: false,
      });

      return newSubtask;
    },
    [taskId],
  );

  const editSubtask = useCallback((id: string | number, title: string) => {
    if (!title.trim()) return null;
    return updateSubtask(id, { title: title.trim() });
  }, []);

  const toggleSubtask = useCallback((id: string | number) => {
    return toggleSubtaskCompletion(id);
  }, []);

  const removeSubtask = useCallback((id: string | number) => {
    deleteSubtask(id);
  }, []);

  const reorder = useCallback(
    (subtaskIds: (string | number)[]) => {
      reorderSubtasks(taskId, subtaskIds);
    },
    [taskId],
  );

  return {
    subtasks,
    progress,
    loading,
    addSubtask,
    editSubtask,
    toggleSubtask,
    removeSubtask,
    reorder,
    refresh: loadSubtasks,
  };
}
