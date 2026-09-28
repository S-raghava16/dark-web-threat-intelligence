import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/ui/confidence";
import { PageHeader } from "@/components/ui/page-header";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { formatDateTime, humanizeKey } from "@/lib/format";
import type {
  AlertRecord,
  DashboardStats,
  TimelineEvent,
} from "@/lib/types";

export function DashboardView({
  stats,
  attribution,
  activity,
  alerts,
  actorNames,
}: {
  stats: DashboardStats;
  attribution: Array<{ level: "high" | "medium" | "low"; count: number }>;
  activity: TimelineEvent[];
  alerts: AlertRecord[];
  actorNames: Record<string, string>;
}) {
  const maxCount = Math.max(...attribution.map((bucket) => bucket.count), 1);

  return (
    <div>
      <PageHeader
        title="Operations dashboard"
        description="Synthetic intelligence corpus overview. Real-time metrics across monitored threat actors, investigations, and infrastructure telemetry."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total actors"
          value={stats.totalActors}
          hint="Clustered personas in the demo set"
        />
        <StatCard
          label="Active investigations"
          value={stats.activeInvestigations}
          hint="Open or active cases"
        />
        <StatCard
          label="High confidence relationships"
          value={stats.highConfidenceRelationships}
          hint="High-confidence clusters with related personas"
        />
        <StatCard
          label="Infrastructure indicators"
          value={stats.infrastructureIndicators}
          hint="Onion, domain, wallet, PGP, hosting"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader
            title="Attribution overview"
            description="Placeholder chart. Recharts will replace this later."
          />
          <CardBody>
            <ul className="space-y-3">
              {attribution.map((bucket) => (
                <li key={bucket.level}>
                  <div className="mb-1 flex justify-between text-xs text-slate-500 font-medium">
                    <span className="capitalize">{bucket.level} confidence</span>
                    <span className="font-mono text-slate-700 font-semibold">{bucket.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    <div
                      className={
                        bucket.level === "high"
                          ? "h-2 rounded-full bg-emerald-600"
                          : bucket.level === "medium"
                            ? "h-2 rounded-full bg-amber-500"
                            : "h-2 rounded-full bg-slate-400"
                      }
                      style={{ width: `${(bucket.count / maxCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            title="Recent activity"
            description="Latest timeline events from the synthetic corpus."
            action={
              <Link href="/timeline" className="text-sm font-medium text-blue-600 hover:underline">
                View timeline
              </Link>
            }
          />
          <CardBody className="px-0 py-0">
            <Table caption="Recent investigation activity">
              <THead>
                <tr>
                  <Th>Time</Th>
                  <Th>Event</Th>
                  <Th>Actor</Th>
                  <Th>Confidence</Th>
                </tr>
              </THead>
              <TBody>
                {activity.slice(0, 6).map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <Td className="whitespace-nowrap font-mono text-xs text-slate-500">
                      {formatDateTime(event.timestamp)}
                    </Td>
                    <Td>
                      <p className="font-medium text-slate-800">{event.title}</p>
                      <p className="text-xs text-slate-500">{humanizeKey(event.type)}</p>
                    </Td>
                    <Td>
                      {event.actorId ? (
                        <Link
                          href={`/actors/${event.actorId}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {actorNames[event.actorId] ?? event.actorId}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>
                      <ConfidenceBadge confidence={event.confidence} />
                    </Td>
                  </tr>
                ))}
              </TBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Recent alerts"
          description="Detector output against the demo dataset."
          action={
            <Link href="/alerts" className="text-sm font-medium text-blue-600 hover:underline">
              View alerts
            </Link>
          }
        />
        <CardBody className="px-0 py-0">
          <Table caption="Recent alerts">
            <THead>
              <tr>
                <Th>Time</Th>
                <Th>Alert</Th>
                <Th>Severity</Th>
                <Th>Confidence</Th>
                <Th>Status</Th>
              </tr>
            </THead>
            <TBody>
              {alerts.slice(0, 5).map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50">
                  <Td className="whitespace-nowrap font-mono text-xs text-slate-500">
                    {formatDateTime(alert.timestamp)}
                  </Td>
                  <Td>
                    <p className="font-medium text-slate-800">{alert.title}</p>
                    <p className="text-xs text-slate-500">{alert.summary}</p>
                  </Td>
                  <Td>
                    <SeverityBadge severity={alert.severity} />
                  </Td>
                  <Td>
                    <ConfidenceBadge confidence={alert.confidence} />
                  </Td>
                  <Td className="capitalize font-medium text-slate-700">{alert.status}</Td>
                </tr>
              ))}
            </TBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
