"use client";

import { Mail, RefreshCcw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useVerifyEmail, useResendVerificationEmail } from "@/hooks/api";
import { showToast } from "@/lib/toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { WebViewDetector } from "@/components/WebViewDetector";

// 4 UI States
type VerifyEmailState = 'EMAIL_SENT' | 'CAN_RESEND' | 'LINK_EXPIRED' | 'VERIFIED' | 'FIRST_VISIT';

const VERIFICATION_EMAIL_KEY = 'verificationEmailSentAt';
const VERIFICATION_EMAIL_ADDRESS_KEY = 'verificationEmailAddress';
const HAS_SENT_EMAIL_KEY = 'hasEverSentVerificationEmail';
const EMAIL_EXPIRY_SECONDS = 60;

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams?.get("email") || "";
    const token = searchParams?.get("token") || "";

    const [email, setEmail] = useState(emailParam);
    const [state, setState] = useState<VerifyEmailState>('FIRST_VISIT');
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState("");
    const [hasEverSentEmail, setHasEverSentEmail] = useState(false);
    const [isLoadingEmail, setIsLoadingEmail] = useState(false);

    const emailRef = useRef(email);
    const hasVerified = useRef(false); // Prevent double-fire in React StrictMode

    const verifyEmailMutation = useVerifyEmail();
    const resendEmailMutation = useResendVerificationEmail();

    // Keep ref in sync with state
    useEffect(() => {
        emailRef.current = email;
    }, [email]);

    // Initialize state based on URL and localStorage
    useEffect(() => {
        const initializePage = async () => {
            if (token) {
                // Prevent double-fire in React StrictMode
                if (hasVerified.current) {
                    console.log('Already verified, skipping duplicate call');
                    return;
                }
                hasVerified.current = true;

                let fetchedEmail = email;

                // If we have token but no email, fetch email from backend first
                if (!fetchedEmail) {
                    setIsLoadingEmail(true);
                    console.log('Token present but no email, fetching from backend...');
                    try {
                        const response = await fetch(`/api/v1/auth/email-from-token?token=${token}`);
                        if (response.ok) {
                            const data = await response.json();
                            console.log('Email fetch response:', data);
                            if (data.email) {
                                console.log('Setting email from backend:', data.email);
                                fetchedEmail = data.email;
                                setEmail(data.email);
                                emailRef.current = data.email;
                            }
                        } else {
                            console.error('Failed to fetch email, status:', response.status);
                        }
                    } catch (err) {
                        console.error('Failed to fetch email:', err);
                    } finally {
                        setIsLoadingEmail(false);
                    }
                } else {
                    setIsLoadingEmail(false);
                }

                // User clicked a verification link - verify it
                verifyEmailMutation.mutate(token, {
                    onSuccess: async (response) => {
                        setState('VERIFIED');
                        showToast.success("Account created successfully! Redirecting to login...");
                        // Clear verification-related localStorage and sessionStorage
                        localStorage.removeItem(VERIFICATION_EMAIL_KEY);
                        localStorage.removeItem(VERIFICATION_EMAIL_ADDRESS_KEY);
                        localStorage.removeItem(HAS_SENT_EMAIL_KEY);
                        sessionStorage.removeItem('pendingRegistration');

                        // Redirect to login — token will be returned by backend on login
                        const redirectUrl = searchParams?.get('redirect');
                        setTimeout(() => {
                            if (redirectUrl) {
                                router.push(redirectUrl);
                            } else {
                                router.push("/login?verified=true");
                            }
                        }, 1500);
                    },
                    onError: (error: any) => {
                        console.log('Verification error:', error);

                        const errorData = error?.response?.data;
                        const errorMessage = errorData?.message || error?.message || "Email verification failed.";

                        // Try to extract email from error if we still don't have it
                        const errorEmail = errorData?.email || errorData?.data?.email;

                        if (errorEmail && !fetchedEmail) {
                            console.log('Setting email from error:', errorEmail);
                            setEmail(errorEmail);
                            emailRef.current = errorEmail;
                        }

                        setError(errorMessage);

                        // Check if link expired or already used
                        if (errorMessage.includes('expired')) {
                            setState('LINK_EXPIRED');
                            setHasEverSentEmail(true);
                            localStorage.setItem(HAS_SENT_EMAIL_KEY, 'true');
                        } else if (errorMessage.includes('Invalid verification token')) {
                            // Token doesn't exist - could be already verified or invalid
                            setState('LINK_EXPIRED');
                            setError('This verification link has already been used or is no longer valid. If you already verified your email, please go to the login page.');
                            setHasEverSentEmail(true);
                            localStorage.setItem(HAS_SENT_EMAIL_KEY, 'true');

                            // Show a button to go to login
                            setTimeout(() => {
                                showToast.info('If you already verified your email, you can login now.');
                            }, 1000);
                        } else {
                            setState('CAN_RESEND');
                            setHasEverSentEmail(true);
                            localStorage.setItem(HAS_SENT_EMAIL_KEY, 'true');
                            showToast.error(errorMessage);
                        }
                    }
                });
            } else if (email) {
                // Check if the stored email matches the current email
                const storedEmail = localStorage.getItem(VERIFICATION_EMAIL_ADDRESS_KEY);

                if (storedEmail && storedEmail !== email) {
                    // Email has changed - clear old countdown data
                    console.log('Email changed from', storedEmail, 'to', email, '- clearing old countdown');
                    localStorage.removeItem(VERIFICATION_EMAIL_KEY);
                    localStorage.removeItem(VERIFICATION_EMAIL_ADDRESS_KEY);
                    localStorage.removeItem(HAS_SENT_EMAIL_KEY);
                }

                // Check if email was ever sent before (from localStorage)
                // Only count it if the stored email matches the current email
                const hasSentBefore = localStorage.getItem(HAS_SENT_EMAIL_KEY) === 'true' 
                    && localStorage.getItem(VERIFICATION_EMAIL_ADDRESS_KEY) === email;
                setHasEverSentEmail(hasSentBefore);

                // Check if email was recently sent (from localStorage)
                const lastSentAt = localStorage.getItem(VERIFICATION_EMAIL_KEY);

                if (lastSentAt && storedEmail === email) {
                    const sentTimestamp = parseInt(lastSentAt, 10);
                    const now = Date.now();
                    const elapsedSeconds = Math.floor((now - sentTimestamp) / 1000);
                    const remainingSeconds = EMAIL_EXPIRY_SECONDS - elapsedSeconds;

                    if (remainingSeconds > 0) {
                        // Email was sent recently - resume countdown
                        setState('EMAIL_SENT');
                        setCountdown(remainingSeconds);
                    } else {
                        // Email expired - allow resend
                        setState('CAN_RESEND');
                        localStorage.removeItem(VERIFICATION_EMAIL_KEY);
                        localStorage.removeItem(VERIFICATION_EMAIL_ADDRESS_KEY);
                    }
                } else {
                    // No active email sending or email changed
                    if (hasSentBefore && storedEmail === email) {
                        // Email was sent before but expired - show resend
                        setState('CAN_RESEND');
                    } else {
                        // First visit - never sent email before
                        setState('FIRST_VISIT');
                    }
                }
            }
        };

        initializePage();
    }, []);

    // Countdown timer - only runs when state is EMAIL_SENT
    useEffect(() => {
        if (state === 'EMAIL_SENT' && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setState('CAN_RESEND');
                        localStorage.removeItem(VERIFICATION_EMAIL_KEY);
                        localStorage.removeItem(VERIFICATION_EMAIL_ADDRESS_KEY);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [state, countdown]);

    const handleResend = async () => {
        // Get inviteToken from URL if present
        const inviteToken = searchParams?.get('inviteToken') || '';
        let currentEmail = emailRef.current || email;
        console.log('handleResend called, email:', currentEmail, 'inviteToken:', inviteToken);

        // If we don't have email but have token, try to fetch it first
        if (!currentEmail && token) {
            console.log('No email available, fetching from token...');
            setIsLoadingEmail(true);
            try {
                const response = await fetch(`/api/v1/auth/email-from-token?token=${token}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.email) {
                        currentEmail = data.email;
                        setEmail(data.email);
                        emailRef.current = data.email;
                        console.log('Email fetched successfully:', currentEmail);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch email:', err);
            } finally {
                setIsLoadingEmail(false);
            }
        }

        if (!currentEmail) {
            console.error('Email is missing and could not be fetched!');
            showToast.error("Email address is required");
            return;
        }

        console.log('Sending verification email to:', currentEmail);
        setError("");
        
        resendEmailMutation.mutate({ email: currentEmail, inviteToken }, {
            onSuccess: (data: any) => {
                console.log('✅ Email sent successfully, updating state...');

                // If backend says session expired (user was deleted by cleanup), redirect to signup
                if (data?.expired) {
                    showToast.error("Session expired. Please sign up again.");
                    setTimeout(() => {
                        router.push('/signup');
                    }, 1500);
                    return;
                }
                
                // CRITICAL: Update React state FIRST (synchronous)
                setState('EMAIL_SENT');
                setCountdown(EMAIL_EXPIRY_SECONDS);
                setHasEverSentEmail(true);
                
                // Then update localStorage (also synchronous but happens after state)
                const timestamp = Date.now();
                localStorage.setItem(VERIFICATION_EMAIL_KEY, timestamp.toString());
                localStorage.setItem(VERIFICATION_EMAIL_ADDRESS_KEY, currentEmail);
                localStorage.setItem(HAS_SENT_EMAIL_KEY, 'true');
                
                console.log('✅ State updated to EMAIL_SENT, countdown:', EMAIL_EXPIRY_SECONDS);
                console.log('✅ LocalStorage updated:', {
                    timestamp,
                    email: currentEmail,
                    hasEverSent: true
                });
                
                // Show success toast after everything is set
                showToast.success("Verification email sent!");
            },
            onError: (error: any) => {
                console.error('❌ Email send failed:', error);
                const errorMessage = error?.response?.data?.message || error?.message || "Failed to resend verification email.";
                
                // Check if email is already verified
                if (errorMessage.includes('already verified') || errorMessage.includes('Email already verified')) {
                    showToast.success("Your email is already verified! Redirecting to login...");
                    setTimeout(() => {
                        router.push('/login?message=already-verified');
                    }, 1500);
                    return;
                }
                
                setError(errorMessage);
                showToast.error(errorMessage);
            }
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // If link is expired, show only the error message
    if (state === 'LINK_EXPIRED') {
        return (
            <>
                <WebViewDetector showMessage={true} autoRedirect={false} />
                <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 mb-6">
                    <Mail className="h-7 w-7 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Verification Link Expired</h2>
                <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700 font-medium">
                        Verification link has expired.
                    </p>
                    <p className="text-sm text-red-700 font-medium mt-2">
                        Resend Verification Email
                    </p>
                </div>
            </div>
            </>
        );
    }

    return (
        <>
            <WebViewDetector showMessage={true} autoRedirect={false} />
            <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-50 mb-6">
                <Mail className="h-7 w-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>

            {/* Description based on state */}
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                {state === 'VERIFIED' ? (
                    "Account created successfully! Your credentials are stored. Redirecting to login page..."
                ) : verifyEmailMutation.isPending ? (
                    "Verifying your email address..."
                ) : isLoadingEmail ? (
                    "Loading email information..."
                ) : state === 'EMAIL_SENT' ? (
                    <>
                        A verification email has been sent to{" "}
                        {email ? (
                            <span className="font-semibold text-gray-800">{email}</span>
                        ) : (
                            "your email address"
                        )}
                        . Please check your email and click the verification link.
                    </>
                ) : state === 'FIRST_VISIT' ? (
                    <>
                        Click the button below to send a verification email to{" "}
                        {email ? (
                            <span className="font-semibold text-gray-800">{email}</span>
                        ) : (
                            "your email address"
                        )}
                        .
                    </>
                ) : (
                    <>
                        Click the button below to resend the verification email to{" "}
                        {email ? (
                            <span className="font-semibold text-gray-800">{email}</span>
                        ) : (
                            "your email address"
                        )}
                        .
                    </>
                )}
            </p>

            {/* State: EMAIL_SENT - Show countdown */}
            {state === 'EMAIL_SENT' && countdown > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">
                        Verification link expires in: <span className="font-bold">{formatTime(countdown)}</span>
                    </p>
                </div>
            )}

            {/* Verifying spinner */}
            {verifyEmailMutation.isPending && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center gap-2">
                    <LoadingSpinner size="sm" color="primary" />
                    <span className="text-sm text-blue-700 font-medium">Verifying your email...</span>
                </div>
            )}

            {/* State: VERIFIED - Show success */}
            {state === 'VERIFIED' && (
                <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Account created successfully!</span>
                </div>
            )}

            {/* Send/Resend button - hide when verifying or verified */}
            {!verifyEmailMutation.isPending && state !== 'VERIFIED' && (
                <div className="mt-8 space-y-3">
                    <button
                        onClick={handleResend}
                        disabled={state === 'EMAIL_SENT' || resendEmailMutation.isPending || isLoadingEmail}
                        className={`w-full flex justify-center items-center gap-2 py-2.5 px-4 border rounded-lg text-sm font-bold transition-colors ${state === 'EMAIL_SENT'
                            ? 'border-green-200 bg-green-50 text-green-700 cursor-not-allowed'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed'
                            }`}
                    >
                        {isLoadingEmail ? (
                            <>
                                <LoadingSpinner size="sm" />
                                Loading...
                            </>
                        ) : resendEmailMutation.isPending ? (
                            <>
                                <LoadingSpinner size="sm" />
                                Sending...
                            </>
                        ) : state === 'EMAIL_SENT' ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Verification email sent!
                            </>
                        ) : (
                            <>
                                <RefreshCcw className="w-4 h-4" />
                                {hasEverSentEmail && state !== 'FIRST_VISIT' ? 'Resend Verification Email' : 'Send Verification Email'}
                            </>
                        )}
                    </button>

                    {/* Show "Go to Login" button if link is already used */}
                    {error.includes('already been used') && (
                        <button
                            onClick={() => router.push('/login')}
                            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                            Go to Login
                        </button>
                    )}
                </div>
            )}

            <p className="mt-8 text-sm text-gray-500">
                Wrong email?{" "}
                <button
                    onClick={async () => {
                        const currentEmail = emailRef.current || email;
                        console.log('Cancelling unverified account for:', currentEmail);

                        if (currentEmail) {
                            try {
                                const response = await fetch(`/api/v1/auth/cancel-unverified`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ email: currentEmail })
                                });

                                const data = await response.json();
                                console.log('Cancel response:', data);

                                if (response.ok) {
                                    showToast.success('Account cancelled. You can now sign up with a different email.');
                                    // Clear all localStorage
                                    localStorage.removeItem(VERIFICATION_EMAIL_KEY);
                                    localStorage.removeItem(VERIFICATION_EMAIL_ADDRESS_KEY);
                                    localStorage.removeItem(HAS_SENT_EMAIL_KEY);
                                } else {
                                    console.error('Failed to cancel:', data);
                                }
                            } catch (error) {
                                console.error('Failed to cancel account:', error);
                            }
                        }
                        router.push('/signup');
                    }}
                    className="font-bold text-blue-600 hover:text-blue-500 cursor-pointer"
                >
                    Change it here
                </button>
            </p>
        </div>
        </>
    );
}
