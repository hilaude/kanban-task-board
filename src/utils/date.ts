const DAY_MS = 24 * 60 * 60 * 1000;

export const getDateOnly = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const getDaysUntilDue = (dueDate: string): number | null => {
  if (!dueDate) return null;
  const due = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;

  const today = getDateOnly(new Date());
  return Math.ceil((getDateOnly(due).getTime() - today.getTime()) / DAY_MS);
};

export const formatJapaneseDate = (dueDate: string): string => {
  if (!dueDate) return "期限なし";
  const date = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "期限なし";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(date);
};
