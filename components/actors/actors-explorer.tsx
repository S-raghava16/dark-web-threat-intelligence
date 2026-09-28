"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/ui/confidence";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FieldLabel,
  SelectInput,
  TextInput,
} from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import type { ActorRecord, ConfidenceLevel } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "monitored", label: "Monitored" },
  { value: "dormant", label: "Dormant" },
];

const CONFIDENCE_OPTIONS = [
  { value: "all", label: "All confidence" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function ActorsExplorer({
  actors,
  relatedNames,
}: {
  actors: ActorRecord[];
  relatedNames: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [confidence, setConfidence] = useState("all");

  const filtered = useMemo(() => {
    return actors.filter((actor) => {
      const haystack = [
        actor.name,
        actor.id,
        ...actor.aliases,
        ...actor.handles.map((handle) => handle.value),
        ...actor.marketplaces.map((market) => market.name),
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesStatus = status === "all" || actor.status === status;
      const matchesConfidence =
        confidence === "all" ||
        actor.attributionConfidence.level === (confidence as ConfidenceLevel);
      return matchesQuery && matchesStatus && matchesConfidence;
    });
  }, [actors, query, status, confidence]);

  return (
    <div>
      <PageHeader
        title="Actor directory"
        description="Clustered personas from the synthetic corpus. Related personas are hypothesized links, not confirmed identity."
      />
      <Card className="mb-4">
        <CardBody className="grid gap-4 md:grid-cols-3">
          <div>
            <FieldLabel htmlFor="actor-search">Search</FieldLabel>
            <TextInput
              id="actor-search"
              type="search"
              value={query}
              onChange={setQuery}
              placeholder="Name, handle, marketplace"
            />
          </div>
          <div>
            <FieldLabel htmlFor="actor-status">Status</FieldLabel>
            <SelectInput
              id="actor-status"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
            />
          </div>
          <div>
            <FieldLabel htmlFor="actor-confidence">Confidence</FieldLabel>
            <SelectInput
              id="actor-confidence"
              value={confidence}
              onChange={setConfidence}
              options={CONFIDENCE_OPTIONS}
            />
          </div>
        </CardBody>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          title="No actors match the current filters"
          description="Adjust search or confidence filters. This directory is backed by local synthetic data."
        />
      ) : (
        <Card>
          <Table caption="Threat actor directory">
            <THead>
              <tr>
                <Th>Actor</Th>
                <Th>Confidence</Th>
                <Th>Last seen</Th>
                <Th>Marketplaces</Th>
                <Th>Related personas</Th>
              </tr>
            </THead>
            <TBody>
              {filtered.map((actor) => (
                <tr key={actor.id} className="hover:bg-slate-50">
                  <Td>
                    <Link
                      href={`/actors/${actor.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {actor.name}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{actor.id}</p>
                    <Badge className="mt-2 border-slate-200 bg-slate-100 text-slate-700 capitalize">
                      {actor.status}
                    </Badge>
                  </Td>
                  <Td>
                    <ConfidenceBadge confidence={actor.attributionConfidence} />
                  </Td>
                  <Td className="whitespace-nowrap font-mono text-xs text-slate-600">
                    {formatDateTime(actor.lastSeen)}
                  </Td>
                  <Td>
                    {actor.marketplaces.length > 0
                      ? actor.marketplaces.map((market) => market.name).join(", ")
                      : "—"}
                  </Td>
                  <Td>
                    {actor.relatedPersonaIds.length > 0
                      ? actor.relatedPersonaIds
                          .map((id) => relatedNames[id] ?? id)
                          .join(", ")
                      : "None recorded"}
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
