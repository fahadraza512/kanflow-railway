import { Plus, Layout } from "lucide-react";

interface EmptyBoardsStateProps {
    onCreateBoard: () => void;
}

export default function EmptyBoardsState({ onCreateBoard }: EmptyBoardsStateProps) {
    return (
        <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Layout className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-1">
                    No boards yet
                </h2>
                <p className="text-gray-500 mb-4 text-xs">
                    Create your first board to start organizing tasks
                </p>
                <button
                    onClick={onCreateBoard}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Board</span>
                </button>
            </div>
        </div>
    );
}
