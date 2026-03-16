import { useState } from "react";
import { useAttachments } from "@/hooks/useAttachments";
import { AttachmentItem } from "./AttachmentItem";
import { AttachmentUploader } from "./AttachmentUploader";
import { AttachmentPreview } from "./AttachmentPreview";
import { Attachment } from "@/types/attachment";
import { Paperclip } from "lucide-react";

interface AttachmentListProps {
  taskId: string | number;
  readOnly?: boolean;
}

export function AttachmentList({ taskId, readOnly }: AttachmentListProps) {
  const {
    attachments,
    uploading,
    error,
    uploadMultipleFiles,
    removeAttachment,
  } = useAttachments(taskId);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(
    null,
  );

  const handleUpload = async (files: File[]) => {
    await uploadMultipleFiles(files);
  };

  const handleDelete = (id: string | number) => {
    if (confirm("Delete this attachment?")) {
      removeAttachment(id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          Attachments
          {attachments.length > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              ({attachments.length})
            </span>
          )}
        </h3>
      </div>

      {!readOnly && (
        <AttachmentUploader
          onUpload={handleUpload}
          uploading={uploading}
          error={error}
        />
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <AttachmentItem
              key={attachment.id}
              attachment={attachment}
              onDelete={() => handleDelete(attachment.id)}
              onPreview={() => setPreviewAttachment(attachment)}
            />
          ))}
        </div>
      )}

      {attachments.length === 0 && readOnly && (
        <p className="text-sm text-gray-500">No attachments</p>
      )}

      {previewAttachment && (
        <AttachmentPreview
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}
    </div>
  );
}
