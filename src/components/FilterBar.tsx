import type { ChangeEvent } from "react";
import type { Filters } from "../types/task";

type FilterBarProps = {
  filters: Filters;
  categories: string[];
  onChange: (filters: Filters) => void;
  onReset: () => void;
};

const priorityOptions = [
  { value: "all", label: "すべて" },
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
] as const;

export function FilterBar({
  filters,
  categories,
  onChange,
  onReset,
}: FilterBarProps) {
  const update = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    onChange({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        className="h-9 w-64 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        name="query"
        value={filters.query}
        onChange={update}
        placeholder="タスク名で検索"
      />

      <select
        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        name="priority"
        value={filters.priority}
        onChange={update}
        aria-label="優先度フィルター"
      >
        {priorityOptions.map((option) => (
          <option key={option.value} value={option.value}>
            優先度 {option.label}
          </option>
        ))}
      </select>

      <select
        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        name="category"
        value={filters.category}
        onChange={update}
        aria-label="カテゴリフィルター"
      >
        <option value="">カテゴリすべて</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <button
        className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        type="button"
        onClick={onReset}
      >
        リセット
      </button>
    </div>
  );
}
