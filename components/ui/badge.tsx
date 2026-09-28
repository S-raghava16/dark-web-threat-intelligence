import { cx } from "@/lib/cn";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium tracking-wide",
        className ?? "border-slate-200 bg-slate-100 text-slate-700",
      )}
    >
      {children}
    </span>
  );
}
