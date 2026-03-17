"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { updateBoard } from "@/lib/tasks";

interface BoardToolbarProps {
    boardId: string | number;
    boardName: string;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onUpdateBoard: () => void;
    readOnly?: boolean;
    groupBy: string;
    onGroupByChange: (value: string) => void;
    onOpenFilters?: () => void;
    activeFiltersCount?: number;
}

export default function BoardToolbar({ 
    boardId, 
    boardName, 
    searchTerm, 
    onSearchChange, 
    onUpdateBoard, 
    readOnly,
    groupBy,
    onGroupByChange,
    onOpenFilters,
    activeFiltersCount = 0
}: BoardToolbarProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(boardName);
    const [isGroupByOpen, setIsGroupByOpen] = useState(false);
    const groupByRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (groupByRef.current && !groupByRef.current.contains(event.target as Node)) {
                setIsGroupByOpen(false);
            }
        };

        if (isGroupByOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isGroupByOpen]);

    const handleNameSubmit = () => {
        if (tempName.trim() && tempName !== boardName) {
            updateBoard(boardId, { name: tempName });
            onUpdateBoard();
        }
        setIsEditing(false);
    };

    return (
        <div className="px-3 md:px-4 py-2 bg-white border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3">
                <div className="flex items-center gap-2 md:gap-3 w-full md:flex-1">
                    {isEditing ? (
                        <input
                            autoFocus
                            className="text-sm md:text-base font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 flex-1 md:flex-none"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onBlur={handleNameSubmit}
                            onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                        />
                    ) : (
                        <h2
                            className={clsx(
                                "text-sm md:text-base font-bold text-gray-900 px-2 py-1 rounded-lg transition-colors truncate",
                                !readOnly && "cursor-pointer hover:bg-gray-50"
                            )}
                            onClick={() => {
                                if (readOnly) return;
                                setTempName(boardName);
                                setIsEditing(true);
                            }}
                        >
                            {boardName}
                        </h2>
                    )}

                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-8 md:pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                        onClick={onOpenFilters}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
                    >
                        <Filter className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Filter</span>
                        {activeFiltersCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    <div className="relative flex-1 md:flex-none" ref={groupByRef}>
                        <button 
                            onClick={() => setIsGroupByOpen(!isGroupByOpen)}
                            className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <span className="hidden md:inline">Group:</span>
                            {groupBy === 'none' ? 'None' : groupBy === 'priority' ? 'Priority' : groupBy === 'assignee' ? 'Assignee' : 'Status'}
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        
                        {isGroupByOpen && (
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                    onClick={() => {
                                        onGroupByChange('none');
                                        setIsGroupByOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors",
                                        groupBy === 'none' ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                                    )}
                                >
                                    None
                                </button>
                                <button
                                    onClick={() => {
                                        onGroupByChange('status');
                                        setIsGroupByOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors",
                                        groupBy === 'status' ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                                    )}
                                >
                                    Status
                                </button>
                                <button
                                    onClick={() => {
                                        onGroupByChange('priority');
                                        setIsGroupByOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors",
                                        groupBy === 'priority' ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                                    )}
                                >
                                    Priority
                                </button>
                                <button
                                    onClick={() => {
                                        onGroupByChange('assignee');
                                        setIsGroupByOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors",
                                        groupBy === 'assignee' ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700"
                                    )}
                                >
                                    Assignee
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
