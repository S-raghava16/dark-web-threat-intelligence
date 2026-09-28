"use client";

import { cx } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Section tabs"
      className="flex flex-wrap gap-1 border-b border-slate-200"
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            id={`tab-${item.id}`}
            onClick={() => onChange(item.id)}
            className={cx(
              "rounded-t-md px-3.5 py-2 text-sm font-medium transition-colors",
              selected
                ? "border-b-2 border-blue-600 text-blue-700 font-semibold bg-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
