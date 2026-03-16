"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { useForgotPassword } from "@/hooks/api";
import { forgotPasswordSchema, validateData } from "@/lib/validation.schemas";
import { showToast } from "@/lib/toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const forgotPasswordMutation = useForgotPassword();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate email
        const validation = validateData(forgotPasswordSchema, { email });
        if (!validation.success) {
            const firstError = Object.values(validation.errors || {})[0];
            setError(firstError);
            showToast.error(firstError);
            return;
        }

        // Send reset email
        forgotPasswordMutation.mutate(validation.data, {
            onSuccess: () => {
                setIsSubmitted(true);
                showToast.success("Password reset email sent!");
            },
            onError: (error: any) => {
                const errorMessage = error?.response?.data?.message || error?.message || "Failed to send reset email. Please try again.";
                setError(errorMessage);
                showToast.error(errorMessage);
            }
        });
    };

    if (isSubmitted) {
        return (
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-6">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    We&apos;ve sent a password reset link to <span className="font-semibold text-gray-900">{email}</span>.
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
                <h2 className="text-2xl font-bold text-gray-900">Forgot password?</h2>
                <p className="mt-2 text-sm text-gray-500">
                    No worries, we&apos;ll send you reset instructions.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
                    {error}
                </div>
            )}

            {forgotPasswordMutation.isPending && (
                <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2">
                    <LoadingSpinner size="sm" color="primary" />
                    <span className="text-sm text-blue-700 font-medium">Sending reset email...</span>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <div className="mt-1 relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="email"
                            required
                            disabled={forgotPasswordMutation.isPending}
                            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={forgotPasswordMutation.isPending}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                    >
                        {forgotPasswordMutation.isPending ? "Sending..." : "Reset Password"}
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-500">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
