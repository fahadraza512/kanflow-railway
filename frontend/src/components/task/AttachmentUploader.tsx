import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface AttachmentUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  uploading: boolean;
  error: string | null;
}

export function AttachmentUploader({
  onUpload,
  uploading,
  error,
}: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    await onUpload(fileArray);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Upload files"}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          or drag and drop files here
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Images, PDFs, Documents (Max 5MB for Free, 50MB for Pro)
        </p>
      </div>

      {error && (
        <div className="flex items-center justify-between bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
          <span>{error}</span>
          <button
            onClick={() => {}}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
