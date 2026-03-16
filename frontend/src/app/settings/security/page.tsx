"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChangePassword, useLogout, useDeleteAccount } from "@/hooks/api";
import { changePasswordSchema, validateData } from "@/lib/validation.schemas";
import { showToast } from "@/lib/toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import PasswordSection from "@/components/settings/security/PasswordSection";
import ActiveSessionsList from "@/components/settings/security/ActiveSessionsList";
import ChangePasswordModal from "@/components/settings/security/ChangePasswordModal";
import DeleteAccountModal from "@/components/settings/security/DeleteAccountModal";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

export default function SecuritySettingsPage() {
    const router = useRouter();
    const { user, logout: localLogout } = useAuthStore();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const changePasswordMutation = useChangePassword();
    const logoutMutation = useLogout();
    const deleteAccountMutation = useDeleteAccount();

    // Mock sessions data (will come from API)
    const sessions = [
        {
            id: "1",
            device: "Chrome on Windows",
            location: "New York, US",
            lastActive: "Just now",
            current: true
        }
    ];

    const lastPasswordChange = "Never changed";

    const handleChangePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
        // Validate with Zod
        const validation = validateData(changePasswordSchema, {
            currentPassword,
            newPassword,
            confirmPassword
        });

        if (!validation.success) {
            const firstError = Object.values(validation.errors || {})[0];
            showToast.error(firstError);
            return;
        }

        changePasswordMutation.mutate(validation.data, {
            onSuccess: () => {
                showToast.success("Password changed successfully! Please log in with your new password.");
                setIsPasswordModalOpen(false);
                
                // Log out user after password change
                setTimeout(() => {
                    localLogout();
                    router.push('/login');
                }, 1500);
            },
            onError: (error: any) => {
                const errorMessage = error?.response?.data?.message || "Failed to change password";
                showToast.error(errorMessage);
            }
        });
    };

    const handleLogoutSession = (sessionId: string) => {
        // TODO: Implement logout specific session
        showToast.success("Session logged out");
    };

    const handleLogoutAllSessions = () => {
        if (confirm("Log out from all devices? You'll need to sign in again on all devices.")) {
            logoutMutation.mutate();
        }
    };

    const handleDeleteAccount = (confirmation: string) => {
        if (confirmation !== "DELETE") {
            showToast.error("Please type DELETE to confirm");
            return;
        }

        if (confirm("Are you absolutely sure? This action cannot be undone.")) {
            deleteAccountMutation.mutate();
        }
    };

    return (
        <DashboardLayout>
            <AuthGuard>
                <main className="max-w-4xl mx-auto px-4 py-3">
                    <div className="mb-6 pb-4 border-b border-red-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-gray-900">Security & Privacy</h1>
                                <p className="text-gray-500 text-[10px]">Personal • Manage your password and account security</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Password Section */}
                        <PasswordSection
                            lastPasswordChange={lastPasswordChange}
                            onChangePassword={() => setIsPasswordModalOpen(true)}
                        />

                        {/* Active Sessions */}
                        <ActiveSessionsList
                            sessions={sessions}
                            onLogoutSession={handleLogoutSession}
                            onLogoutAll={handleLogoutAllSessions}
                        />

                        {/* Danger Zone */}
                        <div className="bg-red-50 rounded-lg border border-red-200 overflow-hidden">
                            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-red-900">Deactivate Account</h3>
                                    <p className="text-[10px] text-red-700">Permanently delete your account and all data</p>
                                </div>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="w-full sm:w-auto shrink-0"
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Modals */}
                    {isPasswordModalOpen && (
                        <ChangePasswordModal
                            isOpen={isPasswordModalOpen}
                            onClose={() => setIsPasswordModalOpen(false)}
                            onSubmit={handleChangePassword}
                            isLoading={changePasswordMutation.isPending}
                        />
                    )}

                    <DeleteAccountModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDeleteAccount}
                    />
                </main>
            </AuthGuard>
        </DashboardLayout>
    );
}
