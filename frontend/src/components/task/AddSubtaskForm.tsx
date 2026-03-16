import { useState } from "react";
import { Plus } from "lucide-react";

interface AddSubtaskFormProps {
  onAdd: (title: string) => void;
}

export function AddSubtaskForm({ onAdd }: AddSubtaskFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setTitle("");
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add subtask
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-3 py-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          if (!title.trim()) setIsAdding(false);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Subtask title..."
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoFocus
      />
    </form>
  );
}
