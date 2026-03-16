"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Building2, Mail, Users, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { getActiveWorkspace, getWorkspaceById } from "@/lib/storage";

interface ContactSalesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    workspaceData?: {
        workspaceId: string;
        workspaceName: string;
    } | null;
    isExistingWorkspace?: boolean; // true = from /settings/billing, false = from /onboarding or /dashboard/plan
}

export default function ContactSalesModal({ isOpen, onClose, onSuccess, workspaceData, isExistingWorkspace = false }: ContactSalesModalProps) {
    const [formData, setFormData] = useState({
        fullName: "",
        workEmail: "",
        companyName: "",
        teamSize: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [workspaceName, setWorkspaceName] = useState<string>("");
    const [workspaceId, setWorkspaceId] = useState<string>("");
    const [showCloseWarning, setShowCloseWarning] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

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

    // Load workspace name when modal opens
    useEffect(() => {
        if (isOpen) {
            // First, try to use passed workspaceData (for dashboard flow)
            if (workspaceData) {
                setWorkspaceName(workspaceData.workspaceName);
                setWorkspaceId(workspaceData.workspaceId);
            } else {
                // Fallback to active workspace (for existing users from settings/billing)
                const activeWsId = getActiveWorkspace();
                if (activeWsId) {
                    const workspace = getWorkspaceById(activeWsId);
                    if (workspace) {
                        setWorkspaceName(workspace.name);
                        setWorkspaceId(workspace.id.toString());
                    }
                }
            }
        } else {
            setWorkspaceName("");
            setWorkspaceId("");
        }
    }, [isOpen, workspaceData]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const apiUrl = '/api/v1';
            const response = await fetch(`${apiUrl}/sales/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    workspaceName,
                    workspaceId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to submit contact request');
            }

            const result = await response.json();
            
            setIsSubmitting(false);
            
            // Reset form
            setFormData({
                fullName: "",
                workEmail: "",
                companyName: "",
                teamSize: "",
                message: ""
            });
            
            // Call onSuccess which will redirect to dashboard
            onSuccess();
        } catch (error) {
            console.error('Error submitting contact request:', error);
            setIsSubmitting(false);
            alert('Failed to submit contact request. Please try again.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const isFormValid = formData.fullName && formData.workEmail && formData.companyName && formData.teamSize;

    const handleClose = () => {
        // If form has data but not submitted, show warning
        if (!isExistingWorkspace && (formData.fullName || formData.workEmail || formData.companyName)) {
            setShowCloseWarning(true);
        } else {
            onClose();
        }
    };

    const handleConfirmClose = () => {
        setShowCloseWarning(false);
        onClose();
    };

    const handleCancelClose = () => {
        setShowCloseWarning(false);
    };

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div 
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className="bg-white rounded-lg w-full max-w-md max-h-[90vh] shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col"
            >
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-3 text-white overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                </div>
                                <h3 className="text-sm font-bold">Contact Sales</h3>
                            </div>
                            <p className="text-[11px] text-gray-300">Get custom Enterprise pricing for your team</p>
                            {workspaceName && (
                                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                                    <Building2 className="w-3 h-3 text-blue-300" />
                                    <span className="text-[11px] font-medium text-white">{workspaceName}</span>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleClose}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Form Container */}
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <form id="contact-sales-form" onSubmit={handleSubmit} className="p-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white">
                    {/* Workspace Name - Read Only */}
                    <div>
                        <label htmlFor="workspaceName" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                            <div className="w-1 h-3.5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                            Workspace Name
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                id="workspaceName"
                                name="workspaceName"
                                value={workspaceName}
                                readOnly
                                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 cursor-not-allowed shadow-sm"
                            />
                        </div>
                        <p className="mt-0.5 text-[10px] text-gray-500">This is the workspace for your Enterprise request</p>
                    </div>

                    {/* Hidden Workspace ID */}
                    <input type="hidden" name="workspaceId" value={workspaceId} />

                    {/* Full Name */}
                    <div>
                        <label htmlFor="fullName" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                            <div className="w-1 h-3.5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:border-gray-300"
                        />
                    </div>

                    {/* Work Email */}
                    <div>
                        <label htmlFor="workEmail" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                            <div className="w-1 h-3.5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                            Work Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="email"
                                id="workEmail"
                                name="workEmail"
                                value={formData.workEmail}
                                onChange={handleChange}
                                placeholder="john@company.com"
                                required
                                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:border-gray-300"
                            />
                        </div>
                    </div>

                    {/* Company Name */}
                    <div>
                        <label htmlFor="companyName" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                            <div className="w-1 h-3.5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                            Company Name
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                id="companyName"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="Acme Inc."
                                required
                                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:border-gray-300"
                            />
                        </div>
                    </div>

                    {/* Team Size */}
                    <div>
                        <label htmlFor="teamSize" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                            <div className="w-1 h-3.5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                            Team Size
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <select
                                id="teamSize"
                                name="teamSize"
                                value={formData.teamSize}
                                onChange={handleChange}
                                required
                                className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer shadow-sm hover:border-gray-300 appearance-none"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                            >
                                <option value="">Select team size</option>
                                <option value="1-10">1-10 members</option>
                                <option value="11-50">11-50 members</option>
                                <option value="51-200">51-200 members</option>
                                <option value="201-500">201-500 members</option>
                                <option value="500+">500+ members</option>
                            </select>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label htmlFor="message" className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                            <div className="w-1 h-3.5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                            Message <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Tell us about your needs..."
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none shadow-sm hover:border-gray-300"
                        />
                    </div>

                    {/* Important Notice */}
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-2.5">
                        <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center mt-0.5">
                                <span className="text-white text-[10px] font-bold">⚠</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xs font-bold text-amber-900 mb-0.5">Important:</h4>
                                {isExistingWorkspace ? (
                                    // Message for existing workspace (from /settings/billing)
                                    <ul className="text-[10px] text-amber-800 space-y-0.5 leading-relaxed">
                                        <li className="flex items-start gap-1.5">
                                            <span className="text-amber-600 mt-0.5">•</span>
                                            <span>This request is for your <strong>existing workspace</strong>.</span>
                                        </li>
                                        <li className="flex items-start gap-1.5">
                                            <span className="text-amber-600 mt-0.5">•</span>
                                            <span>Your workspace will <strong>remain on its current plan</strong> until the Kanban Flow team contacts you.</span>
                                        </li>
                                        <li className="flex items-start gap-1.5">
                                            <span className="text-amber-600 mt-0.5">•</span>
                                            <span>The sales team will reach out to discuss Enterprise pricing and features.</span>
                                        </li>
                                    </ul>
                                ) : (
                                    // Message for new workspace (from /onboarding or /dashboard/plan)
                                    <ul className="text-[10px] text-amber-800 space-y-0.5 leading-relaxed">
                                        <li className="flex items-start gap-1.5">
                                            <span className="text-amber-600 mt-0.5">•</span>
                                            <span><strong>Do NOT delete this workspace</strong> after submitting the Enterprise request.</span>
                                        </li>
                                        <li className="flex items-start gap-1.5">
                                            <span className="text-amber-600 mt-0.5">•</span>
                                            <span>After submission, your workspace will automatically continue on the <strong>Free plan</strong> until the Kanban Flow team contacts you regarding the Enterprise plan.</span>
                                        </li>
                                        <li className="flex items-start gap-1.5">
                                            <span className="text-amber-600 mt-0.5">•</span>
                                            <span>You may upgrade this same workspace to the <strong>Pro plan</strong> anytime after submitting the form from <a href="/settings/billing" className="text-blue-600 hover:underline font-semibold">Settings → Billing</a>.</span>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                    </form>
                </div>

                {/* Sticky Footer with Buttons */}
                <div className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-1.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all text-xs shadow-sm"
                        >
                            {isExistingWorkspace ? "Cancel" : "Skip for Now"}
                        </button>
                        <button
                            type="submit"
                            form="contact-sales-form"
                            disabled={!isFormValid || isSubmitting}
                            className={clsx(
                                "flex-1 px-4 py-1.5 font-semibold rounded-lg transition-all text-xs shadow-md relative overflow-hidden",
                                isFormValid && !isSubmitting
                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            {isFormValid && !isSubmitting && (
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 hover:opacity-100 transition-opacity"></div>
                            )}
                            <span className="relative z-10">
                                {isSubmitting ? "Sending..." : "Submit Request"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Close Warning Modal */}
            {showCloseWarning && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-amber-600 text-xl">⚠️</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Close Without Submitting?</h3>
                                <p className="text-sm text-gray-600">
                                    Your workspace will be created on the <strong>Free plan</strong>. Our sales team won't be notified about your Enterprise interest.
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-blue-800">
                                <strong>💡 You can contact sales later:</strong> Go to Settings → Billing → Contact Sales anytime.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleCancelClose}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                Continue Filling
                            </button>
                            <button
                                onClick={handleConfirmClose}
                                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                Close Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Render modal in a portal at document.body level to avoid z-index stacking issues
    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
