import { Badge } from "@/components/ui/badge";
import { confidenceBarClass, confidenceClass } from "@/lib/cn";
import { clampScore, confidenceLabel } from "@/lib/format";
import type { ConfidenceAssessment } from "@/lib/types";

export function ConfidenceBadge({
  confidence,
  showScore = true,
}: {
  confidence: ConfidenceAssessment;
  showScore?: boolean;
}) {
  return (
    <Badge className={confidenceClass[confidence.level]}>
      {confidenceLabel(confidence.level)}
      {showScore ? ` · ${clampScore(confidence.score)}` : null}
    </Badge>
  );
}

export function ConfidenceMeter({
  confidence,
}: {
  confidence: ConfidenceAssessment;
}) {
  const score = clampScore(confidence.score);

  return (
    <div className="min-w-[8rem]">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs font-medium text-slate-500">
        <span>{confidenceLabel(confidence.level)}</span>
        <span className="font-mono font-semibold text-slate-700">{score}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-200"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label="Attribution confidence"
      >
        <div
          className={`h-full rounded-full ${confidenceBarClass[confidence.level]}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
