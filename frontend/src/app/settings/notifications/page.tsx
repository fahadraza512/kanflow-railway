"use client";

import { useState, useEffect } from "react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { showToast } from "@/lib/toast";
import NotificationPreferences from "@/components/emails/NotificationPreferences";
import { 
    usePreferences,
    useUpdateEmailPreferences 
} from "@/hooks/api";
import LoadingState from "@/components/ui/LoadingState";

export default function NotificationSettingsPage() {
    const { activeWorkspace } = useWorkspaceStore();
    const { user } = useAuthStore();
    const [preferences, setPreferences] = useState({
        assignments: true,
        mentions: true,
        deadlines: true,
        comments: true,
        paymentAlerts: true
    });
    
    // Check if current user is the workspace owner
    const isOwner = activeWorkspace?.ownerId === user?.id;
    
    // Fetch user preferences
    const { data: userPreferences, isLoading: preferencesLoading } = usePreferences();
    const updatePreferencesMutation = useUpdateEmailPreferences();

    // Load preferences when available
    useEffect(() => {
        if (userPreferences) {
            setPreferences({
                assignments: userPreferences.emailAssignments ?? true,
                mentions: userPreferences.emailMentions ?? true,
                comments: userPreferences.emailComments ?? true,
                deadlines: userPreferences.emailDeadlines ?? true,
                paymentAlerts: userPreferences.emailPaymentAlerts ?? true,
            });
        }
    }, [userPreferences]);

    const handlePreferenceChange = async (key: string, value: boolean) => {
        const newPreferences = { ...preferences, [key]: value };
        setPreferences(newPreferences);
        
        // Map frontend keys to backend keys
        const backendPreferences = {
            emailAssignments: newPreferences.assignments,
            emailMentions: newPreferences.mentions,
            emailComments: newPreferences.comments,
            emailDeadlines: newPreferences.deadlines,
            emailPaymentAlerts: newPreferences.paymentAlerts,
        };
        
        try {
            await updatePreferencesMutation.mutateAsync(backendPreferences);
            showToast.success("Preference updated");
        } catch (error: any) {
            // Revert on error
            setPreferences(preferences);
            showToast.error(error.message || "Failed to update preference");
        }
    };

    if (preferencesLoading) {
        return (
            <DashboardLayout>
                <AuthGuard>
                    <main className="max-w-6xl mx-auto px-4 py-4">
                        <LoadingState message="Loading preferences..." />
                    </main>
                </AuthGuard>
            </DashboardLayout>
        );
    }

    // Show no workspace state
    if (!activeWorkspace?.id) {
        return (
            <DashboardLayout>
                <AuthGuard>
                    <main className="max-w-6xl mx-auto px-4 py-4">
                        <div className="mb-4">
                            <h1 className="text-base font-bold text-gray-900">Notification Settings</h1>
                            <p className="text-gray-500 mt-0.5 text-[10px]">Manage your notification preferences</p>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                            <p className="text-yellow-800 font-medium mb-4">No workspace selected</p>
                            <a href="/dashboard/workspace" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                                Create Workspace
                            </a>
                        </div>
                    </main>
                </AuthGuard>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <AuthGuard>
                <main className="max-w-6xl mx-auto px-4 py-4">
                    <div className="mb-6">
                        <h1 className="text-base font-bold text-gray-900">Notification Settings</h1>
                        <p className="text-gray-500 mt-0.5 text-[10px]">
                            {activeWorkspace.name} • Control which notifications you receive
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-6">
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold text-gray-900">Notification Preferences</h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Choose which types of notifications you want to receive. These settings control both in-app and email notifications.
                                </p>
                            </div>
                            
                            <NotificationPreferences 
                                preferences={preferences} 
                                onPreferenceChange={handlePreferenceChange}
                                isOwner={isOwner}
                            />
                        </div>
                    </div>

                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <div className="text-blue-600 mt-0.5">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-blue-900">About Notifications</h3>
                                <p className="text-xs text-blue-700 mt-1">
                                    When a notification type is disabled, you will not receive any notifications (in-app or email) for that category. 
                                    You can view all your notifications in the <a href="/notifications" className="underline font-medium">Notifications page</a>.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>
            </AuthGuard>
        </DashboardLayout>
    );
}
