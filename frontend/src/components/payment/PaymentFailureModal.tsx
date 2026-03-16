"use client";

import { X, AlertCircle, CreditCard, RefreshCw } from "lucide-react";

interface PaymentFailureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRetry: () => void;
    errorMessage?: string;
}

export default function PaymentFailureModal({ 
    isOpen, 
    onClose, 
    onRetry,
    errorMessage 
}: PaymentFailureModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-red-50 p-6 border-b border-red-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Payment Failed</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    We couldn't process your payment
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Error Message */}
                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-800 font-medium">
                                {errorMessage}
                            </p>
                        </div>
                    )}

                    {/* What Happened */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">What happened?</h3>
                        <p className="text-sm text-gray-600">
                            Your payment could not be processed. This might be due to:
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>Insufficient funds in your account</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>Card declined by your bank</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>Incorrect card details</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>Network or connection issue</span>
                            </li>
                        </ul>
                    </div>

                    {/* What's Next */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">What should I do?</h3>
                        <div className="space-y-2">
                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Try a different payment method</p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Use another card or payment option
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                <RefreshCw className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Contact your bank</p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Verify your card is enabled for online payments
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Status */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Your workspace status:</span> Your workspace remains on the <span className="font-bold text-gray-900">Free plan</span>. No charges were made.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={onRetry}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>

                {/* Support Link */}
                <div className="px-6 pb-6">
                    <p className="text-xs text-center text-gray-500">
                        Still having issues?{' '}
                        <a href="mailto:support@kanbanflow.com" className="text-blue-600 hover:underline font-medium">
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
