import { sampleTasks } from "../data/sampleTasks";
import type { ArchiveViewMode, Task, ViewMode } from "../types/task";

export const STORAGE_KEY = "kanban-task-board-tasks";
export const VIEW_MODE_STORAGE_KEY = "kanban-task-board-view-mode";
export const ARCHIVE_VIEW_MODE_STORAGE_KEY =
  "kanban-task-board-archive-view-mode";
export const SUPABASE_MIGRATION_STORAGE_KEY =
  "kanban-task-board-supabase-migrated";

export const loadTasks = (): Task[] => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return sampleTasks;

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return sampleTasks;
    return parsed as Task[];
  } catch (error) {
    console.warn("タスクの読み込みに失敗しました。サンプルデータを表示します。", error);
    return sampleTasks;
  }
};

export const loadStoredTasks = (): Task[] => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch (error) {
    console.warn("この端末の保存済みタスクを読み込めませんでした。", error);
    return [];
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn("タスクの保存に失敗しました。", error);
  }
};

export const loadSupabaseMigrationDone = (userId: string): boolean => {
  try {
    return (
      window.localStorage.getItem(`${SUPABASE_MIGRATION_STORAGE_KEY}:${userId}`) ===
      "true"
    );
  } catch (error) {
    console.warn("同期移行フラグを読み込めませんでした。", error);
    return false;
  }
};

export const saveSupabaseMigrationDone = (userId: string): void => {
  try {
    window.localStorage.setItem(
      `${SUPABASE_MIGRATION_STORAGE_KEY}:${userId}`,
      "true",
    );
  } catch (error) {
    console.warn("同期移行フラグを保存できませんでした。", error);
  }
};

export const loadViewMode = (): ViewMode => {
  try {
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === "list" || stored === "kanban" ? stored : "kanban";
  } catch (error) {
    console.warn("表示モードの読み込みに失敗しました。", error);
    return "kanban";
  }
};

export const saveViewMode = (viewMode: ViewMode): void => {
  try {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  } catch (error) {
    console.warn("表示モードの保存に失敗しました。", error);
  }
};

export const loadArchiveViewMode = (): ArchiveViewMode => {
  try {
    const stored = window.localStorage.getItem(ARCHIVE_VIEW_MODE_STORAGE_KEY);
    return stored === "archived" || stored === "active" ? stored : "active";
  } catch (error) {
    console.warn("アーカイブ表示モードの読み込みに失敗しました。", error);
    return "active";
  }
};

export const saveArchiveViewMode = (
  archiveViewMode: ArchiveViewMode,
): void => {
  try {
    window.localStorage.setItem(
      ARCHIVE_VIEW_MODE_STORAGE_KEY,
      archiveViewMode,
    );
  } catch (error) {
    console.warn("アーカイブ表示モードの保存に失敗しました。", error);
  }
};
