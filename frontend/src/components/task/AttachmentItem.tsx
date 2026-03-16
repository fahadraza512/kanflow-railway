import { Attachment, formatFileSize, isImageFile, isPreviewableFile } from "@/types/attachment";
import { Download, Trash2, FileText, Image as ImageIcon, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface AttachmentItemProps {
  attachment: Attachment;
  onDelete: () => void;
  onPreview?: () => void;
}

export function AttachmentItem({
  attachment,
  onDelete,
  onPreview,
}: AttachmentItemProps) {
  const [imageError, setImageError] = useState(false);
  const isImage = isImageFile(attachment.fileType) && !imageError;
  const isPreviewable = isPreviewableFile(attachment.fileType);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = attachment.fileUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      {isImage ? (
        <button
          onClick={onPreview}
          className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity group/preview cursor-pointer"
          title="Click to preview"
        >
          <img
            src={attachment.fileUrl}
            alt={attachment.fileName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/20 transition-colors flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white opacity-0 group-hover/preview:opacity-100 transition-opacity" />
          </div>
        </button>
      ) : (
        <div className="flex-shrink-0 w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
          <FileText className="w-6 h-6 text-gray-600" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {attachment.fileName}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          <span>{formatFileSize(attachment.fileSize)}</span>
          <span>•</span>
          <span>{attachment.uploadedByName}</span>
          <span>•</span>
          <span>
            {formatDistanceToNow(new Date(attachment.uploadedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isPreviewable && onPreview && (
          <button
            onClick={onPreview}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            aria-label="Preview"
            title={isImage ? "Preview image" : "Preview document"}
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleDownload}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          aria-label="Download"
        >
          <Download className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
