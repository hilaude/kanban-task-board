import { useMemo, useState } from "react";
import type { Task } from "../types/task";
import { TASK_STATUSES } from "../types/task";
import { formatJapaneseDate, getDaysUntilDue } from "../utils/date";
import {
  getDueBadgeClass,
  getPriorityLabel,
  getTaskVisualState,
} from "../utils/taskColor";

type ListViewProps = {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate?: (taskId: string) => void;
  onArchive?: (taskId: string) => void;
  onRestore?: (taskId: string) => void;
  archiveViewMode?: "active" | "archived";
  emptyMessage?: string;
};

type ListSortKey = "status" | "dueDate" | "priority" | "category";
type SortDirection = "asc" | "desc";

type SortState = {
  key: ListSortKey;
  direction: SortDirection;
};

const statusOrder: Record<Task["status"], number> = {
  todo: 1,
  doing: 2,
  waiting: 3,
  hold: 4,
  done: 5,
};

const priorityOrder: Record<Task["priority"], number> = {
  high: 1,
  medium: 2,
  low: 3,
};

const compareText = (a: string, b: string): number => {
  const left = a.trim();
  const right = b.trim();
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  return left.localeCompare(right, "ja");
};

const compareDate = (a: string, b: string): number => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
};

const compareTasks = (a: Task, b: Task, key: ListSortKey): number => {
  switch (key) {
    case "status":
      return statusOrder[a.status] - statusOrder[b.status];
    case "dueDate":
      return compareDate(a.dueDate, b.dueDate);
    case "priority":
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    case "category":
      return compareText(a.category, b.category);
  }
};

const sortTasks = (tasks: Task[], sort: SortState | null): Task[] => {
  if (!sort) return tasks;

  const direction = sort.direction === "asc" ? 1 : -1;
  return [...tasks].sort((a, b) => {
    const result = compareTasks(a, b, sort.key);
    if (result !== 0) return result * direction;
    return a.createdAt.localeCompare(b.createdAt);
  });
};

type SortHeaderProps = {
  label: string;
  sortKey: ListSortKey;
  activeSort: SortState | null;
  onSort: (key: ListSortKey) => void;
};

function SortHeader({ label, sortKey, activeSort, onSort }: SortHeaderProps) {
  const isActive = activeSort?.key === sortKey;
  const arrow = isActive ? (activeSort.direction === "asc" ? "↑" : "↓") : "";

  return (
    <button
      className="inline-flex items-center gap-1 rounded px-1 py-0.5 font-bold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
      type="button"
      onClick={() => onSort(sortKey)}
    >
      <span>{label}</span>
      <span className="min-w-3 text-slate-900">{arrow}</span>
    </button>
  );
}

const getStatusLabel = (task: Task): string =>
  TASK_STATUSES.find((status) => status.value === task.status)?.label ??
  task.status;

const getStatusBadgeClass = (task: Task): string => {
  const classes: Record<Task["status"], string> = {
    todo: "bg-slate-100 text-slate-700 ring-slate-200",
    doing: "bg-blue-100 text-blue-700 ring-blue-200",
    waiting: "bg-violet-100 text-violet-700 ring-violet-200",
    done: "bg-slate-100 text-slate-500 ring-slate-200",
    hold: "bg-slate-100 text-slate-500 ring-slate-200",
  };
  return classes[task.status];
};

const getPriorityBadgeClass = (task: Task): string => {
  const classes: Record<Task["priority"], string> = {
    high: "bg-red-100 text-red-700 ring-red-200",
    medium: "bg-blue-100 text-blue-700 ring-blue-200",
    low: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  };
  return classes[task.priority];
};

const getRowClass = (task: Task): string => {
  const state = getTaskVisualState(task);
  if (state === "overdue") return "bg-red-50/70 hover:bg-red-50";
  if (state === "soon") return "bg-orange-50/70 hover:bg-orange-50";
  if (state === "done" || state === "hold") {
    return "bg-slate-50/80 text-slate-500 hover:bg-slate-100";
  }
  return "bg-white hover:bg-slate-50";
};

const getDueText = (task: Task): string => {
  const days = getDaysUntilDue(task.dueDate);
  const date = formatJapaneseDate(task.dueDate);
  const state = getTaskVisualState(task);

  if (state === "done") return `${date} 完了`;
  if (state === "hold") return `${date} 保留`;
  if (days === null) return date;
  if (days < 0) return `${date} 期限切れ`;
  if (days <= 3) return `${date} あと${days}日`;
  return date;
};

export function ListView({
  tasks,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  onRestore,
  archiveViewMode = "active",
  emptyMessage = "条件に合うタスクがありません。",
}: ListViewProps) {
  const [sort, setSort] = useState<SortState | null>(null);

  const sortedTasks = useMemo(() => sortTasks(tasks, sort), [tasks, sort]);

  const toggleSort = (key: ListSortKey) => {
    setSort((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      return {
        key,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  return (
    <main className="thin-scrollbar min-h-0 flex-1 overflow-auto px-5 py-5">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="w-[32%] px-4 py-3">タスク名</th>
              <th className="px-3 py-3">
                <SortHeader
                  label="ステータス"
                  sortKey="status"
                  activeSort={sort}
                  onSort={toggleSort}
                />
              </th>
              <th className="px-3 py-3">
                <SortHeader
                  label="期限"
                  sortKey="dueDate"
                  activeSort={sort}
                  onSort={toggleSort}
                />
              </th>
              <th className="px-3 py-3">
                <SortHeader
                  label="優先度"
                  sortKey="priority"
                  activeSort={sort}
                  onSort={toggleSort}
                />
              </th>
              <th className="px-3 py-3">
                <SortHeader
                  label="カテゴリ"
                  sortKey="category"
                  activeSort={sort}
                  onSort={toggleSort}
                />
              </th>
              <th className="px-3 py-3">タグ</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedTasks.map((task) => (
              <tr key={task.id} className={`transition ${getRowClass(task)}`}>
                <td className="px-4 py-3 align-top">
                  <div className="font-semibold text-slate-900">{task.title}</div>
                  {task.description && (
                    <div className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {task.description}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 align-top">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${getStatusBadgeClass(task)}`}
                  >
                    {getStatusLabel(task)}
                  </span>
                </td>
                <td className="px-3 py-3 align-top">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${getDueBadgeClass(task)}`}
                  >
                    {getDueText(task)}
                  </span>
                </td>
                <td className="px-3 py-3 align-top">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${getPriorityBadgeClass(task)}`}
                  >
                    {getPriorityLabel(task.priority)}
                  </span>
                </td>
                <td className="px-3 py-3 align-top">
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                    {task.category || "未設定"}
                  </span>
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="flex max-w-56 flex-wrap gap-1">
                    {task.tags.length > 0 ? (
                      task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">なし</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex justify-end gap-2">
                    {archiveViewMode === "archived" ? (
                      <button
                        className="rounded border border-blue-200 bg-white px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        type="button"
                        onClick={() => onRestore?.(task.id)}
                      >
                        復元
                      </button>
                    ) : (
                      <>
                        <button
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          type="button"
                          onClick={() => onEdit(task)}
                        >
                          編集
                        </button>
                        <button
                          className="rounded border border-blue-200 bg-white px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          type="button"
                          onClick={() => onDuplicate?.(task.id)}
                        >
                          複製
                        </button>
                        {task.status === "done" && (
                          <button
                            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            type="button"
                            onClick={() => onArchive?.(task.id)}
                          >
                            アーカイブ
                          </button>
                        )}
                      </>
                    )}
                    <button
                      className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      type="button"
                      onClick={() => onDelete(task.id)}
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedTasks.length === 0 && (
          <div className="border-t border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </main>
  );
}
