import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type {
  Task,
  TaskColor,
  TaskFormValues,
  TaskPriority,
  TaskStatus,
} from "../types/task";
import { TASK_COLORS, TASK_PRIORITIES, TASK_STATUSES } from "../types/task";

type TaskModalProps = {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: TaskFormValues) => void;
};

const emptyValues: TaskFormValues = {
  title: "",
  description: "",
  dueDate: "",
  priority: "medium",
  category: "",
  tags: [],
  status: "todo",
  color: "white",
};

const colorSwatchClasses: Record<TaskColor, string> = {
  white: "bg-white border-slate-300",
  green: "bg-emerald-300 border-emerald-400",
  yellow: "bg-yellow-300 border-yellow-400",
  red: "bg-red-300 border-red-400",
  gray: "bg-slate-300 border-slate-400",
};

export function TaskModal({ task, isOpen, onClose, onSave }: TaskModalProps) {
  const [values, setValues] = useState<TaskFormValues>(emptyValues);
  const [tagText, setTagText] = useState("");
  const [error, setError] = useState("");

  const title = useMemo(() => (task ? "タスク編集" : "タスク追加"), [task]);

  useEffect(() => {
    if (!isOpen) return;

    if (task) {
      setValues({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        category: task.category,
        tags: task.tags,
        status: task.status,
        color: task.color ?? "white",
      });
      setTagText(task.tags.join(", "));
    } else {
      setValues(emptyValues);
      setTagText("");
    }
    setError("");
  }, [isOpen, task]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setField = <K extends keyof TaskFormValues>(
    key: K,
    value: TaskFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedTitle = values.title.trim();
    if (!trimmedTitle) {
      setError("タスク名を入力してください。");
      return;
    }

    onSave({
      ...values,
      title: trimmedTitle,
      category: values.category.trim(),
      tags: tagText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        className="w-full max-w-3xl rounded-xl bg-white shadow-2xl"
        onSubmit={submit}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            className="rounded-md px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
            type="button"
            onClick={onClose}
          >
            閉じる
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              タスク名
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={values.title}
              onChange={(event) => setField("title", event.target.value)}
              autoFocus
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              説明
            </span>
            <textarea
              className="h-24 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              期限
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="date"
              value={values.dueDate}
              onChange={(event) => setField("dueDate", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              優先度
            </span>
            <select
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={values.priority}
              onChange={(event) =>
                setField("priority", event.target.value as TaskPriority)
              }
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              カテゴリ
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={values.category}
              onChange={(event) => setField("category", event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              タグ
            </span>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={tagText}
              onChange={(event) => setTagText(event.target.value)}
              placeholder="カンマ区切り"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              ステータス
            </span>
            <select
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={values.status}
              onChange={(event) =>
                setField("status", event.target.value as TaskStatus)
              }
            >
              {TASK_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <div className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              カード色
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {TASK_COLORS.map((color) => {
                const isSelected = (values.color ?? "white") === color.value;

                return (
                  <button
                    className={`flex h-11 items-center justify-center gap-1 rounded-md border text-sm font-semibold transition sm:h-10 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                    key={color.value}
                    type="button"
                    onClick={() => setField("color", color.value)}
                  >
                    <span
                      className={`h-4 w-4 rounded-full border ${colorSwatchClasses[color.value]}`}
                      aria-hidden="true"
                    />
                    {color.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-sm text-red-600">{error}</p>
          <div className="flex items-center gap-2">
            <button
              className="h-9 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              type="button"
              onClick={onClose}
            >
              キャンセル
            </button>
            <button
              className="h-9 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              type="submit"
            >
              保存
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}
