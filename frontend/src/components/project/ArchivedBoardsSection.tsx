import { Archive } from "lucide-react";
import { Board } from "@/lib/storage";
import ArchivedBoardCard from "./ArchivedBoardCard";

interface ArchivedBoardsSectionProps {
    archivedBoards: Board[];
    onRestore: (board: Board) => void;
    onDelete: (board: Board) => void;
}

export default function ArchivedBoardsSection({
    archivedBoards,
    onRestore,
    onDelete
}: ArchivedBoardsSectionProps) {
    if (archivedBoards.length === 0) return null;

    return (
        <div className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5" />
                Archived Boards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {archivedBoards.map((board) => (
                    <ArchivedBoardCard
                        key={board.id}
                        board={board}
                        onRestore={() => onRestore(board)}
                        onDelete={() => onDelete(board)}
                    />
                ))}
            </div>
        </div>
    );
}
