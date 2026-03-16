import { clsx } from "clsx";

interface ProfileFormActionsProps {
    lastUpdated: Date | null | undefined;
    isSaving: boolean;
    onDiscard: () => void;
    onSave: () => void;
}

const getTimeAgo = (date: Date | null | undefined) => {
    if (!date) return 'never';
    
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'never';
        
        const seconds = Math.floor((new Date().getTime() - dateObj.getTime()) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } catch (error) {
        return 'never';
    }
};

export default function ProfileFormActions({ lastUpdated, isSaving, onDiscard, onSave }: ProfileFormActionsProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-gray-200">
            <div>
                <p className="text-[10px] text-gray-400">Last updated {getTimeAgo(lastUpdated)}</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
                <button 
                    onClick={onDiscard}
                    className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                    Discard
                </button>
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className={clsx(
                        "flex-1 sm:flex-none px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm disabled:opacity-50",
                        !isSaving && "hover:bg-blue-700"
                    )}
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
