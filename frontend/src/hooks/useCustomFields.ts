import { useState, useEffect, useCallback } from "react";
import { CustomField } from "@/types/customField";
import {
  getCustomFieldsByWorkspace,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  fieldNameExists,
} from "@/lib/customFields";
import { getActiveWorkspace } from "@/lib/storage";

export function useCustomFields() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFields = useCallback(() => {
    const workspaceId = getActiveWorkspace();
    if (!workspaceId) {
      setFields([]);
      setLoading(false);
      return;
    }

    const workspaceFields = getCustomFieldsByWorkspace(workspaceId);
    setFields(workspaceFields);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFields();

    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail === "customFields") {
        loadFields();
      }
    };

    window.addEventListener("storage-change", handleStorageChange);
    return () =>
      window.removeEventListener("storage-change", handleStorageChange);
  }, [loadFields]);

  const addField = useCallback(
    (fieldData: Omit<CustomField, "id" | "workspaceId" | "createdAt">) => {
      const workspaceId = getActiveWorkspace();
      if (!workspaceId) return null;

      if (fieldNameExists(workspaceId, fieldData.name)) {
        throw new Error("Field with this name already exists");
      }

      const newField = createCustomField({
        ...fieldData,
        workspaceId,
      });

      return newField;
    },
    [],
  );

  const editField = useCallback(
    (
      id: string | number,
      updates: Partial<Omit<CustomField, "id" | "workspaceId" | "createdAt">>,
    ) => {
      const workspaceId = getActiveWorkspace();
      if (!workspaceId) return null;

      if (updates.name && fieldNameExists(workspaceId, updates.name, id)) {
        throw new Error("Field with this name already exists");
      }

      return updateCustomField(id, updates);
    },
    [],
  );

  const removeField = useCallback((id: string | number) => {
    deleteCustomField(id);
  }, []);

  return {
    fields,
    loading,
    addField,
    editField,
    removeField,
    refresh: loadFields,
  };
}
