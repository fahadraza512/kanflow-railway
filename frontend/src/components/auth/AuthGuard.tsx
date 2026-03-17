"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];
const ONBOARDING_ROUTE = "/onboarding";

// Mark onboarding as completed in database
export async function markOnboardingComplete(): Promise<void> {
    if (typeof window === "undefined") return;

    try {
        const { authService } = await import("@/services/api/auth.service");
        await authService.completeOnboarding();

        const { useAuthStore } = await import("@/store/useAuthStore");
        const { user, token, role } = useAuthStore.getState();
        if (user && token && role) {
            useAuthStore.setState({ user: { ...user, onboardingCompleted: true } });
        }
    } catch (error) {
        console.error("Failed to mark onboarding as complete:", error);
    }
}

const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/10">
        <div className="text-center">
            <div className="relative inline-block mb-4">
                <div className="relative w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <span className="text-white font-black text-2xl">K</span>
                </div>
            </div>
            <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    </div>
);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { token, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    // Track whether Zustand has rehydrated from localStorage.
    // Until this is true we must not render any page content or make routing decisions.
    const [storeHydrated, setStoreHydrated] = useState(false);
    // Track whether we've finished the routing decision so we don't flash the wrong page.
    const [routeResolved, setRouteResolved] = useState(false);

    // Zustand persist rehydrates synchronously on the client after mount.
    // One useEffect tick is enough to know the store is ready.
    useEffect(() => {
        setStoreHydrated(true);
    }, []);

    useEffect(() => {
        if (!storeHydrated) return;

        const currentPath = pathname || "";
        const isPublicRoute = PUBLIC_ROUTES.includes(currentPath);
        const isOnboardingRoute = currentPath === ONBOARDING_ROUTE;
        const isAuthRoute = currentPath === "/login" || currentPath === "/signup";

        // Case 1: No user logged in
        if (!token || !user) {
            if (isPublicRoute) {
                setRouteResolved(true);
                return;
            }
            router.replace("/login");
            // Keep spinner until navigation completes
            return;
        }

        // Case 2: User logged in
        const isInviteAcceptPage = currentPath.startsWith('/invite/accept');

        if (isInviteAcceptPage) {
            setRouteResolved(true);
            return;
        }

        // Pending invite token comes from auth store (set by login response) — no localStorage
        const pendingInviteToken = (user as any).pendingInviteToken || null;

        // If there's a pending invite token, always go to invite acceptance — never onboarding
        if (pendingInviteToken) {
            console.log("Pending invite token found — redirecting to invite acceptance");
            router.replace(`/invite/accept?token=${pendingInviteToken}`);
            return;
        }

        // Show onboarding ONLY for brand new users: no workspace, no invite, not completed
        const isNewUser =
            !user.onboardingCompleted &&
            !(user as any).activeWorkspaceId &&
            !(user as any).skipOnboarding;

        if (isNewUser && !isOnboardingRoute && !isPublicRoute) {
            console.log("Brand new user — redirecting to onboarding");
            router.replace(ONBOARDING_ROUTE);
            return;
        }

        if (!isNewUser && isOnboardingRoute) {
            console.log("User already has account/workspace — redirecting to dashboard");
            router.replace("/dashboard");
            return;
        }

        if (isAuthRoute) {
            router.replace(isNewUser ? "/onboarding" : "/dashboard");
            return;
        }

        // Route is correct — allow render
        setRouteResolved(true);
    }, [token, user, pathname, router, storeHydrated]);

    // Show loading screen until store is hydrated AND routing decision is made
    if (!storeHydrated || !routeResolved) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}
