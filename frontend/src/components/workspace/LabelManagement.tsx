import { useState } from "react";
import { useLabels } from "@/hooks/useLabels";
import { Label, DEFAULT_LABEL_COLORS } from "@/types/label";
import { Plus, Edit2, Trash2, X } from "lucide-react";

export function LabelManagement() {
  const { labels, addLabel, editLabel, removeLabel } = useLabels();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({ name: "", color: DEFAULT_LABEL_COLORS[0] });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Label name is required");
      return;
    }

    try {
      if (editingId) {
        editLabel(editingId, formData.name.trim(), formData.color);
        setEditingId(null);
      } else {
        addLabel(formData.name.trim(), formData.color);
        setIsCreating(false);
      }
      setFormData({ name: "", color: DEFAULT_LABEL_COLORS[0] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (label: Label) => {
    setEditingId(label.id);
    setFormData({ name: label.name, color: label.color });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: "", color: DEFAULT_LABEL_COLORS[0] });
    setError("");
  };

  const handleDelete = (id: string | number) => {
    if (confirm("Are you sure you want to delete this label?")) {
      removeLabel(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Labels</h3>
          <p className="text-sm text-gray-600">
            Manage labels for organizing tasks
          </p>
        </div>
        {!isCreating && !editingId && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Label
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Bug, Feature, Urgent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {labels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No labels yet. Create your first label to get started.</p>
          </div>
        ) : (
          labels.map((label) => (
            <div
              key={label.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span className="font-medium text-gray-900">{label.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(label)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Edit label"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(label.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete label"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
