"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCurrentUser } from "@/hooks/api";
import { updateProfileSchema, validateData } from "@/lib/validation.schemas";
import { showToast } from "@/lib/toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import LoadingState from "@/components/ui/LoadingState";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileFormFields from "@/components/profile/ProfileFormFields";
import ProfileFormActions from "@/components/profile/ProfileFormActions";

export default function ProfileSettingsPage() {
    const { user, updateProfile: updateAuthProfile } = useAuthStore();
    // Don't fetch current user if we already have user data from auth store
    const { data: currentUser, isLoading } = useCurrentUser();
    
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        title: user?.title || "",
        bio: user?.bio || ""
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const [isSaving, setIsSaving] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Show loading only if we don't have user data at all
    const showLoading = isLoading && !user;

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleDiscard = () => {
        setFormData({
            name: user?.name || "",
            email: user?.email || "",
            title: user?.title || "",
            bio: user?.bio || ""
        });
        setAvatarPreview(user?.avatar || null);
        showToast.success("Changes discarded");
    };

    const handleSave = async () => {
        // Validate with Zod
        const validation = validateData(updateProfileSchema, {
            name: formData.name,
            title: formData.title,
            bio: formData.bio,
            avatar: avatarPreview
        });

        if (!validation.success) {
            const firstError = Object.values(validation.errors || {})[0];
            showToast.error(firstError);
            return;
        }

        setIsSaving(true);

        try {
            // TODO: Call API to update profile
            // await updateProfileMutation.mutateAsync(validation.data);
            
            // For now, update local state
            updateAuthProfile({
                name: formData.name,
                title: formData.title,
                bio: formData.bio,
                avatar: avatarPreview
            });

            setLastUpdated(new Date());
            showToast.success("Profile updated successfully!");
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to update profile";
            showToast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    if (showLoading) {
        return (
            <DashboardLayout>
                <AuthGuard>
                    <main className="max-w-4xl mx-auto px-4 py-4">
                        <LoadingState message="Loading profile..." />
                    </main>
                </AuthGuard>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <AuthGuard>
                <main className="max-w-4xl mx-auto px-4 py-4">
                    <div className="mb-6 pb-4 border-b border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-gray-900">Account Settings</h1>
                                <p className="text-gray-500 text-[10px]">Personal • Update your profile and account details</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-4 md:p-5">
                            <ProfileAvatar 
                                avatarPreview={avatarPreview}
                                name={formData.name}
                                email={formData.email}
                                onUpload={handleAvatarUpload}
                                onRemove={handleRemoveAvatar}
                            />
                            <ProfileFormFields 
                                formData={formData}
                                onUpdate={updateField}
                            />
                            <ProfileFormActions 
                                lastUpdated={lastUpdated}
                                isSaving={isSaving}
                                onDiscard={handleDiscard}
                                onSave={handleSave}
                            />
                        </div>
                    </div>
                </main>
            </AuthGuard>
        </DashboardLayout>
    );
}
