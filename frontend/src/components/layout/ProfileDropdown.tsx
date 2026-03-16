import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import ProfileMenu from "./ProfileMenu";
import UserAvatar from "./UserAvatar";

export default function ProfileDropdown() {
    const { user } = useAuthStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <UserAvatar user={user} size="sm" />
                <div className="hidden md:block text-left">
                    <div className="text-xs font-semibold text-gray-900">
                        {user?.name || "User"}
                    </div>
                    <div className="text-[10px] text-gray-500">
                        {user?.email}
                    </div>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400 hidden md:block" />
            </button>

            {isProfileOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsProfileOpen(false);
                        }} 
                    />
                    <ProfileMenu onClose={() => setIsProfileOpen(false)} />
                </>
            )}
        </div>
    );
}
