import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import {
  getActorNamesById,
} from "@/lib/data/queries";

import {
  getAlerts,
  getAttributionBuckets,
  getDashboardStats,
  getTimelineEvents,
} from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const attribution = await getAttributionBuckets();
  
  const dbActivity = await getTimelineEvents();
  
  const activity = dbActivity.map((event) => ({
    id: event.id,
    timestamp: event.timestamp.toISOString(),
    type: event.type,
    title: event.title,
    detail: event.detail,
    confidence: {
      level:
        event.confidence >= 75
          ? ("high" as const)
          : event.confidence >= 50
            ? ("medium" as const)
            : ("low" as const),
      score: event.confidence,
    },
    actorId: event.actorId,
    investigationId: event.investigationId,
  }));
  
  const dbAlerts = await getAlerts();

  const alerts = dbAlerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    severity: alert.severity,
    confidence: {
      level:
        alert.confidence >= 75
          ? ("high" as const)
          : alert.confidence >= 50
            ? ("medium" as const)
            : ("low" as const),
      score: alert.confidence,
    },
    timestamp: alert.timestamp.toISOString(),
    status: alert.status,
    summary: alert.summary,
    actorId: alert.actorId,
    investigationId: alert.investigationId,
  }));
  return (
    <DashboardView
      stats={stats}
      attribution={attribution}
      activity={activity}
      alerts={alerts}
      actorNames={getActorNamesById()}
    />
  );
}
