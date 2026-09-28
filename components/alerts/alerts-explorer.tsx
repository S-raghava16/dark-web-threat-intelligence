"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/ui/confidence";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldLabel, SelectInput } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import type { AlertRecord, AlertStatus, SeverityLevel } from "@/lib/types";

const SEVERITY_OPTIONS: Array<{ value: "all" | SeverityLevel; label: string }> = [
  { value: "all", label: "All severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "info", label: "Info" },
];

const STATUS_OPTIONS: Array<{ value: "all" | AlertStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "investigating", label: "Investigating" },
  { value: "closed", label: "Closed" },
];

export function AlertsExplorer({
  alerts,
  actorNames,
}: {
  alerts: AlertRecord[];
  actorNames: Record<string, string>;
}) {
  const [severity, setSeverity] = useState<"all" | SeverityLevel>("all");
  const [status, setStatus] = useState<"all" | AlertStatus>("all");

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity = severity === "all" || alert.severity === severity;
      const matchesStatus = status === "all" || alert.status === status;
      return matchesSeverity && matchesStatus;
    });
  }, [alerts, severity, status]);

  return (
    <div>
      <PageHeader
        title="Alert queue"
        description="Detector alerts generated against the synthetic corpus. Status changes will persist after the backend is added."
      />
      <Card className="mb-4">
        <CardBody className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="alert-severity">Severity</FieldLabel>
            <SelectInput
              id="alert-severity"
              value={severity}
              onChange={(value) => setSeverity(value as "all" | SeverityLevel)}
              options={SEVERITY_OPTIONS}
            />
          </div>
          <div>
            <FieldLabel htmlFor="alert-status">Status</FieldLabel>
            <SelectInput
              id="alert-status"
              value={status}
              onChange={(value) => setStatus(value as "all" | AlertStatus)}
              options={STATUS_OPTIONS}
            />
          </div>
        </CardBody>
      </Card>
      {filtered.length === 0 ? (
        <EmptyState
          title="No alerts in this view"
          description="Adjust severity or status filters."
        />
      ) : (
        <Card>
          <Table caption="Alert list">
            <THead>
              <tr>
                <Th>Timestamp</Th>
                <Th>Alert</Th>
                <Th>Severity</Th>
                <Th>Confidence</Th>
                <Th>Status</Th>
                <Th>Actor</Th>
              </tr>
            </THead>
            <TBody>
              {filtered.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50">
                  <Td className="whitespace-nowrap font-mono text-xs text-slate-600">
                    {formatDateTime(alert.timestamp)}
                  </Td>
                  <Td>
                    <p className="font-medium text-slate-800">{alert.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{alert.summary}</p>
                  </Td>
                  <Td>
                    <SeverityBadge severity={alert.severity} />
                  </Td>
                  <Td>
                    <ConfidenceBadge confidence={alert.confidence} />
                  </Td>
                  <Td>
                    <Badge className="border-slate-200 bg-slate-100 text-slate-700 capitalize">
                      {alert.status}
                    </Badge>
                  </Td>
                  <Td>
                    {alert.actorId ? (
                      <Link
                        href={`/actors/${alert.actorId}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {actorNames[alert.actorId] ?? alert.actorId}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
