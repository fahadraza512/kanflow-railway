interface ProjectModalActionsProps {
    isSubmitting: boolean;
    isDisabled: boolean;
    onCancel: () => void;
}

export default function ProjectModalActions({ isSubmitting, isDisabled, onCancel }: ProjectModalActionsProps) {
    return (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-xs"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={isDisabled}
                className="flex-1 px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md text-xs"
            >
                {isSubmitting ? "Creating..." : "Create Project"}
            </button>
        </div>
    );
}
