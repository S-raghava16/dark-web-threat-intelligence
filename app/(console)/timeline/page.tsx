import type { Metadata } from "next";
import { TimelineExplorer } from "@/components/timeline/timeline-explorer";
import { getTimelineEvents } from "@/lib/db/queries";
export const metadata: Metadata = {
  title: "Timeline",
};
function getConfidenceLevel(
  score: number,
): "low" | "medium" | "high" {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}
export default async function TimelinePage() {
  const dbEvents = await getTimelineEvents();

  const events = dbEvents.map((event) => ({
    id: event.id,
    timestamp: event.timestamp.toISOString(),
    type: event.type,
    title: event.title,
    detail: event.detail,
    confidence: {
      level: getConfidenceLevel(event.confidence),
      score: event.confidence,
    },
    actorId: event.actorId,
    investigationId: event.investigationId,
  }));
  const actorNames = Object.fromEntries(
    dbEvents
      .filter((event) => event.actor)
      .map((event) => [
        event.actor!.id,
        event.actor!.name,
      ])
  );

  const investigationTitles = Object.fromEntries(
    dbEvents
      .filter((event) => event.investigation)
      .map((event) => [
        event.investigation!.id,
        event.investigation!.title,
      ])
  );

  return (
    <TimelineExplorer
      events={events}
      actorNames={actorNames}
      investigationTitles={investigationTitles}
    />
  );
}