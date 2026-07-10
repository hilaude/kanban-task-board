import type { Task, TaskColor, TaskPriority } from "../types/task";
import { formatJapaneseDate, getDaysUntilDue } from "./date";

export type TaskVisualState = "overdue" | "soon" | "done" | "hold" | "normal";

export const getTaskVisualState = (task: Task): TaskVisualState => {
  if (task.status === "done") return "done";
  if (task.status === "hold") return "hold";

  const daysUntilDue = getDaysUntilDue(task.dueDate);
  if (daysUntilDue === null) return "normal";
  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 3) return "soon";
  return "normal";
};

export const getPriorityLabel = (priority: TaskPriority): string => {
  const labels: Record<TaskPriority, string> = {
    high: "高",
    medium: "中",
    low: "低",
  };
  return labels[priority];
};

export const getPriorityLineClass = (priority: TaskPriority): string => {
  const classes: Record<TaskPriority, string> = {
    high: "bg-red-500",
    medium: "bg-blue-500",
    low: "bg-emerald-500",
  };
  return classes[priority];
};

const getTaskColorClasses = (color: TaskColor | undefined): string => {
  const classes: Record<TaskColor, string> = {
    white: "border-slate-200 bg-white",
    green: "border-emerald-300 bg-emerald-100",
    yellow: "border-yellow-300 bg-yellow-100",
    red: "border-red-300 bg-red-100",
    gray: "border-slate-300 bg-slate-200",
  };
  return classes[color ?? "white"];
};

export const getTaskCardClasses = (task: Task): string => {
  return getTaskColorClasses(task.color);
};

export const getTaskLineClass = (task: Task): string => {
  const state = getTaskVisualState(task);
  if (state === "overdue") return "bg-red-600";
  if (state === "soon") return "bg-orange-500";
  if (state === "done" || state === "hold") return "bg-slate-400";
  return getPriorityLineClass(task.priority);
};

export const getDueText = (task: Task): string => {
  const state = getTaskVisualState(task);
  const days = getDaysUntilDue(task.dueDate);
  const date = formatJapaneseDate(task.dueDate);

  if (state === "done") return `${date} 完了`;
  if (state === "hold") return `${date} 保留`;
  if (days === null) return date;
  if (days < 0) return `${date} 期限切れ`;
  if (days === 0) return `${date} 今日`;
  if (days <= 3) return `${date} あと${days}日`;
  return date;
};

export const getDueBadgeClass = (task: Task): string => {
  const state = getTaskVisualState(task);
  const classes: Record<TaskVisualState, string> = {
    overdue: "bg-red-100 text-red-700 ring-red-200",
    soon: "bg-orange-100 text-orange-700 ring-orange-200",
    done: "bg-slate-100 text-slate-500 ring-slate-200",
    hold: "bg-slate-100 text-slate-500 ring-slate-200",
    normal: "bg-slate-100 text-slate-600 ring-slate-200",
  };
  return classes[state];
};
