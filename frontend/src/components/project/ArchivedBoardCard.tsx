import { Layout, ArchiveRestore, Trash2 } from "lucide-react";
import { Board } from "@/lib/storage";

interface ArchivedBoardCardProps {
    board: Board;
    onRestore: () => void;
    onDelete: () => void;
}

export default function ArchivedBoardCard({
    board,
    onRestore,
    onDelete
}: ArchivedBoardCardProps) {
    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
                <div 
                    className="w-8 h-8 rounded-md flex items-center justify-center opacity-60"
                    style={{ backgroundColor: board.color || '#9CA3AF' }}
                >
                    <Layout className="w-4 h-4 text-white" />
                </div>
            </div>

            <h3 className="text-xs font-bold text-gray-700 mb-2">
                {board.name}
            </h3>

            <div className="flex gap-1.5">
                <button
                    onClick={onRestore}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors"
                >
                    <ArchiveRestore className="w-3 h-3" />
                    Restore
                </button>
                <button
                    onClick={onDelete}
                    className="px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 transition-colors"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
