import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
    message?: string;
    className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
    if (!message) return null;

    return (
        <div 
            className={cn(
                "flex items-start gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-800",
                "text-sm md:text-base", // Minimum 14px on mobile
                className
            )}
            role="alert"
        >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1">{message}</p>
        </div>
    );
}

interface FormFieldErrorProps {
    message?: string;
    className?: string;
}

export function FormFieldError({ message, className }: FormFieldErrorProps) {
    if (!message) return null;

    return (
        <p 
            className={cn(
                "text-red-600 text-sm mt-1 flex items-center gap-1",
                className
            )}
            role="alert"
        >
            <AlertCircle className="w-3 h-3" />
            {message}
        </p>
    );
}
