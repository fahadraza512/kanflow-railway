"use client";

import { X } from "lucide-react";
import { useUpgrade } from "@/hooks/useUpgrade";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import UpgradeSummary from "../upgrade/UpgradeSummary";
import PlanSelection from "../upgrade/PlanSelection";
import CheckoutForm from "../upgrade/CheckoutForm";
import SuccessScreen from "../upgrade/SuccessScreen";
import AlreadySubscribedScreen from "../upgrade/AlreadySubscribedScreen";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    isOnboarding?: boolean;
    onUpgrade?: () => Promise<void>; // Optional custom upgrade handler
    workspaceName?: string; // Optional workspace name override (for new workspaces)
}

export default function UpgradeModal({ isOpen, onClose, onSuccess, isOnboarding = false, onUpgrade, workspaceName: workspaceNameProp }: UpgradeModalProps) {
    const {
        step,
        setStep,
        billingCycle,
        setBillingCycle,
        workspaceName: workspaceNameFromHook,
        isProcessing,
        handleUpgrade: defaultHandleUpgrade
    } = useUpgrade(isOpen, isOnboarding);
    
    const modalRef = useRef<HTMLDivElement>(null);
    
    // Use prop workspace name if provided, otherwise use the one from hook
    const workspaceName = workspaceNameProp || workspaceNameFromHook;

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const handleSuccess = () => {
        onClose();
        onSuccess();
    };
    
    // Use custom upgrade handler if provided, otherwise use default
    const handleUpgradeClick = onUpgrade || defaultHandleUpgrade;

    const modalContent = (
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            style={{ margin: 0 }}
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-lg w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden"
            >
                {step !== "success" && (
                    <div className="absolute top-2 right-2 z-10">
                        <button 
                            onClick={onClose} 
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-md"
                            aria-label="Close modal"
                        >
                            <X className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row h-full overflow-y-auto">
                    <UpgradeSummary workspaceName={workspaceName} />

                    <div className="flex-1 p-4 sm:p-5 bg-white overflow-y-auto">
                        {step === "plans" && (
                            <PlanSelection
                                billingCycle={billingCycle}
                                onBillingCycleChange={setBillingCycle}
                                onContinue={() => setStep("checkout")}
                            />
                        )}

                        {step === "checkout" && (
                            <CheckoutForm
                                billingCycle={billingCycle}
                                isProcessing={isProcessing}
                                onSubmit={handleUpgradeClick}
                                onBack={() => setStep("plans")}
                            />
                        )}

                        {step === "success" && (
                            <SuccessScreen onClose={handleSuccess} />
                        )}

                        {step === "already-subscribed" && (
                            <AlreadySubscribedScreen onClose={onClose} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Render modal in a portal at document.body level to avoid z-index stacking issues
    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
