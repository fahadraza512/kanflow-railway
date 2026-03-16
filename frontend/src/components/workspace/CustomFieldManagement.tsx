import { useState } from "react";
import { useCustomFields } from "@/hooks/useCustomFields";
import { CustomField, CustomFieldType } from "@/types/customField";
import { Plus, Edit2, Trash2, Settings } from "lucide-react";

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select" },
  { value: "multiselect", label: "Multi-Select" },
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
];

export function CustomFieldManagement() {
  const { fields, addField, editField, removeField } = useCustomFields();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    type: CustomFieldType;
    required: boolean;
    options: string;
  }>({
    name: "",
    type: "text",
    required: false,
    options: "",
  });
  const [error, setError] = useState("");

  const needsOptions = formData.type === "select" || formData.type === "multiselect";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Field name is required");
      return;
    }

    if (needsOptions && !formData.options.trim()) {
      setError("Options are required for select fields");
      return;
    }

    const options = needsOptions
      ? formData.options.split(",").map((o) => o.trim()).filter(Boolean)
      : undefined;

    try {
      if (editingId) {
        editField(editingId, {
          name: formData.name.trim(),
          type: formData.type,
          required: formData.required,
          options,
        });
        setEditingId(null);
      } else {
        addField({
          name: formData.name.trim(),
          type: formData.type,
          required: formData.required,
          options,
        });
        setIsCreating(false);
      }
      setFormData({ name: "", type: "text", required: false, options: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (field: CustomField) => {
    setEditingId(field.id);
    setFormData({
      name: field.name,
      type: field.type,
      required: field.required,
      options: field.options?.join(", ") || "",
    });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: "", type: "text", required: false, options: "" });
    setError("");
  };

  const handleDelete = (id: string | number) => {
    if (confirm("Delete this custom field? Task data will be preserved.")) {
      removeField(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Custom Fields</h3>
          <p className="text-sm text-gray-600">
            Add custom fields to capture additional task information
          </p>
        </div>
        {!isCreating && !editingId && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Field
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Story Points, Sprint"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as CustomFieldType })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {FIELD_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {needsOptions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (comma-separated)
              </label>
              <input
                type="text"
                value={formData.options}
                onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Low, Medium, High"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate options with commas
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={formData.required}
              onChange={(e) =>
                setFormData({ ...formData, required: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="required" className="text-sm text-gray-700">
              Required field
            </label>
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
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No custom fields yet. Create your first field to get started.</p>
          </div>
        ) : (
          fields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{field.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {FIELD_TYPES.find((t) => t.value === field.type)?.label}
                  </span>
                  {field.required && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                {field.options && (
                  <p className="text-xs text-gray-500 mt-1">
                    Options: {field.options.join(", ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(field)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Edit field"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(field.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete field"
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
