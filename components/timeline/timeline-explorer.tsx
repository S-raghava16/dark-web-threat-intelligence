"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/ui/confidence";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FieldLabel,
  SelectInput,
  TextInput,
} from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import type { TimelineEvent, TimelineEventType } from "@/lib/types";
import { formatDateTime, humanizeKey } from "@/lib/format";

const EVENT_OPTIONS: Array<{ value: "all" | TimelineEventType; label: string }> =
  [
    { value: "all", label: "All event types" },
    { value: "listing", label: "Listing" },
    { value: "forum_post", label: "Forum post" },
    { value: "pgp_rotation", label: "PGP rotation" },
    { value: "wallet_activity", label: "Wallet activity" },
    { value: "infrastructure_change", label: "Infrastructure change" },
    { value: "alert", label: "Alert" },
  ];

export function TimelineExplorer({
  events,
  actorNames,
  investigationTitles,
}: {
  events: TimelineEvent[];
  actorNames: Record<string, string>;
  investigationTitles: Record<string, string>;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<"all" | TimelineEventType>("all");

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const time = Date.parse(event.timestamp);
      const afterFrom = from ? time >= Date.parse(`${from}T00:00:00.000Z`) : true;
      const beforeTo = to ? time <= Date.parse(`${to}T23:59:59.999Z`) : true;
      const matchesType = type === "all" || event.type === type;
      return afterFrom && beforeTo && matchesType;
    });
  }, [events, from, to, type]);

  return (
    <div>
      <PageHeader
        title="Investigation timeline"
        description="Chronological events from the synthetic corpus. Date filters operate in UTC."
      />
      <Card className="mb-6">
        <CardBody className="grid gap-4 md:grid-cols-3">
          <div>
            <FieldLabel htmlFor="tl-from">From date</FieldLabel>
            <TextInput id="tl-from" type="date" value={from} onChange={setFrom} />
          </div>
          <div>
            <FieldLabel htmlFor="tl-to">To date</FieldLabel>
            <TextInput id="tl-to" type="date" value={to} onChange={setTo} />
          </div>
          <div>
            <FieldLabel htmlFor="tl-type">Event type</FieldLabel>
            <SelectInput
              id="tl-type"
              value={type}
              onChange={(value) => setType(value as "all" | TimelineEventType)}
              options={EVENT_OPTIONS}
            />
          </div>
        </CardBody>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No events in this window"
          description="Widen the date range or clear the event-type filter."
        />
      ) : (
        <ol className="relative space-y-4 border-l border-slate-300 pl-6">
          {filtered.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[1.54rem] top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600 ring-2 ring-slate-200" />
              <Card>
                <CardBody>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs text-slate-500">
                        {formatDateTime(event.timestamp)}
                      </p>
                      <h2 className="mt-1 text-sm font-semibold text-slate-900">
                        {event.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">{event.detail}</p>
                    </div>
                    <ConfidenceBadge confidence={event.confidence} />
                  </div>
                  <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                    <div>
                      <dt className="inline">Type: </dt>
                      <dd className="inline capitalize font-medium text-slate-700">
                        {humanizeKey(event.type)}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline">Actor: </dt>
                      <dd className="inline">
                        {event.actorId ? (
                          <Link
                            href={`/actors/${event.actorId}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {actorNames[event.actorId] ?? event.actorId}
                          </Link>
                        ) : (
                          "Unassigned"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="inline">Case: </dt>
                      <dd className="inline font-medium text-slate-700">
                        {event.investigationId
                          ? (investigationTitles[event.investigationId] ??
                            event.investigationId)
                          : "Unassigned"}
                      </dd>
                    </div>
                  </dl>
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
