import { Board } from "@/lib/storage";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import SortableBoardCard from "./SortableBoardCard";
import { useState } from "react";

interface BoardsGridProps {
    boards: Board[];
    workspaceId: string;
    projectId: string;
    onEdit: (board: Board) => void;
    onArchive: (board: Board) => void;
    onDelete: (board: Board) => void;
    onDragEnd: (event: DragEndEvent) => void;
}

export default function BoardsGrid({
    boards,
    workspaceId,
    projectId,
    onEdit,
    onArchive,
    onDelete,
    onDragEnd
}: BoardsGridProps) {
    const [activeBoard, setActiveBoard] = useState<Board | null>(null);
    
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10, // Require 10px of movement before drag starts
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const board = boards.find(b => b.id.toString() === active.id);
        if (board) {
            setActiveBoard(board);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveBoard(null);
        onDragEnd(event);
    };

    const handleDragCancel = () => {
        setActiveBoard(null);
    };

    return (
        <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3">Active Boards</h2>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <SortableContext
                    items={boards.map(b => b.id.toString())}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {boards.map((board) => (
                            <SortableBoardCard
                                key={board.id}
                                board={board}
                                workspaceId={workspaceId}
                                projectId={projectId}
                                onEdit={() => onEdit(board)}
                                onArchive={() => onArchive(board)}
                                onDelete={() => onDelete(board)}
                            />
                        ))}
                    </div>
                </SortableContext>
                
                <DragOverlay dropAnimation={null}>
                    {activeBoard ? (
                        <div className="bg-white rounded-lg border-2 border-blue-500 p-3 shadow-2xl rotate-2 cursor-grabbing">
                            <div className="flex items-center gap-1.5 mb-2">
                                <div 
                                    className="w-8 h-8 rounded-md flex items-center justify-center"
                                    style={{ backgroundColor: activeBoard.color || '#3B82F6' }}
                                >
                                    <span className="text-white text-xs font-bold">
                                        {activeBoard.name.charAt(0)}
                                    </span>
                                </div>
                            </div>
                            <h3 className="text-xs font-bold text-gray-900">
                                {activeBoard.name}
                            </h3>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
