import { useSubtasks } from "@/hooks/useSubtasks";
import { SubtaskItem } from "./SubtaskItem";
import { SubtaskProgress } from "./SubtaskProgress";
import { AddSubtaskForm } from "./AddSubtaskForm";
import { ListChecks } from "lucide-react";

interface SubtaskListProps {
  taskId: string | number;
}

export function SubtaskList({ taskId }: SubtaskListProps) {
  const {
    subtasks,
    progress,
    addSubtask,
    editSubtask,
    toggleSubtask,
    removeSubtask,
  } = useSubtasks(taskId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <ListChecks className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Subtasks</h3>
      </div>

      {progress.total > 0 && <SubtaskProgress progress={progress} />}

      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <SubtaskItem
            key={subtask.id}
            subtask={subtask}
            onToggle={() => toggleSubtask(subtask.id)}
            onEdit={(title) => editSubtask(subtask.id, title)}
            onDelete={() => {
              if (confirm("Delete this subtask?")) {
                removeSubtask(subtask.id);
              }
            }}
          />
        ))}
      </div>

      <AddSubtaskForm onAdd={addSubtask} />
    </div>
  );
}
