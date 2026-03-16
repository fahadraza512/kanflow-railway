"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { clsx } from "clsx";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-3.5 h-3.5" />,
        error: <AlertCircle className="w-3.5 h-3.5" />,
        info: <Info className="w-3.5 h-3.5" />
    };

    const styles = {
        success: "bg-green-50 text-green-800 border-green-200",
        error: "bg-red-50 text-red-800 border-red-200",
        info: "bg-blue-50 text-blue-800 border-blue-200"
    };

    return (
        <div className={clsx(
            "fixed top-4 right-4 z-[300] flex items-center gap-2 px-2.5 py-1.5 rounded-lg border shadow-md animate-slide-in-right",
            styles[type]
        )}>
            {icons[type]}
            <span className="text-[10px] font-semibold">{message}</span>
            <button
                onClick={onClose}
                className="ml-1 hover:opacity-70 transition-opacity"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}
