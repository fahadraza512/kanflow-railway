import { useState, useEffect } from "react";
import {
    getProjectById,
    getBoardsByProject,
    getArchivedBoardsByProject,
    Board,
    Project,
    getWorkspaceById,
    updateBoard,
    deleteBoard,
    reorderBoards
} from "@/lib/storage";
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export function useProject(projectId: string, workspaceId: string) {
    const [project, setProject] = useState<Project | null>(null);
    const [boards, setBoards] = useState<Board[]>([]);
    const [archivedBoards, setArchivedBoards] = useState<Board[]>([]);
    const [workspace, setWorkspace] = useState<{ plan?: string } | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const [planLimit, setPlanLimit] = useState(3);

    const loadData = () => {
        const proj = getProjectById(projectId);
        setProject(proj);

        if (proj) {
            const boardsList = getBoardsByProject(proj.id);
            setBoards(boardsList);
            
            const archivedList = getArchivedBoardsByProject(proj.id);
            setArchivedBoards(archivedList);
        }

        const ws = getWorkspaceById(workspaceId);
        setWorkspace(ws);
        
        if (ws?.plan === "pro") {
            setPlanLimit(999);
        }
    };

    useEffect(() => {
        loadData();
    }, [projectId, workspaceId]);

    const handleArchiveBoard = (board: Board) => {
        if (confirm(`Archive "${board.name}"? You can restore it later.`)) {
            updateBoard(board.id, { archived: true });
            loadData();
        }
    };

    const handleRestoreBoard = (board: Board) => {
        updateBoard(board.id, { archived: false });
        loadData();
    };

    const handleDeleteBoard = (board: Board) => {
        if (confirm(`Permanently delete "${board.name}"? This will delete all lists and tasks. This action cannot be undone.`)) {
            deleteBoard(board.id);
            loadData();
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setBoards((items) => {
                const oldIndex = items.findIndex((item) => item.id.toString() === active.id);
                const newIndex = items.findIndex((item) => item.id.toString() === over.id);
                
                const newOrder = arrayMove(items, oldIndex, newIndex);
                reorderBoards(projectId, newOrder.map(b => b.id));
                
                return newOrder;
            });
        }
    };

    const isAtLimit = boards.length >= planLimit && workspace?.plan === "free";

    return {
        project,
        boards,
        archivedBoards,
        workspace,
        showArchived,
        isAtLimit,
        setShowArchived,
        handleArchiveBoard,
        handleRestoreBoard,
        handleDeleteBoard,
        handleDragEnd,
        refresh: loadData
    };
}
