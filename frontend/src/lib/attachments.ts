import { Attachment, MAX_FILE_SIZE_FREE, MAX_FILE_SIZE_PRO, ALLOWED_FILE_TYPES } from "@/types/attachment";
import {
  getFromStorage,
  addToStorage,
  removeFromStorage,
  dispatchStorageEvent,
  getWorkspaceById,
} from "./storage";

const STORAGE_KEY = "attachments";

// Get all attachments
export function getAttachments(): Attachment[] {
  return getFromStorage<Attachment>(STORAGE_KEY);
}

// Get attachments by task
export function getAttachmentsByTask(taskId: string | number): Attachment[] {
  return getAttachments()
    .filter((attachment) => attachment.taskId === taskId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

// Get attachment by ID
export function getAttachmentById(id: string | number): Attachment | undefined {
  return getAttachments().find((attachment) => attachment.id === id);
}

// Create attachment
export function createAttachment(
  attachmentData: Omit<Attachment, "id" | "uploadedAt">,
): Attachment {
  const newAttachment: Attachment = {
    ...attachmentData,
    id: Date.now().toString(),
    uploadedAt: new Date().toISOString(),
  };

  addToStorage(STORAGE_KEY, newAttachment);

  return newAttachment;
}

// Delete attachment
export function deleteAttachment(id: string | number): void {
  removeFromStorage<Attachment>(STORAGE_KEY, id);
}

// Delete all attachments for a task
export function deleteAttachmentsByTask(taskId: string | number): void {
  const attachments = getAttachments();
  const filtered = attachments.filter((attachment) => attachment.taskId !== taskId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  dispatchStorageEvent(STORAGE_KEY);
}

// Validate file
export function validateFile(
  file: File,
  workspaceId: string | number,
): { isValid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "File type not allowed. Please upload images, documents, or archives.",
    };
  }

  // Check file size based on plan
  const workspace = getWorkspaceById(workspaceId);
  const maxSize = workspace?.plan === "pro" ? MAX_FILE_SIZE_PRO : MAX_FILE_SIZE_FREE;

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB limit for ${workspace?.plan || "free"} plan.`,
    };
  }

  return { isValid: true };
}

// Convert file to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Get total storage used by workspace
export function getWorkspaceStorageUsed(workspaceId: string | number): number {
  const attachments = getAttachments().filter(
    (attachment) => attachment.workspaceId === workspaceId,
  );
  return attachments.reduce((total, attachment) => total + attachment.fileSize, 0);
}
