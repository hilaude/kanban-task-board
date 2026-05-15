import type { Task, TaskStatus } from "../types/task";
import { TASK_STATUSES } from "../types/task";
import { Column } from "./Column";

type BoardProps = {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (taskId: string) => void;
  onArchive: (taskId: string) => void;
  onDropTask: (taskId: string, status: TaskStatus) => void;
};

export function Board({
  tasks,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onDropTask,
}: BoardProps) {
  return (
    <main className="thin-scrollbar flex min-h-0 flex-1 gap-4 overflow-x-auto px-5 py-5">
      {TASK_STATUSES.map((status) => (
        <Column
          key={status.value}
          label={status.label}
          status={status.value}
          tasks={tasks.filter((task) => task.status === status.value)}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          onDropTask={onDropTask}
        />
      ))}
    </main>
  );
}
