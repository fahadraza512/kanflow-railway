"use client";

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { validatePassword, getStrengthColor, getStrengthPercentage, PasswordValidationResult } from '@/lib/passwordValidation';
import { FormFieldError } from '@/components/ui/FormError';

interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    email?: string;
    showValidation?: boolean;
    placeholder?: string;
    label?: string;
    onValidationChange?: (isValid: boolean) => void;
    onBlur?: () => void;
}

export default function PasswordInput({
    value,
    onChange,
    email,
    showValidation = true,
    placeholder = "Enter your password",
    label = "Password",
    onValidationChange,
    onBlur
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [validation, setValidation] = useState<PasswordValidationResult | null>(null);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        if (value) {
            const result = validatePassword(value, email);
            setValidation(result);
            onValidationChange?.(result.isValid);
        } else {
            setValidation(null);
            onValidationChange?.(false);
        }
    }, [value, email, onValidationChange]);

    const handleBlur = () => {
        setTouched(true);
        onBlur?.();
    };

    return (
        <div className="space-y-3">
            {/* Label */}
            <label className="block text-sm font-semibold text-gray-700">
                {label}
            </label>

            {/* Input Field */}
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                    ) : (
                        <Eye className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Password Strength Meter */}
            {showValidation && value && validation && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">Password Strength</span>
                        <span className={`text-xs font-bold uppercase tracking-wide ${
                            validation.strength === 'weak' ? 'text-red-600' :
                            validation.strength === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                        }`}>
                            {validation.strength}
                        </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <div
                            className={`h-full transition-all duration-300 rounded-full ${getStrengthColor(validation.strength)}`}
                            style={{ width: `${getStrengthPercentage(validation.strength)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Validation Checklist */}
            {showValidation && value && validation && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <p className="text-xs font-bold text-gray-800">Password Requirements</p>
                    </div>
                    
                    <div className="space-y-2">
                        <ValidationItem
                            checked={validation.checks.minLength}
                            label="At least 8 characters"
                        />
                        <ValidationItem
                            checked={validation.checks.hasUppercase}
                            label="One uppercase letter (A-Z)"
                        />
                        <ValidationItem
                            checked={validation.checks.hasLowercase}
                            label="One lowercase letter (a-z)"
                        />
                        <ValidationItem
                            checked={validation.checks.hasNumber}
                            label="One number (0-9)"
                        />
                        <ValidationItem
                            checked={validation.checks.hasSpecialChar}
                            label="One special character (!@#$%^&*)"
                        />
                        <ValidationItem
                            checked={validation.checks.notCommon}
                            label="Not a common password"
                        />
                        {email && (
                            <ValidationItem
                                checked={validation.checks.notContainsEmail}
                                label="Does not contain your email"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Error Messages */}
            {showValidation && touched && validation && !validation.isValid && (
                <FormFieldError 
                    message={validation.errors.join('. ')} 
                />
            )}

            {/* Helpful Tip */}
            {showValidation && value && validation && validation.isValid && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-3 shadow-sm">
                    <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-green-800">Great! Your password is strong</p>
                            <p className="text-xs text-green-700 mt-0.5">Make sure to remember it or store it securely</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ValidationItem({ checked, label }: { checked: boolean; label: string }) {
    return (
        <div className="flex items-center gap-2.5 group">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                checked 
                    ? 'bg-green-500 shadow-sm shadow-green-200' 
                    : 'bg-gray-200 group-hover:bg-gray-300'
            }`}>
                {checked ? (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
            </div>
            <span className={`text-xs font-medium transition-colors ${
                checked ? 'text-gray-800' : 'text-gray-500'
            }`}>
                {label}
            </span>
        </div>
    );
}
