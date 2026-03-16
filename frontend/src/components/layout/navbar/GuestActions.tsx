import Link from "next/link";

export function GuestActions() {
    return (
        <div className="flex items-center gap-6">
            <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
                Login
            </Link>
            <Link
                href="/signup"
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
                Get Started
            </Link>
        </div>
    );
}
