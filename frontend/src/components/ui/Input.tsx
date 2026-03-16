import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { clsx } from "clsx";
import { FormFieldError } from "./FormError";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, helperText, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        {icon}
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={clsx(
                            "w-full px-3 py-2 bg-white border rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                            icon && "pl-9",
                            error ? "border-red-300 focus:ring-red-500" : "border-gray-200 hover:border-gray-300",
                            className
                        )}
                        {...props}
                    />
                </div>
                <FormFieldError message={error} />
                {helperText && !error && (
                    <p className="text-xs text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
