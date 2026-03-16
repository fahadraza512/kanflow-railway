import { HTMLAttributes } from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "primary" | "secondary" | "white";
    label?: string;
}

export default function Spinner({ 
    size = "md", 
    variant = "primary",
    label,
    className,
    ...props 
}: SpinnerProps) {
    const sizes = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-12 h-12"
    };
    
    const variants = {
        primary: "text-blue-600",
        secondary: "text-gray-600",
        white: "text-white"
    };
    
    return (
        <div
            className={clsx("flex flex-col items-center justify-center gap-2", className)}
            role="status"
            {...props}
        >
            <Loader2 
                className={clsx(
                    "animate-spin",
                    sizes[size],
                    variants[variant]
                )} 
            />
            {label && (
                <span className="text-sm text-gray-600">{label}</span>
            )}
            <span className="sr-only">Loading...</span>
        </div>
    );
}
