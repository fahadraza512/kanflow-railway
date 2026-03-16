import { useState, useEffect, useCallback, useRef } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (currentPassword: string, newPassword: string, confirmPassword: string) => void;
    isLoading?: boolean;
}

export default function ChangePasswordModal({ isOpen, onClose, onSubmit, isLoading }: ChangePasswordModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Password strength validation
    const [passwordStrength, setPasswordStrength] = useState({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false
    });

    const [passwordsMatch, setPasswordsMatch] = useState(true);

    useEffect(() => {
        const password = passwordData.newPassword;
        setPasswordStrength({
            hasMinLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    }, [passwordData.newPassword]);

    useEffect(() => {
        if (passwordData.confirmPassword) {
            setPasswordsMatch(passwordData.newPassword === passwordData.confirmPassword);
        } else {
            setPasswordsMatch(true);
        }
    }, [passwordData.newPassword, passwordData.confirmPassword]);

    const isPasswordValid = Object.values(passwordStrength).every(v => v) && passwordsMatch;

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isPasswordValid || isLoading) return;
        onSubmit(passwordData.currentPassword, passwordData.newPassword, passwordData.confirmPassword);
    }, [isPasswordValid, isLoading, passwordData, onSubmit]);

    const handleClose = useCallback(() => {
        if (isLoading) return;
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswords({ current: false, new: false, confirm: false });
        onClose();
    }, [isLoading, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            ref={modalRef}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onMouseDown={(e) => {
                if (e.target === modalRef.current && !isLoading) {
                    handleClose();
                }
            }}
        >
            <div 
                className="bg-white rounded-lg w-full max-w-sm shadow-md border border-gray-200"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                <div className="p-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        
                        {/* Password strength indicators */}
                        {passwordData.newPassword && (
                            <div className="mt-2 space-y-1">
                                <PasswordRequirement met={passwordStrength.hasMinLength} text="At least 8 characters" />
                                <PasswordRequirement met={passwordStrength.hasUpperCase} text="One uppercase letter" />
                                <PasswordRequirement met={passwordStrength.hasLowerCase} text="One lowercase letter" />
                                <PasswordRequirement met={passwordStrength.hasNumber} text="One number" />
                                <PasswordRequirement met={passwordStrength.hasSpecialChar} text="One special character" />
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        
                        {/* Password match indicator */}
                        {passwordData.confirmPassword && (
                            <div className="mt-2">
                                {passwordsMatch ? (
                                    <div className="flex items-center gap-1.5 text-xs text-green-600">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Passwords match</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs text-red-600">
                                        <X className="w-3.5 h-3.5" />
                                        <span>Passwords do not match</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-200 flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !isPasswordValid || !passwordData.currentPassword}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Changing..." : "Change Password"}
                    </button>
                </div>
                </form>
            </div>
        </div>
    );
}

// Helper component for password requirements
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
    return (
        <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
            {met ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>{text}</span>
        </div>
    );
}
