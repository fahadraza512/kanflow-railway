import { useState } from "react";
import { DependencyType } from "@/types/dependency";
import { Task } from "@/types/kanban";
import { getTasks } from "@/lib/storage";
import { Link2, Search } from "lucide-react";

interface DependencySelectorProps {
  currentTaskId: string | number;
  onAdd: (taskId: string | number, type: DependencyType) => void;
  onClose: () => void;
}

export function DependencySelector({
  currentTaskId,
  onAdd,
  onClose,
}: DependencySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<DependencyType>("blocks");

  const allTasks = getTasks().filter(
    (task) => task.id !== currentTaskId && !task.archived,
  );

  const filteredTasks = allTasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelect = (taskId: string | number) => {
    onAdd(taskId, selectedType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-200 max-h-[600px] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Add Dependency</h3>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType("blocks")}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedType === "blocks"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Blocks
              </button>
              <button
                onClick={() => setSelectedType("blocked_by")}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedType === "blocked_by"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Blocked By
              </button>
              <button
                onClick={() => setSelectedType("relates_to")}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedType === "relates_to"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Relates To
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No tasks found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleSelect(task.id)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {task.status} • {task.priority}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
