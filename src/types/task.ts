export type TaskPriority = "high" | "medium" | "low";

export type TaskStatus = "todo" | "doing" | "waiting" | "done" | "hold";

export type TaskColor = "white" | "green" | "yellow" | "red" | "gray";

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
  color?: TaskColor;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string | null;
  priority: TaskPriority;
  category: string;
  tags: string[];
  status: TaskStatus;
  color?: TaskColor | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type TaskInsert = TaskRow;

export type TaskUpdate = Partial<
  Omit<TaskRow, "id" | "user_id" | "created_at">
> & {
  updated_at: string;
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
  { value: "hold", label: "保留" },
  { value: "done", label: "完了" },
];

export const TASK_PRIORITIES: Array<{ value: TaskPriority; label: string }> = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

export const TASK_COLORS: Array<{ value: TaskColor; label: string }> = [
  { value: "white", label: "白" },
  { value: "green", label: "緑" },
  { value: "yellow", label: "黄" },
  { value: "red", label: "赤" },
  { value: "gray", label: "灰" },
];
