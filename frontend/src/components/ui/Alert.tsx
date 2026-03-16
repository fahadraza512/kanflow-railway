import { HTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: "info" | "success" | "warning" | "error";
    title?: string;
    onClose?: () => void;
    icon?: boolean;
}

export default function Alert({ 
    children, 
    variant = "info", 
    title,
    onClose,
    icon = true,
    className,
    ...props 
}: AlertProps) {
    const variants = {
        info: {
            container: "bg-blue-50 border-blue-200 text-blue-900",
            icon: "text-blue-600",
            IconComponent: Info
        },
        success: {
            container: "bg-green-50 border-green-200 text-green-900",
            icon: "text-green-600",
            IconComponent: CheckCircle
        },
        warning: {
            container: "bg-yellow-50 border-yellow-200 text-yellow-900",
            icon: "text-yellow-600",
            IconComponent: AlertCircle
        },
        error: {
            container: "bg-red-50 border-red-200 text-red-900",
            icon: "text-red-600",
            IconComponent: XCircle
        }
    };
    
    const { container, icon: iconColor, IconComponent } = variants[variant];
    
    return (
        <div
            className={clsx(
                "flex gap-3 p-4 rounded-lg border",
                container,
                className
            )}
            role="alert"
            {...props}
        >
            {icon && (
                <IconComponent className={clsx("w-5 h-5 flex-shrink-0", iconColor)} />
            )}
            
            <div className="flex-1">
                {title && (
                    <h4 className="font-bold text-sm mb-1">{title}</h4>
                )}
                <div className="text-sm">{children}</div>
            </div>
            
            {onClose && (
                <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
