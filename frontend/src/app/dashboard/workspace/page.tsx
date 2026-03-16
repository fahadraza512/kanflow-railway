"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/lib/toast";
import { validateWorkspaceName } from "@/lib/validation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { WorkspaceStep } from "@/components/onboarding";

export default function DashboardCreateWorkspacePage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [workspaceName, setWorkspaceName] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [workspaceNameError, setWorkspaceNameError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);

    // Cleanup old pending workspaces on mount
    useEffect(() => {
        const pending = localStorage.getItem("pendingWorkspace");
        if (pending) {
            try {
                const data = JSON.parse(pending);
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                if (data.timestamp && data.timestamp < oneHourAgo) {
                    localStorage.removeItem("pendingWorkspace");
                    console.log('Cleaned up old pending workspace');
                }
            } catch (error) {
                localStorage.removeItem("pendingWorkspace");
                console.error('Error parsing pending workspace, cleaned up');
            }
        }
    }, []);

    const compressImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 200;
                    const MAX_HEIGHT = 200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.8));
                    } else {
                        reject(new Error('Failed to get canvas context'));
                    }
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                showToast.error('Image is too large. Please use an image smaller than 5MB.');
                return;
            }
            
            if (!file.type.startsWith('image/')) {
                showToast.error('Please upload an image file.');
                return;
            }
            
            try {
                setIsCompressing(true);
                const compressedImage = await compressImage(file);
                setAvatarPreview(compressedImage);
                showToast.success('Image uploaded and compressed successfully');
            } catch (error) {
                console.error('Error compressing image:', error);
                showToast.error('Failed to process image. Please try another image.');
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const handleNext = () => {
        if (isProcessing || isCompressing) {
            return;
        }

        if (!workspaceName.trim()) {
            setWorkspaceNameError("Workspace name is required");
            return;
        }
        
        const validation = validateWorkspaceName(workspaceName);
        if (!validation.isValid) {
            setWorkspaceNameError(validation.error || "Invalid workspace name");
            return;
        }

        setIsProcessing(true);

        try {
            // Store workspace details and go to plan selection
            // Workspace will be created after plan is selected
            localStorage.setItem("pendingWorkspace", JSON.stringify({
                name: workspaceName.trim(),
                logo: avatarPreview || undefined,
                timestamp: Date.now()
            }));
            
            router.replace("/dashboard/plan");
        } catch (error) {
            console.error('Error saving workspace data:', error);
            showToast.error('Failed to save workspace data. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
                <div className="w-full max-w-lg">
                    <WorkspaceStep
                        workspaceName={workspaceName}
                        avatarPreview={avatarPreview}
                        workspaceNameError={workspaceNameError}
                        onWorkspaceNameChange={(name) => {
                            setWorkspaceName(name);
                            setWorkspaceNameError("");
                        }}
                        onAvatarUpload={handleAvatarUpload}
                        onNext={handleNext}
                        showBackButton={true}
                        onBack={() => router.replace("/dashboard")}
                        isProcessing={isProcessing}
                        isCompressing={isCompressing}
                    />
                </div>
            </div>

            {/* Loading Overlay */}
            {(isProcessing || isCompressing) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm font-semibold text-gray-900">
                            {isCompressing ? 'Compressing image...' : 'Processing...'}
                        </p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
