import type { Task, TaskPriority } from "../types/task";
import { getDaysUntilDue } from "./date";

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

export const getTaskCardClasses = (task: Task): string => {
  const state = getTaskVisualState(task);
  const classes: Record<TaskVisualState, string> = {
    overdue: "border-red-200 bg-red-50/80",
    soon: "border-orange-200 bg-orange-50/80",
    done: "border-slate-200 bg-slate-50 text-slate-500",
    hold: "border-slate-200 bg-slate-100/80 text-slate-500",
    normal: "border-slate-200 bg-white",
  };
  return classes[state];
};

export const getTaskLineClass = (task: Task): string => {
  const state = getTaskVisualState(task);
  if (state === "overdue") return "bg-red-600";
  if (state === "soon") return "bg-orange-500";
  if (state === "done" || state === "hold") return "bg-slate-400";
  return getPriorityLineClass(task.priority);
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
