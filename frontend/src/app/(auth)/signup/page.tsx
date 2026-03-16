"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRegister } from "@/hooks/api";
import { registerSchema, validateData } from "@/lib/validation.schemas";
import { showToast } from "@/lib/toast";
import { Mail, User } from "lucide-react";
import PasswordInput from "@/components/auth/PasswordInput";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/store/useAuthStore";
import { FormFieldError } from "@/components/ui/FormError";

export default function SignUpPage() {
    const searchParams = useSearchParams();
    const redirectUrl = searchParams?.get('redirect');
    const inviteToken = searchParams?.get('inviteToken');

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        inviteToken: inviteToken || undefined,
    });
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

    const validationTimeoutRef = useRef<NodeJS.Timeout>();

    const router = useRouter();
    const registerMutation = useRegister();

    const validateField = (fieldName: string, value: string) => {
        let errorMessage = '';

        switch (fieldName) {
            case 'firstName':
                if (!value || value.trim().length === 0) {
                    errorMessage = 'First name is required';
                } else if (value.length < 2) {
                    errorMessage = 'First name must be at least 2 characters';
                }
                break;

            case 'lastName':
                if (!value || value.trim().length === 0) {
                    errorMessage = 'Last name is required';
                } else if (value.length < 2) {
                    errorMessage = 'Last name must be at least 2 characters';
                }
                break;

            case 'email':
                if (!value || value.trim().length === 0) {
                    errorMessage = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorMessage = 'Invalid email address';
                }
                break;

            case 'password':
                if (!value || value.trim().length === 0) {
                    errorMessage = 'Password is required';
                }
                break;
        }

        if (errorMessage) {
            setFieldErrors(prev => ({
                ...prev,
                [fieldName]: errorMessage
            }));
        } else {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const handleFieldChange = (fieldName: string, value: string) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));

        if (!touchedFields[fieldName] && value.length > 0) {
            setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
        }

        if (validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current);
        }

        validationTimeoutRef.current = setTimeout(() => {
            if (touchedFields[fieldName] || value.length > 0) {
                validateField(fieldName, value);
            }
        }, 300);
    };

    const handleBlur = (fieldName: string) => {
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
        if (validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current);
        }
        validateField(fieldName, formData[fieldName as keyof typeof formData]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        setTouchedFields({
            firstName: true,
            lastName: true,
            email: true,
            password: true,
        });

        validateField('firstName', formData.firstName);
        validateField('lastName', formData.lastName);
        validateField('email', formData.email);
        validateField('password', formData.password);

        const validation = validateData(registerSchema, formData);
        if (!validation.success) {
            setFieldErrors(validation.errors || {});
            const firstError = Object.values(validation.errors || {})[0];
            showToast.error(firstError);
            return;
        }

        registerMutation.mutate({ data: formData as any, inviteToken: inviteToken || undefined }, {
            onSuccess: (response) => {
                showToast.success("Account created! Click 'Send Verification Email' to continue.");
                // Store registration data so resend can recreate the user if cleanup deleted them
                sessionStorage.setItem('pendingRegistration', JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password,
                    inviteToken: inviteToken || undefined,
                }));
                const verifyUrl = `/verify-email?email=${encodeURIComponent(response.user.email)}${
                    inviteToken ? `&inviteToken=${encodeURIComponent(inviteToken)}` : ''
                }${
                    (searchParams && searchParams.get('redirect')) ? `&redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''
                }`;
                router.push(verifyUrl);
            },
            onError: (error: any) => {
                const errorMessage = error?.response?.data?.message || error?.message || "Registration failed. Please try again.";
                
                // Check if account already exists
                if (errorMessage.includes('already exists')) {
                    setError(errorMessage);
                    showToast.error(errorMessage);
                    // Show a link to login page
                    setTimeout(() => {
                        showToast.info('Please use the login page to access your account.');
                    }, 1000);
                } else {
                    setError(errorMessage);
                    showToast.error(errorMessage);
                }
            }
        });
    };

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                <p className="mt-2 text-sm text-gray-500">
                    Start managing your projects visually today.
                </p>
            </div>

            {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                        {error.includes('already exists') && (
                            <Link 
                                href="/login" 
                                className="mt-2 inline-block text-sm text-red-600 hover:text-red-500 font-bold underline"
                            >
                                Go to Login Page →
                            </Link>
                        )}
                    </div>
                )}

                {registerMutation.isPending && (
                    <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2">
                        <LoadingSpinner size="sm" color="primary" />
                        <span className="text-sm text-blue-700 font-medium">Creating your account...</span>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <div className="mt-1 relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    disabled={registerMutation.isPending}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${touchedFields.firstName && fieldErrors.firstName
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300'
                                        }`}
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                    onBlur={() => handleBlur('firstName')}
                                />
                            </div>
                            <FormFieldError message={touchedFields.firstName && fieldErrors.firstName ? fieldErrors.firstName : undefined} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <div className="mt-1 relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    disabled={registerMutation.isPending}
                                    className={`w-full pl-10 pr-3 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${touchedFields.lastName && fieldErrors.lastName
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300'
                                        }`}
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                    onBlur={() => handleBlur('lastName')}
                                />
                            </div>
                            <FormFieldError message={touchedFields.lastName && fieldErrors.lastName ? fieldErrors.lastName : undefined} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email address</label>
                        <div className="mt-1 relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="email"
                                disabled={registerMutation.isPending}
                                className={`w-full pl-10 pr-3 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${touchedFields.email && fieldErrors.email
                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300'
                                    }`}
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => handleFieldChange('email', e.target.value)}
                                onBlur={() => handleBlur('email')}
                            />
                        </div>
                        <FormFieldError message={touchedFields.email && fieldErrors.email ? fieldErrors.email : undefined} />
                    </div>

                    <div>
                        <PasswordInput
                            value={formData.password}
                            onChange={(value) => handleFieldChange('password', value)}
                            email={formData.email}
                            showValidation={true}
                            placeholder="Create a strong password"
                            label="Password"
                            onValidationChange={setIsPasswordValid}
                            onBlur={() => handleBlur('password')}
                        />
                        <FormFieldError message={touchedFields.password && fieldErrors.password ? fieldErrors.password : undefined} />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                        >
                            {registerMutation.isPending ? "Creating Account..." : "Sign Up"}
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button className="w-full flex justify-center items-center gap-3 py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500">
                        Login
                    </Link>
                </p>
        </div>
    );
}
