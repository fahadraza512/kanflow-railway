import { ArrowRight } from "lucide-react";

interface WorkspaceFormActionsProps {
    isSubmitting: boolean;
    isDisabled: boolean;
    onCancel: () => void;
}

export default function WorkspaceFormActions({ isSubmitting, isDisabled, onCancel }: WorkspaceFormActionsProps) {
    return (
        <div className="flex gap-2">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-all text-sm"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isDisabled}
                className="group relative flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10">Create Workspace</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
