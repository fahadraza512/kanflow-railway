interface UserAvatarProps {
    user: { name?: string; avatar?: string } | null;
    size?: "sm" | "md";
}

export default function UserAvatar({ user, size = "sm" }: UserAvatarProps) {
    const sizeClasses = size === "sm" ? "w-7 h-7" : "w-8 h-8";

    if (user?.avatar) {
        return (
            <img
                src={user.avatar}
                alt={user.name || "User"}
                className={`${sizeClasses} rounded-lg object-cover shadow-md`}
            />
        );
    }

    return (
        <div className={`${sizeClasses} bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs`}>
            {user?.name?.charAt(0) || "U"}
        </div>
    );
}
