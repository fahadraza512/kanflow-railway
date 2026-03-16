import { TextareaHTMLAttributes, forwardRef, ReactNode } from "react";
import { clsx } from "clsx";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, icon, ...props }, ref) => {
        return (
            <div className="space-y-1.5">
                {label && (
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        {icon}
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={clsx(
                        "w-full px-3 py-2 bg-white border rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
                        error ? "border-red-300 focus:ring-red-500" : "border-gray-200 hover:border-gray-300",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-red-600 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
