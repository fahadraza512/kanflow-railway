import { Label } from "@/types/label";
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
  dispatchStorageEvent,
} from "./storage";

const STORAGE_KEY = "labels";

// Get all labels
export function getLabels(): Label[] {
  return getFromStorage<Label>(STORAGE_KEY);
}

// Get labels by workspace
export function getLabelsByWorkspace(
  workspaceId: string | number,
): Label[] {
  return getLabels().filter((label) => label.workspaceId === workspaceId);
}

// Get label by ID
export function getLabelById(id: string | number): Label | undefined {
  return getLabels().find((label) => label.id === id);
}

// Create label
export function createLabel(
  labelData: Omit<Label, "id" | "createdAt">,
): Label {
  const newLabel: Label = {
    ...labelData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  saveToStorage(STORAGE_KEY, newLabel);
  dispatchStorageEvent(STORAGE_KEY);

  return newLabel;
}

// Update label
export function updateLabel(
  id: string | number,
  updates: Partial<Omit<Label, "id" | "workspaceId" | "createdAt">>,
): Label | null {
  const labels = getLabels();
  const index = labels.findIndex((label) => label.id === id);

  if (index === -1) return null;

  const updatedLabel = { ...labels[index], ...updates };
  labels[index] = updatedLabel;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
  dispatchStorageEvent(STORAGE_KEY);

  return updatedLabel;
}

// Delete label
export function deleteLabel(id: string | number): void {
  removeFromStorage<Label>(STORAGE_KEY, id);
  dispatchStorageEvent(STORAGE_KEY);
}

// Check if label name exists in workspace
export function labelNameExists(
  workspaceId: string | number,
  name: string,
  excludeId?: string | number,
): boolean {
  return getLabelsByWorkspace(workspaceId).some(
    (label) =>
      label.name.toLowerCase() === name.toLowerCase() &&
      label.id !== excludeId,
  );
}
