import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { FormFieldError } from "../ui/FormError";

interface LoginFormProps {
    email: string;
    password: string;
    showPassword: boolean;
    onEmailChange: (email: string) => void;
    onPasswordChange: (password: string) => void;
    onTogglePassword: () => void;
    onSubmit: (e: React.FormEvent) => void;
    disabled?: boolean;
    emailError?: string;
    passwordError?: string;
    onEmailBlur?: () => void;
    onPasswordBlur?: () => void;
}

export default function LoginForm({
    email,
    password,
    showPassword,
    onEmailChange,
    onPasswordChange,
    onTogglePassword,
    onSubmit,
    disabled = false,
    emailError,
    passwordError,
    onEmailBlur,
    onPasswordBlur
}: LoginFormProps) {
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('LoginForm: Form submitted, calling onSubmit');
        onSubmit(e);
    };

    return (
        <form className="space-y-6" onSubmit={handleFormSubmit} noValidate>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="email"
                        disabled={disabled}
                        className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                            emailError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => onEmailChange(e.target.value)}
                        onBlur={onEmailBlur}
                    />
                </div>
                <FormFieldError message={emailError} />
            </div>

            <div>
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <Link href="/forgot-password" title="Forgot Password" className="text-xs font-bold text-blue-600 hover:text-blue-500">
                        Forgot password?
                    </Link>
                </div>
                <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type={showPassword ? "text" : "password"}
                        disabled={disabled}
                        className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                            passwordError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        onBlur={onPasswordBlur}
                    />
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        disabled={disabled}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                <FormFieldError message={passwordError} />
            </div>

            <div>
                <button
                    type="submit"
                    disabled={disabled}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                >
                    {disabled ? 'Signing in...' : 'Login'}
                </button>
            </div>
        </form>
    );
}
