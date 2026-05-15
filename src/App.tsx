import { useEffect, useMemo, useState } from "react";
import { Board } from "./components/Board";
import { FilterBar } from "./components/FilterBar";
import { ListView } from "./components/ListView";
import { TaskModal } from "./components/TaskModal";
import { ViewToggle } from "./components/ViewToggle";
import type {
  ArchiveViewMode,
  Filters,
  Task,
  TaskFormValues,
  TaskStatus,
  ViewMode,
} from "./types/task";
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

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [viewMode, setViewMode] = useState<ViewMode>(() => loadViewMode());
  const [archiveViewMode, setArchiveViewMode] = useState<ArchiveViewMode>(() =>
    loadArchiveViewMode(),
  );
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

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
      const matchesQuery = !query || task.title.toLowerCase().includes(query);
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

  const saveTask = (values: TaskFormValues) => {
    const now = new Date().toISOString();

    if (selectedTask) {
      setTasks((current) =>
        current.map((task) =>
          task.id === selectedTask.id
            ? { ...task, ...values, updatedAt: now }
            : task,
        ),
      );
    } else {
      setTasks((current) => [
        {
          ...values,
          id: createId(),
          archived: false,
          createdAt: now,
          updatedAt: now,
        },
        ...current,
      ]);
    }

    closeModal();
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    if (!window.confirm(`「${task.title}」を削除しますか？`)) return;

    setTasks((current) => current.filter((item) => item.id !== taskId));
  };

  const duplicateTask = (taskId: string) => {
    const now = new Date().toISOString();

    setTasks((current) => {
      const source = current.find((task) => task.id === taskId);
      if (!source) return current;

      return [
        {
          ...source,
          id: createId(),
          title: `${source.title} のコピー`,
          archived: false,
          createdAt: now,
          updatedAt: now,
        },
        ...current,
      ];
    });
  };

  const archiveTask = (taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId && task.status === "done"
          ? { ...task, archived: true, updatedAt: new Date().toISOString() }
          : task,
      ),
    );
  };

  const restoreTask = (taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, archived: false, updatedAt: new Date().toISOString() }
          : task,
      ),
    );
    setArchiveViewMode("active");
  };

  const moveTask = (taskId: string, status: TaskStatus) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId && task.status !== status
          ? { ...task, status, updatedAt: new Date().toISOString() }
          : task,
      ),
    );
  };

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
              表示対象: {archiveViewMode === "archived" ? "アーカイブ" : "通常"}
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
          </div>
        </div>
        {archiveViewMode === "archived" && (
          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
            アーカイブ済みタスクを表示中
          </div>
        )}
      </header>

      {archiveViewMode === "archived" ? (
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
