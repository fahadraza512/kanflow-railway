import { Tag, X, Plus } from "lucide-react";
import { useState } from "react";

interface TaskLabelsProps {
    labels: (string | number)[] | null | undefined;
    readOnly?: boolean;
    onLabelsChange: (labels: (string | number)[]) => void;
}

const LABEL_COLORS = [
    { name: "Blue", color: "bg-blue-100 text-blue-700" },
    { name: "Purple", color: "bg-purple-100 text-purple-700" },
    { name: "Red", color: "bg-red-100 text-red-700" },
    { name: "Green", color: "bg-green-100 text-green-700" },
    { name: "Orange", color: "bg-orange-100 text-orange-700" },
    { name: "Pink", color: "bg-pink-100 text-pink-700" },
    { name: "Yellow", color: "bg-yellow-100 text-yellow-700" },
    { name: "Gray", color: "bg-gray-100 text-gray-700" }
];

export default function TaskLabels({
    labels,
    readOnly,
    onLabelsChange
}: TaskLabelsProps) {
    const [showInput, setShowInput] = useState(false);
    const [newLabel, setNewLabel] = useState("");

    // Ensure labels is always an array
    const safeLabels = Array.isArray(labels) ? labels : [];

    const handleAddLabel = () => {
        if (newLabel.trim()) {
            onLabelsChange([...safeLabels, newLabel.trim()]);
            setNewLabel("");
            setShowInput(false);
        }
    };

    const handleRemoveLabel = (labelToRemove: string | number) => {
        onLabelsChange(safeLabels.filter(l => l !== labelToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddLabel();
        } else if (e.key === "Escape") {
            setNewLabel("");
            setShowInput(false);
        }
    };

    const getLabelColor = (index: number) => {
        return LABEL_COLORS[index % LABEL_COLORS.length].color;
    };

    return (
        <div className="space-y-1.5">
            <label className="text-[8px] font-bold text-gray-900 uppercase tracking-wider">
                Labels
            </label>

            <div className="flex flex-wrap gap-1.5">
                {safeLabels.map((label, index) => (
                    <span
                        key={index}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${getLabelColor(index)}`}
                    >
                        {label}
                        {!readOnly && (
                            <button
                                onClick={() => handleRemoveLabel(label)}
                                className="hover:opacity-70 transition-opacity"
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                    </span>
                ))}

                {!readOnly && !showInput && (
                    <button
                        onClick={() => setShowInput(true)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <Plus className="w-2.5 h-2.5" />
                        Add
                    </button>
                )}

                {!readOnly && showInput && (
                    <input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        onBlur={handleAddLabel}
                        onKeyDown={handleKeyDown}
                        placeholder="Label..."
                        className="px-2 py-0.5 text-[9px] font-bold uppercase border border-blue-400 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 w-20"
                        autoFocus
                    />
                )}
            </div>

            {safeLabels.length === 0 && readOnly && (
                <span className="text-[9px] text-gray-400">No labels</span>
            )}
        </div>
    );
}
