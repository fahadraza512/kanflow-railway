"use client";

import { Calendar, AlignLeft } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PrioritySelector } from "./create-task/PrioritySelector";
import { TemplateSelector } from "./create-task/TemplateSelector";
import { TaskTitleInput } from "./create-task/TaskTitleInput";
import { useCreateTask } from "@/hooks/useCreateTask";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardId: string;
    projectId: string;
    workspaceId: string;
    listId: string;
    onSuccess: () => void;
}

export default function CreateTaskModal(props: CreateTaskModalProps) {
    const {
        title,
        description,
        priority,
        dueDate,
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
    } = useCreateTask(props);

    return (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Create New Task"
            subtitle="Adding to current list"
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-3">
                <TemplateSelector
                    templates={templates}
                    selectedId={selectedTemplateId}
                    onSelect={handleTemplateSelect}
                />

                <TaskTitleInput
                    value={title}
                    onChange={handleTitleChange}
                    error={titleError}
                />

                <div className="flex flex-wrap gap-3">
                    <PrioritySelector value={priority} onChange={setPriority} />

                    <div className="flex-1 min-w-[150px]">
                        <Input
                            type="date"
                            label="Due Date"
                            icon={<Calendar className="w-3 h-3" />}
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="bg-gray-50"
                        />
                    </div>
                </div>

                <Textarea
                    label="Description"
                    icon={<AlignLeft className="w-3 h-3" />}
                    placeholder="Add a more detailed description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="bg-gray-50"
                />

                <div className="pt-3 border-t border-gray-200 flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={props.onClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || !title.trim() || !!titleError}
                        isLoading={isSubmitting}
                        className="flex-1"
                    >
                        Create Task
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
