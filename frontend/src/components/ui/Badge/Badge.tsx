import { ReactNode } from "react";
import { clsx } from "clsx";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    className?: string;
}

export default function Badge({ 
    children, 
    variant = "default", 
    size = "md",
    className 
}: BadgeProps) {
    const variantClasses = {
        default: "bg-gray-100 text-gray-700",
        primary: "bg-blue-50 text-blue-600",
        success: "bg-green-50 text-green-600",
        warning: "bg-yellow-50 text-yellow-600",
        danger: "bg-red-50 text-red-600",
        info: "bg-purple-50 text-purple-600"
    };

    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm"
    };

    return (
        <span
            className={clsx(
                "inline-flex items-center font-semibold rounded-lg",
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
        >
            {children}
        </span>
    );
}
