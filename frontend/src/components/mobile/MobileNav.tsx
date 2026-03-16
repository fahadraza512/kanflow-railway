"use client";

import { Home, FolderKanban, BarChart3, Settings, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function MobileNav() {
    const pathname = usePathname();
    const [showMenu, setShowMenu] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setShowMenu(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (showMenu) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showMenu]);

    const navItems = [
        { href: "/dashboard", icon: Home, label: "Home" },
        { href: "/analytics", icon: BarChart3, label: "Analytics" },
        { href: "/settings/profile", icon: Settings, label: "Settings" },
    ];

    return (
        <>
            {/* Bottom Navigation Bar - Mobile Only */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden safe-bottom">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname.startsWith(item.href);
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-xl transition-all flex-1 min-h-[44px]",
                                    isActive
                                        ? "text-blue-600 bg-blue-50"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95"
                                )}
                            >
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                <span className="text-[10px] sm:text-xs font-semibold">{item.label}</span>
                            </Link>
                        );
                    })}
                    
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-xl transition-all flex-1 min-h-[44px]",
                            showMenu
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:scale-95"
                        )}
                        aria-label="Toggle menu"
                    >
                        {showMenu ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
                        <span className="text-[10px] sm:text-xs font-semibold">Menu</span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-[60] lg:hidden animate-fadeIn"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="fixed bottom-16 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[70] lg:hidden max-h-[70vh] overflow-y-auto animate-slide-in-bottom safe-bottom">
                        <div className="p-4 sm:p-6 space-y-2">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900">Menu</h3>
                                <button
                                    onClick={() => setShowMenu(false)}
                                    className="text-gray-400 hover:text-gray-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    aria-label="Close menu"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <Link
                                href="/archived-tasks"
                                onClick={() => setShowMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors min-h-[44px] active:scale-98"
                            >
                                <FolderKanban className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-900">Archived Tasks</span>
                            </Link>
                            
                            <Link
                                href="/notifications"
                                onClick={() => setShowMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors min-h-[44px] active:scale-98"
                            >
                                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                            </Link>
                            
                            <Link
                                href="/settings/billing"
                                onClick={() => setShowMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors min-h-[44px] active:scale-98"
                            >
                                <span className="text-sm font-semibold text-gray-900">Billing</span>
                            </Link>
                            
                            <Link
                                href="/settings/workspace"
                                onClick={() => setShowMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors min-h-[44px] active:scale-98"
                            >
                                <span className="text-sm font-semibold text-gray-900">Workspace Settings</span>
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
