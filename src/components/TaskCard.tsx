import type { DragEvent } from "react";
import type { Task } from "../types/task";
import { formatJapaneseDate, getDaysUntilDue } from "../utils/date";
import {
  getDueBadgeClass,
  getPriorityLabel,
  getTaskCardClasses,
  getTaskLineClass,
  getTaskVisualState,
} from "../utils/taskColor";

type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (taskId: string) => void;
  onArchive: (taskId: string) => void;
};

const dueText = (task: Task): string => {
  const state = getTaskVisualState(task);
  const days = getDaysUntilDue(task.dueDate);
  const date = formatJapaneseDate(task.dueDate);

  if (state === "done") return `${date} 完了`;
  if (state === "hold") return `${date} 保留`;
  if (days === null) return date;
  if (days < 0) return `${date} 期限切れ`;
  if (days <= 3) return `${date} あと${days}日`;
  return date;
};

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
}: TaskCardProps) {
  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData("text/plain", task.id);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-lg border py-3 pl-4 pr-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-md ${getTaskCardClasses(task)}`}
      draggable
      onDragStart={onDragStart}
    >
      <span
        className={`absolute inset-y-0 left-0 w-1 ${getTaskLineClass(task)}`}
        aria-hidden="true"
      />

      <div className="mb-2 space-y-2">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-1 opacity-80 transition group-hover:opacity-100">
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
            onClick={() => onDuplicate(task.id)}
          >
            複製
          </button>
          {task.status === "done" && (
            <button
              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              type="button"
              onClick={() => onArchive(task.id)}
            >
              アーカイブ
            </button>
          )}
          <button
            className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            type="button"
            onClick={() => onDelete(task.id)}
          >
            削除
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-600">
          {task.description}
        </p>
      )}

      <div className="mb-3 text-xs text-slate-600">
        <span className="block text-[11px] text-slate-400">カテゴリ</span>
        <span className="font-medium text-slate-700">
          {task.category || "未設定"}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${getDueBadgeClass(task)}`}
        >
          {dueText(task)}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
          優先度 {getPriorityLabel(task.priority)}
        </span>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span
              className="rounded bg-white/70 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
