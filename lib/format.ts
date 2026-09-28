import type { ConfidenceLevel, InvestigationStatus, SeverityLevel } from "@/lib/types";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function formatDateTime(iso: string): string {
  return `${dateTimeFormatter.format(new Date(iso))} UTC`;

}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function confidenceLabel(level: ConfidenceLevel): string {
  if (level === "high") return "High confidence";
  if (level === "medium") return "Medium confidence";
  return "Low confidence";
}

export function severityLabel(level: SeverityLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function investigationStatusLabel(status: InvestigationStatus): string {
  if (status === "review") return "In review";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function humanizeKey(value: string): string {
  return value.replace(/_/g, " ");
}
export function clampScore(score: number): number {
  return Math.min(100, Math.max(0, score));
}
