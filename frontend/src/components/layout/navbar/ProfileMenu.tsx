import Link from "next/link";

interface ProfileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export function ProfileMenu({ isOpen, onClose, onLogout }: ProfileMenuProps) {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 z-50">
                <Link
                    href="/dashboard"
                    onClick={onClose}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium"
                >
                    Dashboard
                </Link>
                <div className="h-[1px] bg-gray-50 my-1" />
                <Link
                    href="/settings/profile"
                    onClick={onClose}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium"
                >
                    Profile
                </Link>
                <Link
                    href="/settings/workspace"
                    onClick={onClose}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium"
                >
                    Settings
                </Link>
                <Link
                    href="/settings/billing"
                    onClick={onClose}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium"
                >
                    Billing
                </Link>
                <div className="h-[1px] bg-gray-50 my-1" />
                <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium underline underline-offset-4"
                >
                    Logout
                </button>
            </div>
        </>
    );
}
