import type { ViewMode } from "../types/task";

type ViewToggleProps = {
  value: ViewMode;
  onChange: (viewMode: ViewMode) => void;
};

const options: Array<{ value: ViewMode; label: string }> = [
  { value: "kanban", label: "カンバン" },
  { value: "list", label: "リスト" },
];

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      className="flex h-9 overflow-hidden rounded-md border border-slate-300 bg-white p-0.5"
      aria-label="表示切り替え"
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            className={`rounded px-3 text-sm font-semibold transition ${
              selected
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
