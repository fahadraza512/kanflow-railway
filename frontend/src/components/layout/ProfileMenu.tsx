import { memo, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import ProfileMenuHeader from "./ProfileMenuHeader";
import ProfileMenuItems from "./ProfileMenuItems";

interface ProfileMenuProps {
    onClose: () => void;
}

function ProfileMenu({ onClose }: ProfileMenuProps) {
    const { logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = useCallback(() => {
        logout();
        if (typeof window !== 'undefined') {
            window.location.href = "/";
        }
    }, [logout]);

    const handleNavigate = useCallback((path: string) => {
        onClose();
        router.push(path);
    }, [onClose, router]);

    return (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <ProfileMenuHeader />
            <ProfileMenuItems onNavigate={handleNavigate} />
            
            <div className="p-1 border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                    <LogOut className="w-3 h-3" />
                    Log Out
                </button>
            </div>
        </div>
    );
}

export default memo(ProfileMenu);
