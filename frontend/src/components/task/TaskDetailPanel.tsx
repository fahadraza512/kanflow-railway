"use client";

import { Task } from "@/types/kanban";
import { useTaskDetail } from "@/hooks/useTaskDetail";
import TaskDetailHeader from "./TaskDetailHeader";
import TaskTitle from "./TaskTitle";
import TaskDescription from "./TaskDescription";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import TaskDueDate from "./TaskDueDate";
import TaskLabels from "./TaskLabels";
import TaskActivity from "./TaskActivity";
import TaskComments from "./TaskComments";
import ImprovedAssignee from "./ImprovedAssignee";
import { AttachmentList } from "./AttachmentList";
import Toast from "../ui/Toast";
import { useEffect, useRef, useState } from "react";
import { TaskDetailSkeleton } from "../ui/LoadingSkeleton";

interface TaskDetailPanelProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    readOnly?: boolean;
    onNext?: () => void;
    onPrevious?: () => void;
    lists?: any[]; // Board lists for status-to-list mapping
}

export default function TaskDetailPanel({ task, isOpen, onClose, onUpdate, readOnly, onNext, onPrevious, lists = [] }: TaskDetailPanelProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [bottomSheetHeight, setBottomSheetHeight] = useState('90vh');
    
    const {
        title,
        setTitle,
        description,
        setDescription,
        isEditingTitle,
        setIsEditingTitle,
        activity,
        breadcrumb,
        newLabel,
        setNewLabel,
        showLabelInput,
        setShowLabelInput,
        toast,
        setToast,
        currentTask, // Get fresh task data from hook
        handleTitleBlur,
        handleDescriptionBlur,
        handleDelete,
        handleArchive,
        handlePriorityChange,
        handleStatusChange,
        handleAssigneeChange,
        handleLabelsChange,
        handleDueDateChange,
    } = useTaskDetail(task, isOpen, onClose, onUpdate, lists);

    // Handle keyboard opening on mobile
    useEffect(() => {
        if (!isOpen || typeof window === 'undefined') return;

        const handleResize = () => {
            if (window.visualViewport) {
                const viewportHeight = window.visualViewport.height;
                const windowHeight = window.innerHeight;
                const keyboardHeight = windowHeight - viewportHeight;
                
                if (keyboardHeight > 100) {
                    // Keyboard is open
                    setBottomSheetHeight(`${viewportHeight * 0.9}px`);
                } else {
                    // Keyboard is closed
                    setBottomSheetHeight('90vh');
                }
            }
        };

        window.visualViewport?.addEventListener('resize', handleResize);
        
        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    // Scroll input into view when focused
    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTimeout(() => {
            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    };

    if (!isOpen) return null;

    // Show loading state if currentTask is not available
    const isLoading = !currentTask || !currentTask.id;

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleTitleBlur();
        if (e.key === "Escape") {
            setTitle(task.title);
            setIsEditingTitle(false);
        }
    };

    // Swipe to close functionality
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (window.innerWidth >= 1024) return; // Only on mobile
        setStartY(e.touches[0].clientY);
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || window.innerWidth >= 1024) return;
        const deltaY = e.touches[0].clientY - startY;
        if (deltaY > 0) { // Only allow downward swipe
            setCurrentY(deltaY);
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging || window.innerWidth >= 1024) return;
        if (currentY > 100) { // Swipe threshold
            onClose();
        }
        setIsDragging(false);
        setCurrentY(0);
        setStartY(0);
    };

    return (
        <div className="fixed inset-0 z-[200] flex lg:justify-end justify-center items-end lg:items-stretch overflow-hidden">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Mobile: Bottom Sheet | Desktop: Side Panel */}
            <div 
                ref={contentRef}
                className="relative w-full lg:max-w-[320px] bg-white shadow-lg flex flex-col border-l border-gray-200 rounded-t-3xl lg:rounded-none safe-bottom transition-transform"
                style={{ 
                    height: window.innerWidth < 1024 ? bottomSheetHeight : '100%',
                    maxHeight: window.innerWidth < 1024 ? '90vh landscape:max-h-[75vh]' : '100%',
                    transform: isDragging ? `translateY(${currentY}px)` : 'translateY(0)',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Drag Handle - Mobile Only */}
                <div className="lg:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-2 flex-shrink-0" />
                
                <TaskDetailHeader
                    breadcrumb={{ project: breadcrumb.project, list: breadcrumb.list }}
                    readOnly={readOnly}
                    isArchived={currentTask?.isArchived || false}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    onClose={onClose}
                    onNext={onNext}
                    onPrevious={onPrevious}
                />

                {isLoading ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <TaskDetailSkeleton />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-3 sm:p-4 lg:p-2 space-y-3">
                            <TaskTitle
                                title={title}
                                isEditing={isEditingTitle}
                                readOnly={readOnly}
                                onTitleChange={setTitle}
                                onStartEdit={() => setIsEditingTitle(true)}
                                onBlur={handleTitleBlur}
                                onKeyDown={handleTitleKeyDown}
                                onFocus={handleInputFocus}
                            />

                            <div className="space-y-3">
                                <TaskDescription
                                    description={description}
                                    readOnly={readOnly}
                                    onChange={setDescription}
                                    onBlur={handleDescriptionBlur}
                                    onFocus={handleInputFocus}
                                />

                                <div className="pt-2 border-t border-gray-100">
                                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Details</h3>
                                    <div className="space-y-2">
                                        {/* Improved Assignee */}
                                        <div>
                                            <label className="text-[8px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Assignee</label>
                                            <ImprovedAssignee
                                                currentAssigneeId={currentTask.assigneeId}
                                                currentAssigneeName={currentTask.assignee?.name}
                                                onChange={handleAssigneeChange}
                                                readOnly={readOnly}
                                            />
                                        </div>

                                        <TaskStatus
                                            currentStatus={currentTask.status}
                                            readOnly={readOnly}
                                            onChange={handleStatusChange}
                                        />

                                        <TaskPriority
                                            currentPriority={currentTask.priority}
                                            readOnly={readOnly}
                                            onChange={handlePriorityChange}
                                        />

                                        <TaskDueDate
                                            dueDate={currentTask.dueDate}
                                            readOnly={readOnly}
                                            onChange={handleDueDateChange}
                                        />

                                        <TaskLabels
                                            labels={currentTask.labels}
                                            readOnly={readOnly}
                                            onLabelsChange={handleLabelsChange}
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="pt-2 border-t border-gray-100">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Activity</h3>
                                <TaskActivity activity={activity} />
                            </div>

                            <div className="pt-2 border-t border-gray-100">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Attachments</h3>
                                <AttachmentList taskId={currentTask.id} readOnly={readOnly} />
                            </div>

                            <div className="pt-2 border-t border-gray-100">
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Comments</h3>
                                <TaskComments taskId={currentTask.id} readOnly={readOnly} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
