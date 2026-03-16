import { Edit2, Trash2, Check, X } from "lucide-react";
import { Comment as KanbanComment } from "@/types/kanban";
import { useRef } from "react";

interface CommentItemProps {
    comment: KanbanComment;
    isEditing: boolean;
    editingText: string;
    canEdit: boolean;
    readOnly?: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onEditingTextChange: (text: string) => void;
}

export default function CommentItem({
    comment,
    isEditing,
    editingText,
    canEdit,
    readOnly,
    onEdit,
    onDelete,
    onSaveEdit,
    onCancelEdit,
    onEditingTextChange
}: CommentItemProps) {
    const editTextareaRef = useRef<HTMLTextAreaElement>(null);

    return (
        <div className="flex gap-1.5 items-start group">
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[7px] font-black text-blue-600 uppercase border border-white shadow-sm shrink-0">
                {comment.userName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-gray-900">{comment.userName}</span>
                    <span className="text-[7px] font-bold text-gray-400 uppercase tracking-tighter">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                {isEditing ? (
                    <div className="space-y-1">
                        <textarea
                            ref={editTextareaRef}
                            autoFocus
                            className="w-full bg-white rounded-lg px-2 py-1.5 border-2 border-blue-500 text-[9px] text-gray-700 leading-normal resize-none min-h-[40px] focus:outline-none"
                            value={editingText}
                            onChange={(e) => onEditingTextChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    onSaveEdit();
                                }
                                if (e.key === "Escape") {
                                    onCancelEdit();
                                }
                            }}
                        />
                        <div className="flex gap-1">
                            <button
                                onClick={onSaveEdit}
                                className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-0.5"
                            >
                                <Check className="w-2 h-2" />
                                Save
                            </button>
                            <button
                                onClick={onCancelEdit}
                                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[8px] font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-0.5"
                            >
                                <X className="w-2 h-2" />
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-lg rounded-tl-none px-2 py-1.5 border border-gray-100 max-w-[90%]">
                        <p className="text-[9px] text-gray-700 leading-normal">
                            {comment.text.split(" ").map((word, i) => (
                                word.startsWith("@") ? (
                                    <span key={i} className="text-blue-600 font-bold mr-1">{word}</span>
                                ) : <span key={i}>{word} </span>
                            ))}
                        </p>
                    </div>
                )}
            </div>
            {canEdit && !readOnly && !isEditing && (
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={onEdit} 
                        className="p-0.5 text-gray-300 hover:text-blue-500 transition-colors"
                        title="Edit comment"
                    >
                        <Edit2 className="w-2.5 h-2.5" />
                    </button>
                    <button 
                        onClick={onDelete} 
                        className="p-0.5 text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete comment"
                    >
                        <Trash2 className="w-2.5 h-2.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
