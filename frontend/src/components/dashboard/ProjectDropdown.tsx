import { Edit2, UserPlus, Archive, Trash2 } from "lucide-react";
import { Project } from "@/types/api.types";

interface ProjectDropdownProps {
    project: Project;
    onEdit: () => void;
    onAssignMembers: () => void;
    onArchive: () => void;
    onDelete: () => void;
    onClose: () => void;
}

export default function ProjectDropdown({
    project,
    onEdit,
    onAssignMembers,
    onArchive,
    onDelete,
    onClose
}: ProjectDropdownProps) {
    return (
        <>
            <div 
                className="fixed inset-0 z-10" 
                onClick={onClose}
            />
            <div className="absolute top-16 right-4 w-48 bg-white rounded-lg shadow-md border border-gray-200 py-1 z-20">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    <Edit2 className="w-4 h-4" />
                    Edit Project
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onAssignMembers();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Assign Members
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onArchive();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    <Archive className="w-4 h-4" />
                    Archive
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </>
    );
}
