import { useState } from 'react';
import { Filter, X, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import { Task } from '@/types/api.types';

export interface FilterOptions {
    priority?: string[];
    status?: string[];
    assignees?: string[];
    labels?: string[];
    dueDateRange?: {
        start?: string;
        end?: string;
    };
    hasAttachments?: boolean;
    hasComments?: boolean;
    isOverdue?: boolean;
}

interface AdvancedFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    availableAssignees: Array<{ id: string; name: string }>;
    availableLabels: string[];
}

export default function AdvancedFilters({
    isOpen,
    onClose,
    filters,
    onFiltersChange,
    availableAssignees,
    availableLabels
}: AdvancedFiltersProps) {
    const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

    if (!isOpen) return null;

    const handleApply = () => {
        onFiltersChange(localFilters);
        onClose();
    };

    const handleReset = () => {
        const emptyFilters: FilterOptions = {};
        setLocalFilters(emptyFilters);
        onFiltersChange(emptyFilters);
    };

    const togglePriority = (priority: string) => {
        const current = localFilters.priority || [];
        const updated = current.includes(priority)
            ? current.filter(p => p !== priority)
            : [...current, priority];
        setLocalFilters({ ...localFilters, priority: updated.length > 0 ? updated : undefined });
    };

    const toggleStatus = (status: string) => {
        const current = localFilters.status || [];
        const updated = current.includes(status)
            ? current.filter(s => s !== status)
            : [...current, status];
        setLocalFilters({ ...localFilters, status: updated.length > 0 ? updated : undefined });
    };

    const toggleAssignee = (assigneeId: string) => {
        const current = localFilters.assignees || [];
        const updated = current.includes(assigneeId)
            ? current.filter(a => a !== assigneeId)
            : [...current, assigneeId];
        setLocalFilters({ ...localFilters, assignees: updated.length > 0 ? updated : undefined });
    };

    const toggleLabel = (label: string) => {
        const current = localFilters.labels || [];
        const updated = current.includes(label)
            ? current.filter(l => l !== label)
            : [...current, label];
        setLocalFilters({ ...localFilters, labels: updated.length > 0 ? updated : undefined });
    };

    const activeFilterCount = Object.keys(filters).length;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-bold text-gray-900">Advanced Filters</h2>
                        {activeFilterCount > 0 && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                {activeFilterCount} active
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Priority Filter */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <AlertCircle className="w-4 h-4" />
                            Priority
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['urgent', 'high', 'medium', 'low'].map(priority => (
                                <button
                                    key={priority}
                                    onClick={() => togglePriority(priority)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        localFilters.priority?.includes(priority)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Tag className="w-4 h-4" />
                            Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['todo', 'inProgress', 'inReview', 'done'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => toggleStatus(status)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        localFilters.status?.includes(status)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {status === 'inProgress' ? 'In Progress' : status === 'inReview' ? 'In Review' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Assignee Filter */}
                    {availableAssignees.length > 0 && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <User className="w-4 h-4" />
                                Assignees
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableAssignees.map(assignee => (
                                    <button
                                        key={assignee.id}
                                        onClick={() => toggleAssignee(assignee.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            localFilters.assignees?.includes(assignee.id)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {assignee.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Labels Filter */}
                    {availableLabels.length > 0 && (
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                <Tag className="w-4 h-4" />
                                Labels
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {availableLabels.map(label => (
                                    <button
                                        key={label}
                                        onClick={() => toggleLabel(label)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                            localFilters.labels?.includes(label)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Filters */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">
                            Quick Filters
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localFilters.isOverdue || false}
                                    onChange={(e) => setLocalFilters({ ...localFilters, isOverdue: e.target.checked || undefined })}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Overdue tasks</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localFilters.hasAttachments || false}
                                    onChange={(e) => setLocalFilters({ ...localFilters, hasAttachments: e.target.checked || undefined })}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Has attachments</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={localFilters.hasComments || false}
                                    onChange={(e) => setLocalFilters({ ...localFilters, hasComments: e.target.checked || undefined })}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Has comments</span>
                            </label>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <Calendar className="w-4 h-4" />
                            Due Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">From</label>
                                <input
                                    type="date"
                                    value={localFilters.dueDateRange?.start || ''}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        dueDateRange: {
                                            ...localFilters.dueDateRange,
                                            start: e.target.value || undefined
                                        }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">To</label>
                                <input
                                    type="date"
                                    value={localFilters.dueDateRange?.end || ''}
                                    onChange={(e) => setLocalFilters({
                                        ...localFilters,
                                        dueDateRange: {
                                            ...localFilters.dueDateRange,
                                            end: e.target.value || undefined
                                        }
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Reset All
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper function to apply filters to tasks
export function applyFilters(tasks: Task[], filters: FilterOptions): Task[] {
    return tasks.filter(task => {
        // Priority filter
        if (filters.priority && filters.priority.length > 0) {
            if (!filters.priority.includes(task.priority || 'low')) {
                return false;
            }
        }

        // Status filter
        if (filters.status && filters.status.length > 0) {
            if (!filters.status.includes(task.status || 'todo')) {
                return false;
            }
        }

        // Assignee filter
        if (filters.assignees && filters.assignees.length > 0) {
            if (!task.assigneeId || !filters.assignees.includes(task.assigneeId)) {
                return false;
            }
        }

        // Labels filter
        if (filters.labels && filters.labels.length > 0) {
            const taskLabels = task.labels || [];
            const hasMatchingLabel = filters.labels.some(label => taskLabels.includes(label));
            if (!hasMatchingLabel) {
                return false;
            }
        }

        // Overdue filter
        if (filters.isOverdue) {
            if (!task.dueDate || new Date(task.dueDate) >= new Date()) {
                return false;
            }
        }

        // Has attachments filter
        if (filters.hasAttachments) {
            // Assuming task has attachments array or count
            if (!(task as any).attachments || (task as any).attachments.length === 0) {
                return false;
            }
        }

        // Has comments filter
        if (filters.hasComments) {
            // Assuming task has comments array or count
            if (!(task as any).comments || (task as any).comments.length === 0) {
                return false;
            }
        }

        // Due date range filter
        if (filters.dueDateRange) {
            if (!task.dueDate) return false;
            
            const taskDate = new Date(task.dueDate);
            
            if (filters.dueDateRange.start) {
                const startDate = new Date(filters.dueDateRange.start);
                if (taskDate < startDate) return false;
            }
            
            if (filters.dueDateRange.end) {
                const endDate = new Date(filters.dueDateRange.end);
                if (taskDate > endDate) return false;
            }
        }

        return true;
    });
}
