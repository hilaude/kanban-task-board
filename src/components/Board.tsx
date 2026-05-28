import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "../types/task";
import { TASK_STATUSES } from "../types/task";
import { Column } from "./Column";

type BoardSortKey = "default" | "dueDate" | "priority" | "newest";

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
  const [sortKey, setSortKey] = useState<BoardSortKey>("default");

  const sortedTasks = useMemo(() => {
    if (sortKey === "default") return tasks;

    const priorityOrder: Record<Task["priority"], number> = {
      high: 1,
      medium: 2,
      low: 3,
    };

    const compareDate = (a: string, b: string): number => {
      if (!a && !b) return 0;
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    };

    return [...tasks].sort((a, b) => {
      if (sortKey === "dueDate") {
        return compareDate(a.dueDate, b.dueDate);
      }
      if (sortKey === "priority") {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [sortKey, tasks]);

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-5 py-3">
        <label
          className="text-sm font-bold text-slate-700"
          htmlFor="kanban-sort"
        >
          並び替え
        </label>
        <select
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm"
          id="kanban-sort"
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as BoardSortKey)}
        >
          <option value="default">標準</option>
          <option value="dueDate">期限が近い順</option>
          <option value="priority">優先度が高い順</option>
          <option value="newest">新しい順</option>
        </select>
      </div>

      <div className="thin-scrollbar flex min-h-0 flex-1 gap-4 overflow-x-auto px-5 py-5">
        {TASK_STATUSES.map((status) => (
          <Column
            key={status.value}
            label={status.label}
            status={status.value}
            tasks={sortedTasks.filter((task) => task.status === status.value)}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onArchive={onArchive}
            onDropTask={onDropTask}
          />
        ))}
      </div>
    </main>
  );
}
