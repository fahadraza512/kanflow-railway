import { memo } from "react";
import { User, Settings, Users, CreditCard, Shield, Mail } from "lucide-react";

interface ProfileMenuItemsProps {
    onNavigate: (path: string) => void;
}

const userLevelItems = [
    { icon: User, label: "Profile Settings", path: "/settings/profile" },
    { icon: Shield, label: "Security & Privacy", path: "/settings/security" }
];

const workspaceLevelItems = [
    { icon: Settings, label: "Workspace Settings", path: "/settings/workspace" },
    { icon: Users, label: "Team Members", path: "/settings/members" },
    { icon: CreditCard, label: "Billing & Plans", path: "/settings/billing" },
    { icon: Mail, label: "Notifications", path: "/settings/notifications" }
];

function ProfileMenuItems({ onNavigate }: ProfileMenuItemsProps) {
    return (
        <div className="p-1">
            {/* User Account Section */}
            <div className="mb-2">
                <div className="px-2 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Account
                </div>
                {userLevelItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => onNavigate(item.path)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Workspace Section */}
            <div className="border-t border-gray-100 pt-2">
                <div className="px-2 py-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Workspace
                </div>
                {workspaceLevelItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => onNavigate(item.path)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded transition-colors"
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default memo(ProfileMenuItems);
