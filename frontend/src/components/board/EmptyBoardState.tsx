import { Columns3, Plus } from "lucide-react";

interface EmptyBoardStateProps {
    onCreateList: () => void;
}

export default function EmptyBoardState({ onCreateList }: EmptyBoardStateProps) {
    return (
        <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center max-w-md px-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Columns3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No lists yet
                </h3>
                <p className="text-gray-600 mb-6">
                    Create your first list to start organizing tasks on this board.
                </p>
                <button
                    onClick={onCreateList}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Create List
                </button>
            </div>
        </div>
    );
}
