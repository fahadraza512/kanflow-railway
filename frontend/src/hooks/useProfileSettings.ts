import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function useProfileSettings() {
    const { user, updateProfile } = useAuthStore();
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        title: user?.title || "Senior Product Designer",
        bio: user?.bio || "Passionate about creating fluid user experiences and organized Kanban boards.",
    });

    const [isSaving, setIsSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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

    const handleDiscard = () => {
        setFormData({
            name: user?.name || "",
            email: user?.email || "",
            title: user?.title || "Senior Product Designer",
            bio: user?.bio || "Passionate about creating fluid user experiences and organized Kanban boards.",
        });
        setAvatarPreview(user?.avatar || null);
    };

    const handleSave = () => {
        setIsSaving(true);
        
        if (user?.email) {
            import("@/lib/auth").then(auth => {
                auth.updateUserProfile(user.email, {
                    name: formData.name,
                    title: formData.title,
                    bio: formData.bio,
                    avatar: avatarPreview || null
                });
            });
        }
        
        updateProfile({
            name: formData.name,
            title: formData.title,
            bio: formData.bio,
            avatar: avatarPreview || null
        });
        
        setLastUpdated(new Date());
        
        setTimeout(() => {
            setIsSaving(false);
        }, 500);
    };

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    return {
        formData,
        isSaving,
        avatarPreview,
        lastUpdated,
        handleAvatarUpload,
        handleRemoveAvatar,
        handleDiscard,
        handleSave,
        updateField
    };
}
