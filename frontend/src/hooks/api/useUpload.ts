import { useMutation } from '@tanstack/react-query';
import { uploadService, UploadResponse } from '@/services/api/upload.service';
import { handleApiError } from '@/services/api/base.service';
import { showToast } from '@/lib/toast';

// Query keys
export const uploadKeys = {
    all: ['upload'] as const,
};

/**
 * Hook to upload a file
 */
export function useUploadFile() {
    return useMutation({
        mutationFn: ({ file, type }: { file: File; type: 'avatar' | 'workspace-icon' | 'attachment' }) =>
            uploadService.uploadFile(file, type),
        onSuccess: () => {
            showToast.success('File uploaded successfully');
        },
        onError: (error) => {
            const apiError = handleApiError(error);
            showToast.error(apiError.message || 'Failed to upload file');
        },
    });
}

/**
 * Hook to delete a file
 */
export function useDeleteFile() {
    return useMutation({
        mutationFn: (fileUrl: string) => uploadService.deleteFile(fileUrl),
        onSuccess: () => {
            showToast.success('File deleted successfully');
        },
        onError: (error) => {
            const apiError = handleApiError(error);
            showToast.error(apiError.message || 'Failed to delete file');
        },
    });
}
