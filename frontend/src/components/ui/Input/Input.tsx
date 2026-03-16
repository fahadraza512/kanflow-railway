import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-sm font-semibold text-gray-700">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    className={clsx(
                        "w-full px-4 py-3 border rounded-lg text-sm font-medium transition-colors outline-none",
                        error
                            ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        props.disabled && "bg-gray-100 cursor-not-allowed",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                )}
                {helperText && !error && (
                    <p className="text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
