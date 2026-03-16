export interface Attachment {
  id: string | number;
  taskId: string | number;
  workspaceId: string | number;
  fileName: string;
  fileSize: number; // bytes
  fileType: string; // mime type
  fileUrl: string; // base64 or URL
  uploadedBy: string | number; // user ID
  uploadedByName: string;
  uploadedAt: string;
}

export const MAX_FILE_SIZE_FREE = 5 * 1024 * 1024; // 5MB for free plan
export const MAX_FILE_SIZE_PRO = 50 * 1024 * 1024; // 50MB for pro plan

export const ALLOWED_FILE_TYPES = [
  // Images
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Text
  "text/plain",
  "text/csv",
  // Archives
  "application/zip",
  "application/x-rar-compressed",
];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

export function isImageFile(fileType: string): boolean {
  return fileType.startsWith("image/");
}

export function isPreviewableFile(fileType: string): boolean {
  return fileType.startsWith("image/") || fileType === "application/pdf";
}
