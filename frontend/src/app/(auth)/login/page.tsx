"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLogin } from "@/hooks/api";
import { loginSchema, validateData } from "@/lib/validation.schemas";
import { showToast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginForm from "@/components/auth/LoginForm";
import TwoFactorForm from "@/components/auth/TwoFactorForm";
import SocialLogin from "@/components/auth/SocialLogin";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { AuthResponse } from "@/types/api.types";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isVerified = searchParams.get("verified") === "true";
  const message = searchParams.get("message");

  const [formData, setFormData] = useState({
    email: searchParams.get('email') || "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [show2FA, setShow2FA] = useState(false);
  const [tfaCode, setTfaCode] = useState("");

  const { setAuth } = useAuthStore();
  const loginMutation = useLogin();

  // Validate a single field
  const validateField = (fieldName: string, value: string) => {
    let errorMessage = "";

    switch (fieldName) {
      case "email":
        if (!value || value.trim().length === 0) {
          errorMessage = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = "Invalid email format";
        }
        break;

      case "password":
        if (!value || value.length === 0) {
          errorMessage = "Password is required";
        } else if (value.length < 6) {
          errorMessage = "Password must be at least 6 characters";
        }
        break;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }));

    return errorMessage === "";
  };

  // Handle field blur
  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName as keyof typeof formData]);
  };

  // Handle field change
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    // Validate if field was touched
    if (touchedFields[fieldName]) {
      validateField(fieldName, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setError("");
    setFieldErrors({});

    // Mark all fields as touched
    setTouchedFields({ email: true, password: true });

    // Validate all fields
    const emailValid = validateField("email", formData.email);
    const passwordValid = validateField("password", formData.password);

    if (!emailValid || !passwordValid) {
      setError("Please fix the errors above");
      return;
    }

    // Validate form data using Zod schema
    const validation = validateData(loginSchema, formData);
    if (!validation.success) {
      setFieldErrors(validation.errors || {});
      const firstError = Object.values(validation.errors || {})[0];
      setError(firstError);
      return;
    }

    // Attempt login
    try {
      const result = await loginMutation.mutateAsync(validation.data as any);
      const { user, accessToken, requires2FA } = result as AuthResponse;

      if (requires2FA) {
        setShow2FA(true);
        showToast.success("Please enter your 2FA code");
      } else {
        setAuth(user, accessToken, user.role || "USER", (result as any).refreshToken);
        showToast.success(`Welcome back, ${user.name}!`);

        // Priority 1: pending invite token — from backend DB lookup only (works cross-device)
        const pendingInviteToken = (user as any).pendingInviteToken || null;

        if (pendingInviteToken) {
          router.replace(`/invite/accept?token=${pendingInviteToken}`);
          return;
        }

        // Priority 2: explicit redirect param
        const redirectUrl = searchParams?.get("redirect");
        if (redirectUrl) {
          router.replace(redirectUrl);
          return;
        }

        // Priority 3: route based on onboarding status
        const shouldOnboard =
          !user.onboardingCompleted &&
          !(user as any).activeWorkspaceId &&
          !(user as any).skipOnboarding;

        router.replace(shouldOnboard ? "/onboarding" : "/dashboard");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Extract the error message from the response
      const errorMessage = err?.response?.data?.message || err?.message || "Invalid email or password";
      
      console.log('Error message to display:', errorMessage);
      
      setError(errorMessage);
      showToast.error(errorMessage);
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (tfaCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    // TODO: Implement 2FA verification with backend
    // For now, show error that 2FA is not yet implemented
    setError("2FA verification will be implemented with backend integration");
    showToast.error("2FA not yet implemented");
  };

  const handleBack2FA = () => {
    setShow2FA(false);
    setTfaCode("");
    setError("");
  };

  return (
    <div>
      <LoginHeader isVerified={isVerified} message={message} />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {loginMutation.isPending && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2">
          <LoadingSpinner size="sm" color="primary" />
          <span className="text-sm text-blue-700 font-medium">
            Signing you in...
          </span>
        </div>
      )}

      {show2FA ? (
        <TwoFactorForm
          tfaCode={tfaCode}
          onCodeChange={setTfaCode}
          onSubmit={handle2FASubmit}
          onBack={handleBack2FA}
        />
      ) : (
        <>
          <LoginForm
            email={formData.email}
            password={formData.password}
            showPassword={showPassword}
            onEmailChange={(email) => handleFieldChange("email", email)}
            onPasswordChange={(password) =>
              handleFieldChange("password", password)
            }
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleSubmit}
            disabled={loginMutation.isPending}
            emailError={touchedFields.email ? fieldErrors.email : ""}
            passwordError={touchedFields.password ? fieldErrors.password : ""}
            onEmailBlur={() => handleFieldBlur("email")}
            onPasswordBlur={() => handleFieldBlur("password")}
          />

          <SocialLogin />

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href={(() => {
                const token = searchParams.get("inviteToken");
                if (token) return `/signup?inviteToken=${encodeURIComponent(token)}`;
                if (searchParams.get("redirect")) return `/signup?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`;
                return "/signup";
              })()}
              className="font-bold text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
