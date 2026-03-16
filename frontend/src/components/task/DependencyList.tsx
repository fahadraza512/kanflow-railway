import { useState } from "react";
import { useDependencies } from "@/hooks/useDependencies";
import { DependencySelector } from "./DependencySelector";
import { getTaskById } from "@/lib/storage";
import { Link2, Plus, X, AlertCircle } from "lucide-react";

interface DependencyListProps {
  taskId: string | number;
  readOnly?: boolean;
}

export function DependencyList({ taskId, readOnly }: DependencyListProps) {
  const {
    dependencies,
    error,
    addDependency,
    removeDependency,
    getBlockingTasks,
    getBlockedTasks,
    getRelatedTasks,
  } = useDependencies(taskId);
  const [showSelector, setShowSelector] = useState(false);

  const blockingTasks = getBlockingTasks();
  const blockedTasks = getBlockedTasks();
  const relatedTasks = getRelatedTasks();

  const renderDependencyItem = (
    depTaskId: string | number,
    type: string,
    depId: string | number,
  ) => {
    const task = getTaskById(depTaskId);
    if (!task) return null;

    const typeColors = {
      blocks: "bg-red-100 text-red-600",
      blocked_by: "bg-orange-100 text-orange-600",
      relates_to: "bg-blue-100 text-blue-600",
    };

    return (
      <div
        key={depId}
        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                typeColors[type as keyof typeof typeColors]
              }`}
            >
              {type.replace("_", " ")}
            </span>
            <span className="text-xs text-gray-500">
              {task.status} • {task.priority}
            </span>
          </div>
        </div>
        {!readOnly && (
          <button
            onClick={() => removeDependency(depId)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            aria-label="Remove dependency"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  const hasDependencies =
    blockingTasks.length > 0 ||
    blockedTasks.length > 0 ||
    relatedTasks.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Dependencies</h3>
        </div>
        {!readOnly && (
          <button
            onClick={() => setShowSelector(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 text-red-600 text-sm rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {blockingTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">
            Blocking Tasks
          </p>
          {blockingTasks.map((dep) =>
            renderDependencyItem(dep.dependsOnTaskId, "blocked_by", dep.id),
          )}
        </div>
      )}

      {blockedTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">
            Blocked Tasks
          </p>
          {blockedTasks.map((dep) =>
            renderDependencyItem(dep.taskId, "blocks", dep.id),
          )}
        </div>
      )}

      {relatedTasks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">
            Related Tasks
          </p>
          {relatedTasks.map((dep) => {
            const relatedTaskId =
              dep.taskId === taskId ? dep.dependsOnTaskId : dep.taskId;
            return renderDependencyItem(relatedTaskId, "relates_to", dep.id);
          })}
        </div>
      )}

      {!hasDependencies && (
        <p className="text-sm text-gray-500">No dependencies</p>
      )}

      {showSelector && (
        <DependencySelector
          currentTaskId={taskId}
          onAdd={addDependency}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}
