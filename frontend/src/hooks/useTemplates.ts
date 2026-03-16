import { useState, useEffect, useCallback } from "react";
import { TaskTemplate } from "@/types/template";
import {
  getTemplatesByWorkspace,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  templateNameExists,
} from "@/lib/templates";
import { getActiveWorkspace } from "@/lib/storage";
import { useAuthStore } from "@/store/useAuthStore";

export function useTemplates() {
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = useCallback(() => {
    const workspaceId = getActiveWorkspace();
    if (!workspaceId) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    const workspaceTemplates = getTemplatesByWorkspace(workspaceId);
    setTemplates(workspaceTemplates);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTemplates();

    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === "taskTemplates") {
        loadTemplates();
      }
    };

    window.addEventListener("storage-change", handleStorageChange);
    return () =>
      window.removeEventListener("storage-change", handleStorageChange);
  }, [loadTemplates]);

  const addTemplate = useCallback(
    (templateData: Omit<TaskTemplate, "id" | "workspaceId" | "createdBy" | "createdAt">) => {
      const workspaceId = getActiveWorkspace();
      if (!workspaceId || !user) return null;

      if (templateNameExists(workspaceId, templateData.name)) {
        throw new Error("Template with this name already exists");
      }

      const newTemplate = createTemplate({
        ...templateData,
        workspaceId,
        createdBy: user.id,
      });

      return newTemplate;
    },
    [user],
  );

  const editTemplate = useCallback(
    (
      id: string | number,
      updates: Partial<Omit<TaskTemplate, "id" | "workspaceId" | "createdBy" | "createdAt">>,
    ) => {
      const workspaceId = getActiveWorkspace();
      if (!workspaceId) return null;

      if (updates.name && templateNameExists(workspaceId, updates.name, id)) {
        throw new Error("Template with this name already exists");
      }

      return updateTemplate(id, updates);
    },
    [],
  );

  const removeTemplate = useCallback((id: string | number) => {
    deleteTemplate(id);
  }, []);

  return {
    templates,
    loading,
    addTemplate,
    editTemplate,
    removeTemplate,
    refresh: loadTemplates,
  };
}
