import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { AuthPanel } from "./components/AuthPanel";
import { Board } from "./components/Board";
import { FilterBar } from "./components/FilterBar";
import { ListView } from "./components/ListView";
import { TaskModal } from "./components/TaskModal";
import { ViewToggle } from "./components/ViewToggle";
import { supabase, supabaseConfigError } from "./lib/supabase";
import * as taskService from "./services/taskService";
import type {
  ArchiveViewMode,
  Filters,
  Task,
  TaskFormValues,
  TaskStatus,
  ViewMode,
} from "./types/task";
import { toDateInputValue } from "./utils/date";
import {
  loadArchiveViewMode,
  loadTasks,
  loadViewMode,
  saveArchiveViewMode,
  saveTasks,
  saveViewMode,
} from "./utils/storage";

const defaultFilters: Filters = {
  query: "",
  priority: "all",
  category: "",
};

const createId = (): string => {
  if ("crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const uniqueValues = (values: string[]): string[] =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "ja"),
  );

const replaceTask = (tasks: Task[], updatedTask: Task): Task[] =>
  tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task));

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [viewMode, setViewMode] = useState<ViewMode>(() => loadViewMode());
  const [archiveViewMode, setArchiveViewMode] = useState<ArchiveViewMode>(() =>
    loadArchiveViewMode(),
  );
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const userId = session?.user.id ?? "";

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) setErrorMessage(error.message);
        setSession(data.session);
      })
      .finally(() => setIsAuthLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setErrorMessage("");
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    setIsTasksLoading(true);
    setErrorMessage("");

    taskService
      .fetchTasks(session.user.id)
      .then(setTasks)
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "タスクの取得に失敗しました。",
        );
      })
      .finally(() => setIsTasksLoading(false));
  }, [session]);

  useEffect(() => {
    if (!session) saveTasks(tasks);
  }, [session, tasks]);

  useEffect(() => {
    saveViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    saveArchiveViewMode(archiveViewMode);
  }, [archiveViewMode]);

  const archiveScopedTasks = useMemo(() => {
    return tasks.filter((task) =>
      archiveViewMode === "archived"
        ? task.archived === true
        : task.archived !== true,
    );
  }, [archiveViewMode, tasks]);

  const filteredTasks = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return archiveScopedTasks.filter((task) => {
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesPriority =
        filters.priority === "all" || task.priority === filters.priority;
      const matchesCategory =
        !filters.category || task.category === filters.category;

      return matchesQuery && matchesPriority && matchesCategory;
    });
  }, [archiveScopedTasks, filters]);

  const categories = useMemo(
    () => uniqueValues(tasks.map((task) => task.category)),
    [tasks],
  );

  const requireLogin = () => {
    if (!userId) {
      setErrorMessage("ログイン状態を確認できません。もう一度ログインしてください。");
      return false;
    }
    return true;
  };

  const openNewTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setIsModalOpen(false);
  };

  const saveTask = async (values: TaskFormValues) => {
    if (!requireLogin()) return;

    const now = new Date().toISOString();
    setErrorMessage("");

    try {
      if (selectedTask) {
        const updatedTask = await taskService.updateTask({
          ...selectedTask,
          ...values,
          updatedAt: now,
        });
        setTasks((current) => replaceTask(current, updatedTask));
      } else {
        const createdTask = await taskService.createTask(
          {
            ...values,
            id: createId(),
            archived: false,
            createdAt: now,
            updatedAt: now,
          },
          userId,
        );
        setTasks((current) => [createdTask, ...current]);
      }
      closeModal();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "タスク保存に失敗しました。",
      );
    }
  };

  const deleteTask = async (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    if (!window.confirm(`「${task.title}」を削除しますか？`)) return;

    setErrorMessage("");
    try {
      await taskService.deleteTask(taskId);
      setTasks((current) => current.filter((item) => item.id !== taskId));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "タスク削除に失敗しました。",
      );
    }
  };

  const duplicateTask = async (taskId: string) => {
    if (!requireLogin()) return;

    const source = tasks.find((task) => task.id === taskId);
    if (!source) return;

    setErrorMessage("");
    try {
      const duplicatedTask = await taskService.duplicateTask(source, userId);
      setTasks((current) => [duplicatedTask, ...current]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "タスク複製に失敗しました。",
      );
    }
  };

  const archiveTask = async (taskId: string) => {
    setErrorMessage("");
    try {
      const archivedTask = await taskService.archiveTask(taskId);
      setTasks((current) => replaceTask(current, archivedTask));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "アーカイブに失敗しました。",
      );
    }
  };

  const restoreTask = async (taskId: string) => {
    setErrorMessage("");
    try {
      const restoredTask = await taskService.restoreTask(taskId);
      setTasks((current) => replaceTask(current, restoredTask));
      setArchiveViewMode("active");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "復元に失敗しました。",
      );
    }
  };

  const moveTask = async (taskId: string, status: TaskStatus) => {
    const source = tasks.find((task) => task.id === taskId);
    if (!source || source.status === status) return;

    setErrorMessage("");
    try {
      const updatedTask = await taskService.updateTask({
        ...source,
        status,
        updatedAt: new Date().toISOString(),
      });
      setTasks((current) => replaceTask(current, updatedTask));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "ステータス変更に失敗しました。",
      );
    }
  };

  const exportTasks = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kanban-tasks-${toDateInputValue(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const logout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setTasks(loadTasks());
    setSession(null);
  };

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-sm font-semibold text-slate-600">
        ログイン状態を確認しています...
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <AuthPanel onError={setErrorMessage} />
        {errorMessage && (
          <div className="fixed inset-x-4 bottom-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-lg">
            {errorMessage}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-normal text-slate-950">
              Kanban Task Board
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              {filteredTasks.length} / {archiveScopedTasks.length} 件を表示
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-600">
              表示対象:{" "}
              {archiveViewMode === "archived" ? "アーカイブ" : "通常"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              ログイン中: {session.user.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex h-9 overflow-hidden rounded-md border border-slate-300 bg-white p-0.5">
              <button
                className={`rounded px-3 text-sm font-semibold transition ${
                  archiveViewMode === "active"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                type="button"
                onClick={() => setArchiveViewMode("active")}
              >
                通常表示
              </button>
              <button
                className={`rounded px-3 text-sm font-semibold transition ${
                  archiveViewMode === "archived"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                type="button"
                onClick={() => setArchiveViewMode("archived")}
              >
                アーカイブ表示
              </button>
            </div>
            {archiveViewMode === "active" && (
              <ViewToggle value={viewMode} onChange={setViewMode} />
            )}
            <FilterBar
              filters={filters}
              categories={categories}
              onChange={setFilters}
              onReset={() => setFilters(defaultFilters)}
            />
            {archiveViewMode === "active" && (
              <button
                className="h-9 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                type="button"
                onClick={openNewTask}
              >
                タスク追加
              </button>
            )}
            <button
              className="h-9 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              type="button"
              onClick={exportTasks}
              title="現在のタスクをJSONファイルとして保存します"
            >
              バックアップ
            </button>
            <button
              className="h-9 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              type="button"
              onClick={logout}
            >
              ログアウト
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        )}

        {supabaseConfigError && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {supabaseConfigError}
          </div>
        )}

        {archiveViewMode === "archived" && (
          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
            アーカイブ済みタスクを表示中
          </div>
        )}
      </header>

      {isTasksLoading ? (
        <main className="flex min-h-0 flex-1 items-center justify-center text-sm font-semibold text-slate-500">
          タスクを読み込んでいます...
        </main>
      ) : archiveViewMode === "archived" ? (
        <ListView
          tasks={filteredTasks}
          onEdit={openEditTask}
          onDelete={deleteTask}
          onRestore={restoreTask}
          archiveViewMode="archived"
          emptyMessage="アーカイブ済みタスクはありません"
        />
      ) : viewMode === "kanban" ? (
        <Board
          tasks={filteredTasks}
          onEdit={openEditTask}
          onDelete={deleteTask}
          onDuplicate={duplicateTask}
          onArchive={archiveTask}
          onDropTask={moveTask}
        />
      ) : (
        <ListView
          tasks={filteredTasks}
          onEdit={openEditTask}
          onDelete={deleteTask}
          onDuplicate={duplicateTask}
          onArchive={archiveTask}
          archiveViewMode="active"
        />
      )}

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={saveTask}
      />
    </div>
  );
}

export default App;
