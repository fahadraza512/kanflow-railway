"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, CreditCard, Loader2 } from "lucide-react";
import { showToast } from "@/lib/toast";

function DummyCheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const [sessionData, setSessionData] = useState<any>(null);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        // Parse session data from URL
        const encodedData = searchParams.get('data');
        if (encodedData) {
            try {
                const decoded = JSON.parse(Buffer.from(encodedData, 'base64').toString());
                setSessionData(decoded);
                console.log('Dummy checkout session data:', decoded);
            } catch (error) {
                console.error('Failed to parse session data:', error);
                showToast.error('Invalid checkout session');
                router.push('/dashboard');
            }
        }
    }, [searchParams, router]);

    const handlePaymentSuccess = async () => {
        if (!sessionData) return;
        
        setIsProcessing(true);
        
        try {
            // Check if this is a pending workspace (needs to be created) or existing workspace (needs upgrade)
            const isPending = sessionData.isPending || !sessionData.workspaceId;
            
            let requestBody;
            if (isPending) {
                // Create new workspace as Pro
                console.log('Creating new Pro workspace after payment');
                requestBody = {
                    workspaceName: sessionData.workspaceName,
                    workspaceLogo: sessionData.workspaceLogo,
                    userId: sessionData.userId,
                    plan: sessionData.plan,
                    billingCycle: sessionData.billingCycle,
                };
            } else {
                // Upgrade existing workspace
                console.log('Upgrading existing workspace to Pro');
                requestBody = {
                    workspaceId: sessionData.workspaceId,
                    plan: sessionData.plan,
                    billingCycle: sessionData.billingCycle,
                };
            }
            
            // Call dummy webhook to process payment
            const apiUrl = '/api/v1';
            const response = await fetch(`${apiUrl}/stripe/dummy-webhook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(requestBody),
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast.success('Payment successful! ' + (isPending ? 'Creating your Pro workspace...' : 'Upgrading to Pro plan...'));
                
                // If workspace was created, save it to localStorage
                if (isPending && data.workspace) {
                    const workspace = data.workspace;
                    const workspaceToSave = {
                        id: workspace.id,
                        name: workspace.name,
                        description: workspace.description || '',
                        createdBy: workspace.ownerId,
                        plan: 'pro',
                        icon: workspace.logo,
                        createdAt: workspace.createdAt,
                    };
                    
                    // Save to localStorage
                    const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
                    workspaces.push(workspaceToSave);
                    localStorage.setItem('workspaces', JSON.stringify(workspaces));
                    localStorage.setItem('activeWorkspace', String(workspace.id));
                    
                    // Save workspace details for onboarding to load when returning
                    localStorage.setItem('pendingWorkspaceData', JSON.stringify({
                        id: workspace.id,
                        name: workspace.name,
                        plan: 'pro',
                        logo: workspace.logo,
                    }));
                    
                    // DO NOT mark onboarding as complete here - let user click "Get Started" button
                    // localStorage.setItem('onboardingComplete', 'true');
                    
                    console.log('Pro workspace created and saved:', workspace);
                }
                
                // Start countdown
                let count = 3;
                const interval = setInterval(() => {
                    count--;
                    setCountdown(count);
                    if (count === 0) {
                        clearInterval(interval);
                        // Pro plan payment successful - return to onboarding to show Get Started step
                        const returnUrl = sessionData?.returnUrl || '/onboarding';
                        router.push(`${returnUrl}?payment=success`);
                    }
                }, 1000);
            } else {
                throw new Error('Payment processing failed');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            showToast.error('Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    const handlePaymentCancel = () => {
        showToast.info('Payment cancelled');
        const returnUrl = sessionData?.returnUrl || '/dashboard';
        router.push(`${returnUrl}?payment=cancelled`);
    };

    if (!sessionData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading checkout session...</p>
                </div>
            </div>
        );
    }

    if (isProcessing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-6">
                        Your workspace is being upgraded to Pro plan...
                    </p>
                    <div className="text-4xl font-bold text-blue-600 mb-2">{countdown}</div>
                    <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    const price = sessionData.billingCycle === 'annual' ? '$144' : '$15';
    const period = sessionData.billingCycle === 'annual' ? 'year' : 'month';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-8 h-8" />
                        <h1 className="text-2xl font-bold">Dummy Checkout</h1>
                    </div>
                    <p className="text-blue-100 text-sm">
                        This is a simulated payment page for testing purposes
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Warning Banner */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <div className="text-yellow-600 mt-0.5">⚠️</div>
                            <div>
                                <h3 className="font-semibold text-yellow-900 mb-1">Test Mode</h3>
                                <p className="text-sm text-yellow-800">
                                    This is a dummy payment page. No real payment will be processed. 
                                    Click "Complete Payment" to simulate a successful payment.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border border-gray-200 rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                        
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Plan</span>
                                <span className="font-semibold text-gray-900">Pro Plan</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Billing Cycle</span>
                                <span className="font-semibold text-gray-900 capitalize">{sessionData.billingCycle}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 flex justify-between">
                                <span className="text-gray-900 font-semibold">Total</span>
                                <span className="text-2xl font-bold text-gray-900">{price}/{period}</span>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">What you'll get:</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Unlimited boards
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Advanced analytics
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Premium integrations
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Priority support
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handlePaymentSuccess}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" />
                            Complete Payment (Dummy)
                        </button>
                        <button
                            onClick={handlePaymentCancel}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-5 h-5" />
                            Cancel
                        </button>
                    </div>

                    {/* Info Text */}
                    <p className="text-xs text-gray-500 text-center mt-4">
                        In production, this would be a real Stripe checkout page
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function DummyCheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <DummyCheckoutContent />
        </Suspense>
    );
}
