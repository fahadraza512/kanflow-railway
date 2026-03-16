import { ReactNode, useState } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    showCloseButton?: boolean;
    closeOnBackdropClick?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = "md",
    showCloseButton = true,
    closeOnBackdropClick = true
}: ModalProps) {
    if (!isOpen) return null;

    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl"
    };

    const handleBackdropClick = () => {
        if (closeOnBackdropClick) {
            onClose();
        }
    };

    // Swipe to close functionality for mobile
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.innerWidth >= 640) return; // Only on mobile
        setStartY(e.touches[0].clientY);
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || window.innerWidth >= 640) return;
        const deltaY = e.touches[0].clientY - startY;
        if (deltaY > 0) {
            setCurrentY(deltaY);
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging || window.innerWidth >= 640) return;
        if (currentY > 100) {
            onClose();
        }
        setIsDragging(false);
        setCurrentY(0);
        setStartY(0);
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
            style={{ willChange: 'opacity' }}
        >
            <div 
                className={clsx(
                    "bg-white w-full shadow-md border border-gray-200 animate-scale-in",
                    "rounded-t-3xl sm:rounded-lg",
                    "max-h-[90vh] landscape:max-h-[75vh] sm:max-h-[85vh] overflow-y-auto",
                    "safe-bottom transition-transform",
                    sizes[size]
                )}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ 
                    willChange: 'transform, opacity',
                    transform: isDragging ? `translateY(${currentY}px)` : 'translateY(0)',
                }}
            >
                {/* Drag Handle - Mobile Only */}
                <div className="sm:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-2 flex-shrink-0" />
                
                {title && (
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                        <div className="flex-1 pr-2">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
                            {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                        </div>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        )}
                    </div>
                )}
                <div className="p-4 sm:p-6">{children}</div>
            </div>
        </div>
    );
}

export default Modal;

// Modal sub-components for more flexible layouts
export interface ModalHeaderProps {
    children: ReactNode;
    onClose?: () => void;
}

export function ModalHeader({ children, onClose }: ModalHeaderProps) {
    return (
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
            <div className="flex-1 pr-2">{children}</div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                    aria-label="Close modal"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            )}
        </div>
    );
}

export interface ModalBodyProps {
    children: ReactNode;
}

export function ModalBody({ children }: ModalBodyProps) {
    return <div className="px-4 sm:px-6 py-3 sm:py-4">{children}</div>;
}

export interface ModalFooterProps {
    children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
    return (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-end sticky bottom-0 bg-white safe-bottom">
            {children}
        </div>
    );
}
