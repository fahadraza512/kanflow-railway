import { useState, useCallback, useEffect } from "react";
import {
    getBoardsByProject,
    getArchivedBoardsByProject,
    saveBoard,
    updateBoard,
    deleteBoard as deleteBoardStorage,
    reorderBoards as reorderBoardsStorage,
    Board
} from "@/lib/storage";

export function useBoards(projectId: string | number | null) {
    const [boards, setBoards] = useState<Board[]>([]);
    const [archivedBoards, setArchivedBoards] = useState<Board[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadBoards = useCallback(() => {
        if (!projectId) {
            setBoards([]);
            setArchivedBoards([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const activeBoards = getBoardsByProject(projectId);
        const archived = getArchivedBoardsByProject(projectId);
        setBoards(activeBoards);
        setArchivedBoards(archived);
        setIsLoading(false);
    }, [projectId]);

    useEffect(() => {
        loadBoards();
    }, [loadBoards]);

    const createBoard = useCallback((board: Board) => {
        saveBoard(board);
        loadBoards();
        return board.id;
    }, [loadBoards]);

    const updateBoardData = useCallback((id: string | number, updates: Partial<Board>) => {
        updateBoard(id, updates);
        loadBoards();
    }, [loadBoards]);

    const deleteBoard = useCallback((id: string | number) => {
        deleteBoardStorage(id);
        loadBoards();
    }, [loadBoards]);

    const archiveBoard = useCallback((id: string | number) => {
        updateBoard(id, { archived: true });
        loadBoards();
    }, [loadBoards]);

    const restoreBoard = useCallback((id: string | number) => {
        updateBoard(id, { archived: false });
        loadBoards();
    }, [loadBoards]);

    const reorderBoards = useCallback((boardIds: (string | number)[]) => {
        if (projectId) {
            reorderBoardsStorage(projectId, boardIds);
            loadBoards();
        }
    }, [projectId, loadBoards]);

    return {
        boards,
        archivedBoards,
        isLoading,
        createBoard,
        updateBoard: updateBoardData,
        deleteBoard,
        archiveBoard,
        restoreBoard,
        reorderBoards,
        refetch: loadBoards
    };
}
