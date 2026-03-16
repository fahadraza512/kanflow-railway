"use client";

import { useState } from "react";
import { X, Mail, UserPlus } from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/useAuthStore";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (email: string, role: "ADMIN" | "PROJECT_MANAGER" | "MEMBER" | "VIEWER") => void;
    workspaceName?: string;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess, workspaceName }: AddMemberModalProps) {
    const { user } = useAuthStore();
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"ADMIN" | "PROJECT_MANAGER" | "MEMBER" | "VIEWER">("MEMBER");
    const [isSending, setIsSending] = useState(false);
    const [emailError, setEmailError] = useState("");

    if (!isOpen) return null;

    const validateEmail = (value: string) => {
        if (!value.trim()) {
            setEmailError("Email is required");
            return false;
        }
        
        // Check if trying to add self
        if (user?.email && value.toLowerCase() === user.email.toLowerCase()) {
            setEmailError("You cannot add yourself");
            return false;
        }
        
        // Check for valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError("Please enter a valid email address");
            return false;
        }
        
        setEmailError("");
        return true;
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        validateEmail(value);
    };

    const handleAddMember = () => {
        if (!validateEmail(email)) return;
        
        setIsSending(true);
        // Add member directly to workspace
        setTimeout(() => {
            onSuccess(email, role);
            setIsSending(false);
            setEmail("");
            setEmailError("");
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-xs shadow-lg border border-gray-200">
                <div className="p-3">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                                <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">Add Member</h2>
                                {workspaceName ? (
                                    <p className="text-[10px] text-gray-500">
                                        Add to <span className="font-semibold text-blue-600">{workspaceName}</span>
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-gray-500">Add a new team member to your workspace</p>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <X className="w-3 h-3 text-gray-400" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        {/* Email Input */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    onBlur={() => validateEmail(email)}
                                    placeholder="colleague@example.com"
                                    className={clsx(
                                        "w-full pl-7 pr-2 py-1.5 bg-gray-50 border rounded-lg text-[10px] focus:outline-none focus:ring-2 transition-colors",
                                        emailError
                                            ? "border-red-300 focus:ring-red-500"
                                            : "border-gray-200 focus:ring-blue-500"
                                    )}
                                />
                            </div>
                            {emailError && (
                                <p className="text-[9px] text-red-600 font-medium">{emailError}</p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">Role</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {[
                                    { value: "VIEWER", label: "Viewer", desc: "Read-only access" },
                                    { value: "MEMBER", label: "Member", desc: "Edit own tasks" },
                                    { value: "PROJECT_MANAGER", label: "Project Manager", desc: "Create projects" },
                                    { value: "ADMIN", label: "Admin", desc: "Full access" }
                                ].map((r) => (
                                    <button
                                        key={r.value}
                                        onClick={() => setRole(r.value as typeof role)}
                                        className={clsx(
                                            "p-1.5 rounded-lg border text-left transition-colors",
                                            role === r.value
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <div className="text-[10px] font-semibold text-gray-900">{r.label}</div>
                                        <div className="text-[9px] text-gray-500 mt-0.5">{r.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={onClose}
                                className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMember}
                                disabled={!email.trim() || emailError || isSending}
                                className={clsx(
                                    "flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors",
                                    !email.trim() || emailError || isSending
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                )}
                            >
                                {isSending ? "Adding..." : "Add Member"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
