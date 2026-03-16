import { TaskTemplate } from "@/types/template";
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
  dispatchStorageEvent,
} from "./storage";

const STORAGE_KEY = "taskTemplates";

// Get all templates
export function getTemplates(): TaskTemplate[] {
  return getFromStorage<TaskTemplate>(STORAGE_KEY);
}

// Get templates by workspace
export function getTemplatesByWorkspace(
  workspaceId: string | number,
): TaskTemplate[] {
  return getTemplates().filter((template) => template.workspaceId === workspaceId);
}

// Get template by ID
export function getTemplateById(id: string | number): TaskTemplate | undefined {
  return getTemplates().find((template) => template.id === id);
}

// Create template
export function createTemplate(
  templateData: Omit<TaskTemplate, "id" | "createdAt">,
): TaskTemplate {
  const newTemplate: TaskTemplate = {
    ...templateData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  saveToStorage(STORAGE_KEY, newTemplate);
  dispatchStorageEvent(STORAGE_KEY);

  return newTemplate;
}

// Update template
export function updateTemplate(
  id: string | number,
  updates: Partial<Omit<TaskTemplate, "id" | "workspaceId" | "createdAt">>,
): TaskTemplate | null {
  const templates = getTemplates();
  const index = templates.findIndex((template) => template.id === id);

  if (index === -1) return null;

  const updatedTemplate = { ...templates[index], ...updates };
  templates[index] = updatedTemplate;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  dispatchStorageEvent(STORAGE_KEY);

  return updatedTemplate;
}

// Delete template
export function deleteTemplate(id: string | number): void {
  removeFromStorage<TaskTemplate>(STORAGE_KEY, id);
  dispatchStorageEvent(STORAGE_KEY);
}

// Check if template name exists
export function templateNameExists(
  workspaceId: string | number,
  name: string,
  excludeId?: string | number,
): boolean {
  return getTemplatesByWorkspace(workspaceId).some(
    (template) =>
      template.name.toLowerCase() === name.toLowerCase() &&
      template.id !== excludeId,
  );
}
