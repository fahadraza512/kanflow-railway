import { CustomField, TaskCustomFieldValue } from "@/types/customField";
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
  dispatchStorageEvent,
} from "./storage";

const STORAGE_KEY = "customFields";

// Get all custom fields
export function getCustomFields(): CustomField[] {
  const result = getFromStorage<CustomField>(STORAGE_KEY);
  // Ensure we always return an array
  return Array.isArray(result) ? result : [];
}

// Get custom fields by workspace
export function getCustomFieldsByWorkspace(
  workspaceId: string | number,
): CustomField[] {
  const fields = getCustomFields();
  return fields.filter((field) => field.workspaceId === workspaceId);
}

// Get custom field by ID
export function getCustomFieldById(
  id: string | number,
): CustomField | undefined {
  return getCustomFields().find((field) => field.id === id);
}

// Create custom field
export function createCustomField(
  fieldData: Omit<CustomField, "id" | "createdAt">,
): CustomField {
  const newField: CustomField = {
    ...fieldData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  const fields = getCustomFields();
  fields.push(newField);
  saveToStorage(STORAGE_KEY, fields);
  dispatchStorageEvent(STORAGE_KEY);

  return newField;
}

// Update custom field
export function updateCustomField(
  id: string | number,
  updates: Partial<Omit<CustomField, "id" | "workspaceId" | "createdAt">>,
): CustomField | null {
  const fields = getCustomFields();
  const index = fields.findIndex((field) => field.id === id);

  if (index === -1) return null;

  const updatedField = { ...fields[index], ...updates };
  fields[index] = updatedField;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  dispatchStorageEvent(STORAGE_KEY);

  return updatedField;
}

// Delete custom field
export function deleteCustomField(id: string | number): void {
  removeFromStorage<CustomField>(STORAGE_KEY, id);
  dispatchStorageEvent(STORAGE_KEY);
}

// Check if field name exists in workspace
export function fieldNameExists(
  workspaceId: string | number,
  name: string,
  excludeId?: string | number,
): boolean {
  return getCustomFieldsByWorkspace(workspaceId).some(
    (field) =>
      field.name.toLowerCase() === name.toLowerCase() &&
      field.id !== excludeId,
  );
}

// Validate field value
export function validateFieldValue(
  field: CustomField,
  value: any,
): { isValid: boolean; error?: string } {
  if (field.required && (value === null || value === undefined || value === "")) {
    return { isValid: false, error: `${field.name} is required` };
  }

  if (!value && !field.required) {
    return { isValid: true };
  }

  switch (field.type) {
    case "number":
      if (isNaN(Number(value))) {
        return { isValid: false, error: `${field.name} must be a number` };
      }
      break;
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, error: `${field.name} must be a valid email` };
      }
      break;
    case "url":
      try {
        new URL(value);
      } catch {
        return { isValid: false, error: `${field.name} must be a valid URL` };
      }
      break;
    case "select":
      if (!field.options?.includes(value)) {
        return { isValid: false, error: `Invalid option for ${field.name}` };
      }
      break;
    case "multiselect":
      if (!Array.isArray(value) || !value.every((v) => field.options?.includes(v))) {
        return { isValid: false, error: `Invalid options for ${field.name}` };
      }
      break;
  }

  return { isValid: true };
}
