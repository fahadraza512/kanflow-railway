import { useState } from "react";
import { Label } from "@/types/label";
import { useLabels } from "@/hooks/useLabels";
import { LabelBadge } from "./LabelBadge";
import { Plus, Check } from "lucide-react";

interface LabelSelectorProps {
  selectedLabels: (string | number)[];
  onLabelsChange: (labels: (string | number)[]) => void;
}

export function LabelSelector({
  selectedLabels,
  onLabelsChange,
}: LabelSelectorProps) {
  const { labels } = useLabels();
  const [isOpen, setIsOpen] = useState(false);

  const toggleLabel = (labelId: string | number) => {
    if (selectedLabels.includes(labelId)) {
      onLabelsChange(selectedLabels.filter((id) => id !== labelId));
    } else {
      onLabelsChange([...selectedLabels, labelId]);
    }
  };

  const selectedLabelObjects = labels.filter((label) =>
    selectedLabels.includes(label.id),
  );

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 items-center">
        {selectedLabelObjects.map((label) => (
          <LabelBadge
            key={label.id}
            label={label}
            size="sm"
            onRemove={() => toggleLabel(label.id)}
          />
        ))}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Label
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-64 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 uppercase px-2 py-1">
                Select Labels
              </div>
              {labels.length === 0 ? (
                <div className="px-2 py-3 text-sm text-gray-500 text-center">
                  No labels yet. Create one in workspace settings.
                </div>
              ) : (
                <div className="space-y-1">
                  {labels.map((label) => {
                    const isSelected = selectedLabels.includes(label.id);
                    return (
                      <button
                        key={label.id}
                        onClick={() => toggleLabel(label.id)}
                        className="w-full flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <div
                          className="w-4 h-4 rounded border-2 flex items-center justify-center"
                          style={{
                            borderColor: label.color,
                            backgroundColor: isSelected
                              ? label.color
                              : "transparent",
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span
                          className="flex-1 text-left text-sm font-medium"
                          style={{ color: label.color }}
                        >
                          {label.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
