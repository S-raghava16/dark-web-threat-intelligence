import type { ConfidenceLevel, SeverityLevel } from "@/lib/types";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const confidenceClass: Record<ConfidenceLevel, string> = {
  high: "text-emerald-700 bg-emerald-50 border-emerald-200",
  medium: "text-amber-800 bg-amber-50 border-amber-200",
  low: "text-slate-700 bg-slate-100 border-slate-200",
};

export const confidenceBarClass: Record<ConfidenceLevel, string> = {
  high: "bg-emerald-600",
  medium: "bg-amber-500",
  low: "bg-slate-400",
};

export const severityClass: Record<SeverityLevel, string> = {
  critical: "text-red-700 bg-red-50 border-red-200",
  high: "text-orange-800 bg-orange-50 border-orange-200",
  medium: "text-amber-800 bg-amber-50 border-amber-200",
  low: "text-blue-700 bg-blue-50 border-blue-200",
  info: "text-slate-700 bg-slate-100 border-slate-200",
};
