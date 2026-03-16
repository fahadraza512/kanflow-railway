import { apiClient } from './base.service';

export interface UploadResponse {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
}

export const uploadService = {
    /**
     * Upload a file to the server
     * @param file - File to upload
     * @param type - Type of upload (avatar, workspace-icon, attachment)
     * @returns Upload response with file URL
     */
    uploadFile: async (
        file: File,
        type: 'avatar' | 'workspace-icon' | 'attachment'
    ): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await apiClient.post<{ data: UploadResponse }>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    },

    /**
     * Delete an uploaded file
     * @param fileUrl - URL of the file to delete
     */
    deleteFile: async (fileUrl: string): Promise<void> => {
        await apiClient.delete('/upload', {
            data: { fileUrl },
        });
    },
};
