import { memo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";

const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
        case "ADMIN":
            return "bg-purple-100 text-purple-700";
        case "PROJECT_MANAGER":
            return "bg-blue-100 text-blue-700";
        case "DEVELOPER":
        case "MEMBER":
            return "bg-green-100 text-green-700";
        case "VIEWER":
            return "bg-gray-100 text-gray-700";
        default:
            return "bg-gray-100 text-gray-700";
    }
};

const getRoleLabel = (role: string | null) => {
    if (role === "DEVELOPER" || role === "MEMBER") return "Member";
    if (role === "PROJECT_MANAGER") return "Project Manager";
    return role || "Member";
};

function ProfileMenuHeader() {
    const { user, role } = useAuthStore();

    return (
        <div className="p-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-1.5">
                <UserAvatar user={user} size="md" />
                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-gray-900 truncate">
                        {user?.name || "User"}
                    </div>
                    <div className="text-[9px] text-gray-500 truncate">
                        {user?.email}
                    </div>
                </div>
            </div>
            <div className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold",
                getRoleBadgeColor(role)
            )}>
                {getRoleLabel(role)}
            </div>
        </div>
    );
}

export default memo(ProfileMenuHeader);
