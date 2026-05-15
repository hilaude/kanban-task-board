import { getSupabaseClient } from "../lib/supabase";
import type { Task, TaskInsert, TaskRow, TaskUpdate } from "../types/task";

const TABLE_NAME = "tasks";

const nowIso = () => new Date().toISOString();

export const dbTaskToTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  dueDate: row.due_date ?? "",
  priority: row.priority,
  category: row.category ?? "",
  tags: row.tags ?? [],
  status: row.status,
  color: row.color ?? "white",
  archived: row.archived ?? false,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const taskToDbInsert = (task: Task, userId: string): TaskInsert => ({
  id: task.id,
  user_id: userId,
  title: task.title,
  description: task.description,
  due_date: task.dueDate || null,
  priority: task.priority,
  category: task.category,
  tags: task.tags,
  status: task.status,
  color: task.color ?? "white",
  archived: task.archived ?? false,
  created_at: task.createdAt,
  updated_at: task.updatedAt,
});

export const taskToDbUpdate = (task: Task): TaskUpdate => ({
  title: task.title,
  description: task.description,
  due_date: task.dueDate || null,
  priority: task.priority,
  category: task.category,
  tags: task.tags,
  status: task.status,
  color: task.color ?? "white",
  archived: task.archived ?? false,
  updated_at: task.updatedAt,
});

const createId = (): string => {
  if ("crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const requireData = <T>(data: T | null, message: string): T => {
  if (!data) throw new Error(message);
  return data;
};

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  const { data, error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`タスク取得に失敗しました: ${error.message}`);
  return ((data ?? []) as TaskRow[]).map(dbTaskToTask);
};

export const createTask = async (
  task: Task,
  userId: string,
): Promise<Task> => {
  const { data, error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .insert(taskToDbInsert(task, userId))
    .select("*")
    .single();

  if (error) throw new Error(`タスク作成に失敗しました: ${error.message}`);
  return dbTaskToTask(requireData(data as TaskRow | null, "作成したタスクを取得できませんでした。"));
};

export const updateTask = async (task: Task): Promise<Task> => {
  const { data, error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .update(taskToDbUpdate(task))
    .eq("id", task.id)
    .select("*")
    .single();

  if (error) throw new Error(`タスク更新に失敗しました: ${error.message}`);
  return dbTaskToTask(requireData(data as TaskRow | null, "更新したタスクを取得できませんでした。"));
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const { error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .delete()
    .eq("id", taskId);

  if (error) throw new Error(`タスク削除に失敗しました: ${error.message}`);
};

export const duplicateTask = async (
  task: Task,
  userId: string,
): Promise<Task> => {
  const timestamp = nowIso();
  return createTask(
    {
      ...task,
      id: createId(),
      title: `${task.title} のコピー`,
      archived: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    userId,
  );
};

export const archiveTask = async (taskId: string): Promise<Task> => {
  const { data, error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .update({ archived: true, updated_at: nowIso() })
    .eq("id", taskId)
    .eq("status", "done")
    .select("*")
    .single();

  if (error) throw new Error(`アーカイブに失敗しました: ${error.message}`);
  return dbTaskToTask(requireData(data as TaskRow | null, "アーカイブしたタスクを取得できませんでした。"));
};

export const restoreTask = async (taskId: string): Promise<Task> => {
  const { data, error } = await getSupabaseClient()
    .from(TABLE_NAME)
    .update({ archived: false, updated_at: nowIso() })
    .eq("id", taskId)
    .select("*")
    .single();

  if (error) throw new Error(`復元に失敗しました: ${error.message}`);
  return dbTaskToTask(requireData(data as TaskRow | null, "復元したタスクを取得できませんでした。"));
};
