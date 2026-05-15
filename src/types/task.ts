export type TaskPriority = "high" | "medium" | "low";

export type TaskStatus = "todo" | "doing" | "waiting" | "done" | "hold";

export type ViewMode = "kanban" | "list";

export type ArchiveViewMode = "active" | "archived";

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  category: string;
  tags: string[];
  status: TaskStatus;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Filters = {
  query: string;
  priority: "all" | TaskPriority;
  category: string;
};

export type TaskFormValues = Omit<Task, "id" | "createdAt" | "updatedAt">;

export const TASK_STATUSES: Array<{ value: TaskStatus; label: string }> = [
  { value: "todo", label: "未着手" },
  { value: "doing", label: "対応中" },
  { value: "waiting", label: "確認待ち" },
  { value: "done", label: "完了" },
  { value: "hold", label: "保留" },
];

export const TASK_PRIORITIES: Array<{ value: TaskPriority; label: string }> = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];
