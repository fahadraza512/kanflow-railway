import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getActiveWorkspace, getWorkspaceById } from "@/lib/storage";
import { useStorageListener } from "@/hooks/useLocalStorage";

export function useNavbar() {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    
    const [activeWorkspaceName, setActiveWorkspaceName] = useState<string>("");
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<"free" | "pro">("free");
    const [subscriptionStatus, setSubscriptionStatus] = useState<"active" | "cancelled" | "expired" | undefined>();
    
    const isLandingPage = pathname === "/";

    // Load workspace data
    useEffect(() => {
        if (user) {
            const activeId = getActiveWorkspace();
            if (activeId) {
                const ws = getWorkspaceById(activeId);
                if (ws) {
                    setActiveWorkspaceName(ws.name);
                    setCurrentPlan(ws.plan || "free");
                    setSubscriptionStatus(ws.subscriptionStatus);
                }
            }
        }
    }, [user, pathname]);

    // Listen for workspace changes
    useStorageListener(() => {
        if (user) {
            const activeId = getActiveWorkspace();
            if (activeId) {
                const ws = getWorkspaceById(activeId);
                if (ws) {
                    setActiveWorkspaceName(ws.name);
                    setCurrentPlan(ws.plan || "free");
                    setSubscriptionStatus(ws.subscriptionStatus);
                }
            }
        }
    }, ['workspaces', 'activeWorkspace']);

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setIsProfileMenuOpen(false);
        if (isProfileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isProfileMenuOpen]);

    const handleLogout = () => {
        logout();
        window.location.href = "/";
    };

    const toggleProfileMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    const showUpgradeButton = !isLandingPage && (
        currentPlan === "free" || 
        subscriptionStatus === "cancelled" || 
        subscriptionStatus === "expired"
    );

    return {
        user,
        isLandingPage,
        activeWorkspaceName,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        isProfileMenuOpen,
        setIsProfileMenuOpen,
        currentPlan,
        subscriptionStatus,
        showUpgradeButton,
        handleLogout,
        toggleProfileMenu
    };
}
