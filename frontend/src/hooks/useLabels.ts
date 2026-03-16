import { useState, useEffect, useCallback } from "react";
import { Label } from "@/types/label";
import {
  getLabelsByWorkspace,
  createLabel,
  updateLabel,
  deleteLabel,
  labelNameExists,
} from "@/lib/labels";
import { getActiveWorkspace } from "@/lib/storage";

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLabels = useCallback(() => {
    const workspaceId = getActiveWorkspace();
    if (!workspaceId) {
      setLabels([]);
      setLoading(false);
      return;
    }

    const workspaceLabels = getLabelsByWorkspace(workspaceId);
    setLabels(workspaceLabels);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLabels();

    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === "labels") {
        loadLabels();
      }
    };

    window.addEventListener("storage-change", handleStorageChange);
    return () =>
      window.removeEventListener("storage-change", handleStorageChange);
  }, [loadLabels]);

  const addLabel = useCallback(
    (name: string, color: string) => {
      const workspaceId = getActiveWorkspace();
      if (!workspaceId) return null;

      if (labelNameExists(workspaceId, name)) {
        throw new Error("Label with this name already exists");
      }

      const newLabel = createLabel({
        workspaceId,
        name,
        color,
      });

      return newLabel;
    },
    [],
  );

  const editLabel = useCallback(
    (id: string | number, name: string, color: string) => {
      const workspaceId = getActiveWorkspace();
      if (!workspaceId) return null;

      if (labelNameExists(workspaceId, name, id)) {
        throw new Error("Label with this name already exists");
      }

      return updateLabel(id, { name, color });
    },
    [],
  );

  const removeLabel = useCallback((id: string | number) => {
    deleteLabel(id);
  }, []);

  return {
    labels,
    loading,
    addLabel,
    editLabel,
    removeLabel,
    refresh: loadLabels,
  };
}
