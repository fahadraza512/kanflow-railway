import { useState } from "react";
import { Subtask } from "@/types/subtask";
import { Check, GripVertical, Trash2, Edit2 } from "lucide-react";

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: () => void;
  onEdit: (title: string) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export function SubtaskItem({
  subtask,
  onToggle,
  onEdit,
  onDelete,
  dragHandleProps,
}: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(subtask.title);

  const handleSubmit = () => {
    if (editValue.trim() && editValue !== subtask.title) {
      onEdit(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setEditValue(subtask.title);
      setIsEditing(false);
    }
  };

  return (
    <div className="group flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          subtask.completed
            ? "bg-blue-600 border-blue-600"
            : "border-gray-300 hover:border-blue-600"
        }`}
        aria-label={subtask.completed ? "Mark incomplete" : "Mark complete"}
      >
        {subtask.completed && <Check className="w-3 h-3 text-white" />}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <span
          className={`flex-1 text-sm ${
            subtask.completed
              ? "line-through text-gray-500"
              : "text-gray-900"
          }`}
          onDoubleClick={() => setIsEditing(true)}
        >
          {subtask.title}
        </span>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          aria-label="Edit subtask"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          aria-label="Delete subtask"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
