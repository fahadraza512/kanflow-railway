import { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;
    variant?: "default" | "primary" | "success" | "warning" | "danger" | "info" | 
              "yellow" | "green" | "red" | "gray" | "purple" | "blue" | "indigo";
    size?: "sm" | "md" | "lg";
    dot?: boolean;
}

export default function Badge({ 
    children, 
    variant = "default", 
    size = "md",
    dot = false,
    className,
    ...props 
}: BadgeProps) {
    const variants = {
        default: "bg-gray-100 text-gray-700 border-gray-200",
        primary: "bg-blue-100 text-blue-700 border-blue-200",
        success: "bg-green-100 text-green-700 border-green-200",
        warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
        danger: "bg-red-100 text-red-700 border-red-200",
        info: "bg-purple-100 text-purple-700 border-purple-200",
        // Color aliases
        yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
        green: "bg-green-100 text-green-700 border-green-200",
        red: "bg-red-100 text-red-700 border-red-200",
        gray: "bg-gray-100 text-gray-700 border-gray-200",
        purple: "bg-purple-100 text-purple-700 border-purple-200",
        blue: "bg-blue-100 text-blue-700 border-blue-200",
        indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    };
    
    const sizes = {
        sm: "px-1.5 py-0.5 text-[9px]",
        md: "px-2 py-1 text-xs",
        lg: "px-2.5 py-1 text-sm"
    };
    
    const dotColors = {
        default: "bg-gray-500",
        primary: "bg-blue-500",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        danger: "bg-red-500",
        info: "bg-purple-500",
        // Color aliases
        yellow: "bg-yellow-500",
        green: "bg-green-500",
        red: "bg-red-500",
        gray: "bg-gray-500",
        purple: "bg-purple-500",
        blue: "bg-blue-500",
        indigo: "bg-indigo-500",
    };
    
    return (
        <span
            className={clsx(
                "inline-flex items-center gap-1.5 font-semibold rounded-full border",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span className={clsx("w-1.5 h-1.5 rounded-full", dotColors[variant])} />
            )}
            {children}
        </span>
    );
}
