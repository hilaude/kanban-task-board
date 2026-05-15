import type { DragEvent } from "react";
import type { Task, TaskStatus } from "../types/task";
import { TaskCard } from "./TaskCard";

type ColumnProps = {
  label: string;
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (taskId: string) => void;
  onArchive: (taskId: string) => void;
  onDropTask: (taskId: string, status: TaskStatus) => void;
};

export function Column({
  label,
  status,
  tasks,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onDropTask,
}: ColumnProps) {
  const allowDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const dropTask = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    if (taskId) onDropTask(taskId, status);
  };

  return (
    <section
      className="flex h-full w-[288px] shrink-0 flex-col rounded-lg border border-slate-200 bg-slate-100/80"
      onDragOver={allowDrop}
      onDrop={dropTask}
    >
      <header className="flex items-center justify-between border-b border-slate-200 px-3 py-3">
        <h2 className="text-sm font-bold text-slate-800">{label}</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {tasks.length}
        </span>
      </header>

      <div className="thin-scrollbar flex-1 space-y-3 overflow-y-auto p-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
          />
        ))}

        {tasks.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-300 bg-white/60 p-4 text-center text-xs text-slate-400">
            ここにタスクを移動
          </div>
        )}
      </div>
    </section>
  );
}
