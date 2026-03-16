import { useState } from "react";
import { useTemplates } from "@/hooks/useTemplates";
import { TaskTemplate } from "@/types/template";
import { Plus, Edit2, Trash2, FileText, Copy } from "lucide-react";

export function TemplateManagement() {
  const { templates, addTemplate, editTemplate, removeTemplate } = useTemplates();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    title: "",
    taskDescription: "",
    priority: "medium" as const,
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Template name is required");
      return;
    }

    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    try {
      if (editingId) {
        editTemplate(editingId, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          title: formData.title.trim(),
          taskDescription: formData.taskDescription.trim(),
          priority: formData.priority,
          labels: [],
          subtasks: [],
        });
        setEditingId(null);
      } else {
        addTemplate({
          name: formData.name.trim(),
          description: formData.description.trim(),
          title: formData.title.trim(),
          taskDescription: formData.taskDescription.trim(),
          priority: formData.priority,
          labels: [],
          subtasks: [],
        });
        setIsCreating(false);
      }
      setFormData({
        name: "",
        description: "",
        title: "",
        taskDescription: "",
        priority: "medium",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      description: template.description,
      title: template.title,
      taskDescription: template.taskDescription || "",
      priority: template.priority,
    });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      title: "",
      taskDescription: "",
      priority: "medium",
    });
    setError("");
  };

  const handleDelete = (id: string | number) => {
    if (confirm("Delete this template?")) {
      removeTemplate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Task Templates</h3>
          <p className="text-sm text-gray-600">
            Create reusable task templates for common workflows
          </p>
        </div>
        {!isCreating && !editingId && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Bug Report, Feature Request"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What is this template for?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Default title for tasks created from this template"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Description
            </label>
            <textarea
              value={formData.taskDescription}
              onChange={(e) =>
                setFormData({ ...formData, taskDescription: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Default description for tasks"
            />
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
        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No templates yet. Create your first template to get started.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {template.priority}
                  </span>
                </div>
                {template.description && (
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Task: {template.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label="Edit template"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete template"
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
