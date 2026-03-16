"use client";

import { useState } from "react";
import { X, Calendar, Flag, AlignLeft, FileText } from "lucide-react";
import { createTask } from "@/lib/tasks";
import { Priority } from "@/types/kanban";
import { clsx } from "clsx";
import { getTasksByList } from "@/lib/storage";
import { validateTaskTitle as validateTaskTitleCharacters } from "@/lib/validation";
import { useTemplates } from "@/hooks/useTemplates";
import { FormFieldError } from "../ui/FormError";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardId: string;
    projectId: string;
    workspaceId: string;
    listId: string;
    onSuccess: () => void;
}

export default function CreateTaskModal({
    isOpen,
    onClose,
    boardId,
    projectId,
    workspaceId,
    listId,
    onSuccess
}: CreateTaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [dueDate, setDueDate] = useState("");
    const [labels, setLabels] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [titleError, setTitleError] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | number | null>(null);
    
    const { templates } = useTemplates();

    if (!isOpen) return null;

    const validateTaskTitle = (taskTitle: string) => {
        if (!taskTitle.trim()) {
            setTitleError("");
            return false;
        }

        // Check for special characters first
        const charValidation = validateTaskTitleCharacters(taskTitle);
        if (!charValidation.isValid) {
            setTitleError(charValidation.error || "Invalid task title");
            return false;
        }

        // Then check for duplicates
        const existingTasks = getTasksByList(listId);
        const isDuplicate = existingTasks.some(t => t.title.toLowerCase() === taskTitle.trim().toLowerCase());

        if (isDuplicate) {
            setTitleError("This name already exists. Please choose a different name.");
            return false;
        }

        setTitleError("");
        return true;
    };

    const handleTitleChange = (value: string) => {
        setTitle(value);
        if (value.trim()) {
            validateTaskTitle(value);
        } else {
            setTitleError("");
        }
    };

    const handleTemplateSelect = (templateId: string | number) => {
        if (templateId === selectedTemplateId) {
            setSelectedTemplateId(null);
            return;
        }

        const template = templates.find((t) => t.id === templateId);
        if (template) {
            setTitle(template.title);
            setDescription(template.taskDescription || "");
            setPriority(template.priority);
            setLabels(template.labels.map(String));
            setSelectedTemplateId(templateId);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateTaskTitle(title)) {
            return;
        }

        setIsSubmitting(true);

        createTask({
            boardId,
            projectId,
            workspaceId,
            listId,
            title,
            description,
            priority,
            dueDate: dueDate || null,
            labels,
            assignedTo: null,
            assignedToName: null,
            position: 0, // Simplified for now
            status: "todo", // Default status
            createdBy: "current-user-id"
        });

        setIsSubmitting(false);
        onSuccess();
        onClose();
        resetForm();
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDueDate("");
        setLabels([]);
        setTitleError("");
        setSelectedTemplateId(null);
    };

    const priorities: Priority[] = ["low", "medium", "high", "urgent"];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-md border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Create New Task</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Adding to current list</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    {templates.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <FileText className="w-3 h-3" />
                                Use Template
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        onClick={() => handleTemplateSelect(template.id)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                            selectedTemplateId === template.id
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        )}
                                    >
                                        {template.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <input
                            type="text"
                            required
                            autoFocus
                            placeholder="Task Title"
                            className={`w-full px-0 py-1 border-none text-sm font-bold placeholder:text-gray-300 focus:ring-0 focus:outline-none ${
                                titleError ? "text-red-600" : ""
                            }`}
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                        />
                        <FormFieldError message={titleError} />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[150px] space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <Flag className="w-3 h-3" />
                                Priority
                            </label>
                            <div className="flex gap-1.5">
                                {priorities.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={clsx(
                                            "flex-1 py-1 rounded-md text-xs font-semibold uppercase transition-colors",
                                            priority === p
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 min-w-[150px] space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                <Calendar className="w-3 h-3" />
                                Due Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-colors"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <AlignLeft className="w-3 h-3" />
                            Description
                        </label>
                        <textarea
                            placeholder="Add a more detailed description..."
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 transition-colors h-20 resize-none placeholder:text-gray-400"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="pt-3 border-t border-gray-200 flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !title.trim() || !!titleError}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md text-xs"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
