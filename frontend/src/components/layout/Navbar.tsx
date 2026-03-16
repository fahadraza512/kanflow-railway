"use client";

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, Rocket, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import UpgradeModal from '../workspace/UpgradeModal';
import { useHydration } from '@/hooks/useHydration';

export default function Navbar() {
    const pathname = usePathname();
    const isLandingPage = pathname === "/";
    const { activeWorkspace } = useWorkspaceStore();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const isHydrated = useHydration();
    
    // Get user from store with proper reactivity
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    // Close profile menu when clicking outside
    useEffect(() => {
        if (!isHydrated) return;
        
        const handleClickOutside = () => setIsProfileMenuOpen(false);
        if (isProfileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isProfileMenuOpen, isHydrated]);

    const handleLogout = () => {
        logout();
        if (typeof window !== 'undefined') {
            window.location.href = "/";
        }
    };

    // Don't render user-dependent content until hydrated
    const showUserContent = isHydrated && user;
    
    // Get current plan from active workspace
    const currentPlan = activeWorkspace?.plan || "free";
    const subscriptionStatus = activeWorkspace?.subscriptionStatus;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100 animate-slide-down ${isLandingPage ? 'h-20' : 'h-16'}`} style={{ willChange: 'transform' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">
                    {/* Left Side: Logo + Mobile Menu */}
                    <div className="flex items-center gap-3 md:gap-10">
                        {/* Mobile Menu Button */}
                        {showUserContent && !isLandingPage && (
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                        )}

                        <Link href={showUserContent ? "/dashboard" : "/"} className="flex items-center gap-2">
                            <div className={`bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 ${isLandingPage ? 'w-10 h-10' : 'w-8 h-8'}`}>
                                <span className={isLandingPage ? 'text-2xl' : 'text-xl'}>K</span>
                            </div>
                            <span className={`font-black text-gray-900 tracking-tight ${isLandingPage ? 'text-2xl' : 'text-xl'}`}>KanbanFlow</span>
                        </Link>

                        {/* Workspace Switcher - Hidden on mobile */}
                        {showUserContent && !isLandingPage && activeWorkspace && (
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                                {activeWorkspace.icon ? (
                                    <img 
                                        src={activeWorkspace.icon} 
                                        alt={activeWorkspace.name}
                                        className="w-5 h-5 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center text-[9px] font-black text-blue-600">
                                        {activeWorkspace.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-xs font-bold text-gray-900 truncate max-w-[100px] md:max-w-[150px]">{activeWorkspace.name}</span>
                                {/* Plan Badge */}
                                {currentPlan === "free" && (
                                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold rounded uppercase tracking-wider">
                                        Free
                                    </span>
                                )}
                                {currentPlan === "pro" && (
                                    <span className="px-1.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-bold rounded uppercase tracking-wider">
                                        Pro
                                    </span>
                                )}
                                <ChevronDown className="w-3 h-3 text-gray-400" />
                            </div>
                        )}
                    </div>

                    {/* Center: Landing Page Links OR Search Bar - Hidden on mobile */}
                    <div className="hidden md:flex flex-1 justify-center px-4">
                        {isLandingPage ? (
                            <div className="flex items-center gap-8 text-base font-semibold text-gray-600">
                                <button 
                                    onClick={() => {
                                        const section = document.getElementById('features');
                                        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="hover:text-gray-900 transition-colors"
                                >
                                    Features
                                </button>
                                <button 
                                    onClick={() => {
                                        const section = document.getElementById('pricing');
                                        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="hover:text-gray-900 transition-colors"
                                >
                                    Pricing
                                </button>
                                <button 
                                    onClick={() => {
                                        const section = document.getElementById('who-its-for');
                                        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="hover:text-gray-900 transition-colors"
                                >
                                    Who It's For
                                </button>
                            </div>
                        ) : (
                            showUserContent && (
                                <div className="relative w-full max-w-md">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search tasks or projects..."
                                        className="w-full pl-11 pr-4 py-2 bg-gray-50 border border-gray-100 focus:border-blue-500 rounded-xl text-sm font-medium transition-all outline-none"
                                    />
                                </div>
                            )
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3 md:gap-6 min-w-[120px] justify-end">
                        {!showUserContent ? (
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                {isHydrated && (
                                    <>
                                        <Link href="/login" className={`px-3 sm:px-4 md:px-6 font-bold text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-center whitespace-nowrap ${isLandingPage ? 'py-3 text-base' : 'py-2 md:py-2.5 text-xs md:text-sm'}`}>
                                            Login
                                        </Link>
                                        <Link href="/signup" className={`bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 flex items-center justify-center whitespace-nowrap ${isLandingPage ? 'px-6 py-3 text-base' : 'px-3 sm:px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm'}`}>
                                            Get Started
                                        </Link>
                                    </>
                                )}
                                {!isHydrated && (
                                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                        <div className="w-16 h-9 bg-gray-100 rounded-xl animate-pulse" />
                                        <div className="w-24 h-9 bg-gray-100 rounded-xl animate-pulse" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 md:gap-4">
                                {/* Dashboard button - Only show on landing page for logged-in users */}
                                {isLandingPage && (
                                    <Link 
                                        href="/dashboard"
                                        className="px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 text-white text-xs md:text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                {/* Only show Upgrade button if on Free plan or subscription is cancelled/expired */}
                                {!isLandingPage && (currentPlan === "free" || subscriptionStatus === "cancelled" || subscriptionStatus === "expired") && (
                                    <div
                                        onClick={() => setIsUpgradeModalOpen(true)}
                                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                                    >
                                        <Rocket className="w-3 h-3" />
                                        {subscriptionStatus === "cancelled" || subscriptionStatus === "expired" ? "Reactivate" : "Upgrade"}
                                    </div>
                                )}

                                <NotificationBell />

                                <div className="relative">
                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsProfileMenuOpen(!isProfileMenuOpen);
                                        }}
                                        className="flex items-center gap-3 cursor-pointer"
                                    >
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name || 'User'}
                                                className="w-8 h-8 rounded-lg object-cover shadow-md"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                                {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>

                                    {isProfileMenuOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-40" 
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            />
                                            <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-2xl border border-gray-100 shadow-xl py-2 z-50">
                                                {/* Dashboard option - Only show on landing page */}
                                                {isLandingPage && (
                                                    <>
                                                        <Link 
                                                            href="/dashboard" 
                                                            onClick={() => setIsProfileMenuOpen(false)}
                                                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium"
                                                        >
                                                            Dashboard
                                                        </Link>
                                                        <div className="h-[1px] bg-gray-50 my-1" />
                                                    </>
                                                )}
                                                <Link 
                                                    href="/settings/profile" 
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium"
                                                >
                                                    Profile
                                                </Link>
                                                <Link 
                                                    href="/settings/workspace" 
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium"
                                                >
                                                    Settings
                                                </Link>
                                                <Link 
                                                    href="/settings/billing" 
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium"
                                                >
                                                    Billing
                                                </Link>
                                                <div className="h-[1px] bg-gray-50 my-1" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium underline underline-offset-4"
                                                >
                                                    Logout
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {isMobileMenuOpen && showUserContent && !isLandingPage && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="fixed top-16 left-0 bottom-0 w-64 bg-white shadow-2xl z-[95] lg:hidden overflow-y-auto">
                        <div className="p-4 space-y-4">
                            {/* Workspace Info */}
                            {activeWorkspace && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    {activeWorkspace.icon ? (
                                        <img 
                                            src={activeWorkspace.icon} 
                                            alt={activeWorkspace.name}
                                            className="w-10 h-10 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-black text-blue-600">
                                            {activeWorkspace.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-gray-900 truncate">{activeWorkspace.name}</p>
                                            {currentPlan === "free" && (
                                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-bold rounded uppercase">
                                                    Free
                                                </span>
                                            )}
                                            {currentPlan === "pro" && (
                                                <span className="px-1.5 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-bold rounded uppercase">
                                                    Pro
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {currentPlan === "pro" ? "Pro Plan" : "Free Plan"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Search Bar - Mobile */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 focus:border-blue-500 rounded-xl text-sm font-medium transition-all outline-none"
                                />
                            </div>

                            {/* Upgrade Button - Mobile */}
                            {(currentPlan === "free" || subscriptionStatus === "cancelled" || subscriptionStatus === "expired") && (
                                <button
                                    onClick={() => {
                                        setIsUpgradeModalOpen(true);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold hover:from-indigo-700 hover:to-purple-700 transition-all"
                                >
                                    <Rocket className="w-4 h-4" />
                                    {subscriptionStatus === "cancelled" || subscriptionStatus === "expired" ? "Reactivate Pro" : "Upgrade to Pro"}
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onSuccess={() => {
                    // No need to reload - storage listener will update UI automatically
                    setIsUpgradeModalOpen(false);
                }}
            />
        </nav>
    );
}
