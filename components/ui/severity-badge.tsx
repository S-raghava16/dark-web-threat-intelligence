import { Badge } from "@/components/ui/badge";
import { severityClass } from "@/lib/cn";
import { severityLabel } from "@/lib/format";
import type { SeverityLevel } from "@/lib/types";

export function SeverityBadge({ severity }: { severity: SeverityLevel }) {
  return (
    <Badge className={severityClass[severity]}>{severityLabel(severity)}</Badge>
  );
}
