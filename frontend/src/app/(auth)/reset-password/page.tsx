"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useResetPassword } from "@/hooks/api";
import { resetPasswordSchema, validateData } from "@/lib/validation.schemas";
import { showToast } from "@/lib/toast";
import PasswordInput from "@/components/auth/PasswordInput";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isReset, setIsReset] = useState(false);
    const [error, setError] = useState("");

    const resetPasswordMutation = useResetPassword();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!token) {
            setError("Invalid or missing reset token. Please request a new password reset.");
            showToast.error("Invalid reset token");
            return;
        }

        if (!isPasswordValid) {
            setError("Please ensure your password meets all requirements.");
            return;
        }
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Validate with schema
        const validation = validateData(resetPasswordSchema, {
            token,
            newPassword: password,
            confirmPassword
        });

        if (!validation.success) {
            const firstError = Object.values(validation.errors || {})[0];
            setError(firstError);
            showToast.error(firstError);
            return;
        }

        // Reset password
        resetPasswordMutation.mutate(validation.data, {
            onSuccess: () => {
                setIsReset(true);
                showToast.success("Password reset successfully!");
            },
            onError: (error: any) => {
                const errorMessage = error?.response?.data?.message || error?.message || "Failed to reset password. Please try again.";
                setError(errorMessage);
                showToast.error(errorMessage);
            }
        });
    };

    if (isReset) {
        return (
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Password reset</h2>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    Your password has been successfully reset. You can now login with your new password.
                </p>
                <div className="mt-8">
                    <Link
                        href="/login"
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Your new password must be different from previous passwords.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
                    {error}
                </div>
            )}

            {resetPasswordMutation.isPending && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2">
                    <LoadingSpinner size="sm" color="primary" />
                    <span className="text-sm text-blue-700 font-medium">Resetting your password...</span>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <PasswordInput
                    value={password}
                    onChange={setPassword}
                    showValidation={true}
                    placeholder="Create a strong password"
                    label="New Password"
                    onValidationChange={setIsPasswordValid}
                />

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Confirm Password</label>
                    <input
                        type="password"
                        required
                        disabled={resetPasswordMutation.isPending}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {confirmPassword && password !== confirmPassword && (
                        <p className="mt-2 text-xs text-red-600">Passwords do not match</p>
                    )}
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={!isPasswordValid || !confirmPassword || password !== confirmPassword || resetPasswordMutation.isPending}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                    >
                        {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                    </button>
                </div>
            </form>
        </div>
    );
}
