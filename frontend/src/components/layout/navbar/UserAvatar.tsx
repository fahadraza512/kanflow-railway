interface UserAvatarProps {
    user: {
        name: string;
        avatar?: string;
    };
    onClick: (e: React.MouseEvent) => void;
}

export function UserAvatar({ user, onClick }: UserAvatarProps) {
    return (
        <div onClick={onClick} className="flex items-center gap-3 cursor-pointer">
            {user.avatar ? (
                <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover shadow-md"
                />
            ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                </div>
            )}
        </div>
    );
}
