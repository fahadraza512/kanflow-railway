/**
 * Password Validation Utilities
 * Provides comprehensive password strength checking and validation
 */

export interface PasswordValidationResult {
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    errors: string[];
    checks: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecialChar: boolean;
        notCommon: boolean;
        notContainsEmail: boolean;
    };
}

// Common passwords to block
const COMMON_PASSWORDS = [
    '123456', '123456789', 'qwerty', 'password', '12345678',
    '111111', '123123', '1234567890', '1234567', 'password123',
    'abc123', '12345', 'password1', '1234', 'qwerty123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon'
];

/**
 * Validates password against security requirements
 */
export function validatePassword(
    password: string,
    email?: string
): PasswordValidationResult {
    const checks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        notCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
        notContainsEmail: email ? !password.toLowerCase().includes(email.split('@')[0].toLowerCase()) : true
    };

    const errors: string[] = [];
    
    if (!checks.minLength) errors.push('Password must be at least 8 characters');
    if (!checks.hasUppercase) errors.push('Must contain at least one uppercase letter');
    if (!checks.hasLowercase) errors.push('Must contain at least one lowercase letter');
    if (!checks.hasNumber) errors.push('Must contain at least one number');
    if (!checks.hasSpecialChar) errors.push('Must contain at least one special character (!@#$%^&*)');
    if (!checks.notCommon) errors.push('This password is too common');
    if (!checks.notContainsEmail) errors.push('Password cannot contain your email');

    const isValid = Object.values(checks).every(check => check);
    
    // Calculate strength
    const passedChecks = Object.values(checks).filter(check => check).length;
    let strength: 'weak' | 'medium' | 'strong';
    
    if (passedChecks <= 3) {
        strength = 'weak';
    } else if (passedChecks <= 5) {
        strength = 'medium';
    } else {
        strength = 'strong';
    }

    return {
        isValid,
        strength,
        errors,
        checks
    };
}

/**
 * Get password strength color for UI
 */
export function getStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
    switch (strength) {
        case 'weak':
            return 'bg-red-500';
        case 'medium':
            return 'bg-yellow-500';
        case 'strong':
            return 'bg-green-500';
    }
}

/**
 * Get password strength percentage for progress bar
 */
export function getStrengthPercentage(strength: 'weak' | 'medium' | 'strong'): number {
    switch (strength) {
        case 'weak':
            return 33;
        case 'medium':
            return 66;
        case 'strong':
            return 100;
    }
}
