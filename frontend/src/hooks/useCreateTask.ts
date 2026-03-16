import { useState } from "react";
import { Priority } from "@/types/kanban";
import { createTask } from "@/lib/tasks";
import { getTasksByList } from "@/lib/storage";
import { validateTaskTitle as validateTaskTitleCharacters } from "@/lib/validation";
import { useTemplates } from "@/hooks/useTemplates";

interface UseCreateTaskProps {
    boardId: string;
    projectId: string;
    workspaceId: string;
    listId: string;
    onSuccess: () => void;
    onClose: () => void;
}

export function useCreateTask({
    boardId,
    projectId,
    workspaceId,
    listId,
    onSuccess,
    onClose
}: UseCreateTaskProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [dueDate, setDueDate] = useState("");
    const [labels, setLabels] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [titleError, setTitleError] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | number | null>(null);
    
    const { templates } = useTemplates();

    const validateTitle = (taskTitle: string) => {
        if (!taskTitle.trim()) {
            setTitleError("");
            return false;
        }

        const charValidation = validateTaskTitleCharacters(taskTitle);
        if (!charValidation.isValid) {
            setTitleError(charValidation.error || "Invalid task title");
            return false;
        }

        const existingTasks = getTasksByList(listId);
        const isDuplicate = existingTasks.some(
            t => t.title.toLowerCase() === taskTitle.trim().toLowerCase()
        );

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
            validateTitle(value);
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
            setLabels(template.labels);
            setSelectedTemplateId(templateId);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateTitle(title)) {
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
            position: 0,
            status: "todo",
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

    return {
        title,
        description,
        priority,
        dueDate,
        labels,
        isSubmitting,
        titleError,
        selectedTemplateId,
        templates,
        setDescription,
        setPriority,
        setDueDate,
        handleTitleChange,
        handleTemplateSelect,
        handleSubmit
    };
}
