import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = "md"
}: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl"
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className={`bg-white rounded-lg w-full ${sizeClasses[size]} shadow-md border border-gray-200`}>
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                            {description && (
                                <p className="text-sm text-gray-500 mt-1">{description}</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
