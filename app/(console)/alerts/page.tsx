import type { Metadata } from "next";
import { AlertsExplorer } from "@/components/alerts/alerts-explorer";
import { getAlerts } from "@/lib/db/queries";
import type { ConfidenceLevel } from "@/lib/types";

export const metadata: Metadata = {
  title: "Alerts",
};
function getConfidenceLevel(
  score: number,
): ConfidenceLevel {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

export default async function AlertsPage() {

  const dbAlerts = await getAlerts();

  const alerts = dbAlerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    severity: alert.severity,
    confidence: {
      level: getConfidenceLevel(alert.confidence),
      score: alert.confidence,
    },
    timestamp: alert.timestamp.toISOString(),
    status: alert.status,
    summary: alert.summary,
    actorId: alert.actorId,
    investigationId: alert.investigationId,
  }));


  const actorNames = Object.fromEntries(
    dbAlerts
      .filter((alert) => alert.actor)
      .map((alert) => [
        alert.actor!.id,
        alert.actor!.name,
      ])
  );


  return (
    <AlertsExplorer
      alerts={alerts}
      actorNames={actorNames}
    />
  );
}