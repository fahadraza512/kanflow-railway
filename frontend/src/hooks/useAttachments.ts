import { useState, useEffect, useCallback } from "react";
import { Attachment } from "@/types/attachment";
import {
  getAttachmentsByTask,
  createAttachment,
  deleteAttachment,
  validateFile,
  fileToBase64,
} from "@/lib/attachments";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";

export function useAttachments(taskId: string | number) {
  const { user } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAttachments = useCallback(() => {
    const taskAttachments = getAttachmentsByTask(taskId);
    setAttachments(taskAttachments);
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    loadAttachments();

    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === "attachments") {
        loadAttachments();
      }
    };

    window.addEventListener("local-storage-change", handleStorageChange);
    return () =>
      window.removeEventListener("local-storage-change", handleStorageChange);
  }, [loadAttachments]);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!user) {
        setError("You must be logged in to upload files");
        return null;
      }

      const workspaceId = activeWorkspace?.id;
      if (!workspaceId) {
        setError("No active workspace");
        return null;
      }

      setUploading(true);
      setError(null);

      try {
        // Validate file
        const validation = validateFile(file, workspaceId);
        if (!validation.isValid) {
          setError(validation.error || "Invalid file");
          setUploading(false);
          return null;
        }

        // Convert to base64
        const fileUrl = await fileToBase64(file);

        // Create attachment
        const newAttachment = createAttachment({
          taskId,
          workspaceId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileUrl,
          uploadedBy: user.id,
          uploadedByName: user.name,
        });

        setUploading(false);
        return newAttachment;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setUploading(false);
        return null;
      }
    },
    [taskId, user, activeWorkspace],
  );

  const uploadMultipleFiles = useCallback(
    async (files: File[]) => {
      const results = [];
      for (const file of files) {
        const result = await uploadFile(file);
        if (result) results.push(result);
      }
      return results;
    },
    [uploadFile],
  );

  const removeAttachment = useCallback((id: string | number) => {
    deleteAttachment(id);
  }, []);

  return {
    attachments,
    loading,
    uploading,
    error,
    uploadFile,
    uploadMultipleFiles,
    removeAttachment,
    refresh: loadAttachments,
  };
}
