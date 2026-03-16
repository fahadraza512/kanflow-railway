import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  hint?: string;
}

export function FormField({ 
  label, 
  error, 
  required, 
  children, 
  className,
  hint 
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
