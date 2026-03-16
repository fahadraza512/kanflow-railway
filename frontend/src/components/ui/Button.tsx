import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, fullWidth = false, disabled, children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
        
        const variants = {
            primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg active:scale-[0.98]",
            secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
            danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
            ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
            outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
        };
        
        const sizes = {
            sm: "px-3 py-1.5 text-xs",
            md: "px-4 py-2 text-sm",
            lg: "px-6 py-3 text-base"
        };

        return (
            <button
                ref={ref}
                className={clsx(baseStyles, variants[variant], sizes[size], fullWidth && "w-full", className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? "Loading..." : children}
            </button>
        );
    }
);

Button.displayName = "Button";
