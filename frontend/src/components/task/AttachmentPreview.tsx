import { Attachment, isImageFile } from "@/types/attachment";
import { X, Download, ExternalLink } from "lucide-react";

interface AttachmentPreviewProps {
  attachment: Attachment;
  onClose: () => void;
}

export function AttachmentPreview({
  attachment,
  onClose,
}: AttachmentPreviewProps) {
  const isImage = isImageFile(attachment.fileType);
  const isPDF = attachment.fileType === "application/pdf";

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = attachment.fileUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${attachment.fileName}</title>
            <style>
              body { margin: 0; padding: 0; }
              iframe { width: 100vw; height: 100vh; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${attachment.fileUrl}"></iframe>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative max-w-5xl max-h-[90vh] w-full mx-4">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {isPDF && (
            <button
              onClick={handleOpenInNewTab}
              className="p-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg transition-colors"
              aria-label="Open in new tab"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleDownload}
            className="p-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg transition-colors"
            aria-label="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isImage ? (
          <img
            src={attachment.fileUrl}
            alt={attachment.fileName}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        ) : isPDF ? (
          <div className="bg-white rounded-lg overflow-hidden" style={{ height: '90vh' }}>
            <iframe
              src={attachment.fileUrl}
              className="w-full h-full"
              title={attachment.fileName}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">Preview not available for this file type</p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download to view
            </button>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
          <p className="text-sm font-medium text-gray-900 truncate">
            {attachment.fileName}
          </p>
        </div>
      </div>
    </div>
  );
}
