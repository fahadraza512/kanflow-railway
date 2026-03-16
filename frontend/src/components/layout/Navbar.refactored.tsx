"use client";

import { Logo } from "./navbar/Logo";
import { WorkspaceSwitcher } from "./navbar/WorkspaceSwitcher";
import { LandingLinks } from "./navbar/LandingLinks";
import { SearchBar } from "./navbar/SearchBar";
import { GuestActions } from "./navbar/GuestActions";
import { UpgradeButton } from "./navbar/UpgradeButton";
import { UserAvatar } from "./navbar/UserAvatar";
import { ProfileMenu } from "./navbar/ProfileMenu";
import NotificationBell from "./NotificationBell";
import UpgradeModal from "../workspace/UpgradeModal";
import { useNavbar } from "@/hooks/useNavbar";

export default function Navbar() {
    const {
        user,
        isLandingPage,
        activeWorkspaceName,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        isProfileMenuOpen,
        setIsProfileMenuOpen,
        subscriptionStatus,
        showUpgradeButton,
        handleLogout,
        toggleProfileMenu
    } = useNavbar();

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100 h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex justify-between items-center h-full">
                    {/* Left Side */}
                    <div className="flex items-center gap-10">
                        <Logo href={user ? "/dashboard" : "/"} />
                        {user && !isLandingPage && activeWorkspaceName && (
                            <WorkspaceSwitcher workspaceName={activeWorkspaceName} />
                        )}
                    </div>

                    {/* Center */}
                    <div className="hidden md:flex flex-1 justify-center px-4">
                        {isLandingPage ? <LandingLinks /> : user && <SearchBar />}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-6">
                        {!user ? (
                            <GuestActions />
                        ) : (
                            <div className="flex items-center gap-4">
                                {showUpgradeButton && (
                                    <UpgradeButton
                                        onClick={() => setIsUpgradeModalOpen(true)}
                                        subscriptionStatus={subscriptionStatus}
                                    />
                                )}
                                <NotificationBell />
                                <div className="relative">
                                    <UserAvatar user={user} onClick={toggleProfileMenu} />
                                    <ProfileMenu
                                        isOpen={isProfileMenuOpen}
                                        onClose={() => setIsProfileMenuOpen(false)}
                                        onLogout={handleLogout}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onSuccess={() => setIsUpgradeModalOpen(false)}
            />
        </nav>
    );
}
