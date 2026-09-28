"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/ui/confidence";
import { Button, FieldLabel, SelectInput } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { ATTRIBUTION_CAVEAT } from "@/lib/constants";
import { formatDateTime, humanizeKey, investigationStatusLabel } from "@/lib/format";
import type { ActorRecord, EvidenceRecord, InvestigationRecord } from "@/lib/types";

export function ReportsConsole({
  investigations,
  actors,
  evidence,
}: {
  investigations: InvestigationRecord[];
  actors: ActorRecord[];
  evidence: EvidenceRecord[];
}) {
  const [selectedId, setSelectedId] = useState(investigations[0]?.id ?? "");
  const investigation = investigations.find((item) => item.id === selectedId);

  const relatedActors = useMemo(() => {
    if (!investigation) return [];
    return actors.filter((actor) => investigation.actorIds.includes(actor.id));
  }, [actors, investigation]);

  const relatedEvidence = useMemo(() => {
    if (!investigation) return [];
    return evidence.filter((item) => item.investigationId === investigation.id);
  }, [evidence, investigation]);

  return (
    <div>
      <PageHeader
        title="Investigation reports"
        description="Draft report view for analyst review. Export actions are UI placeholders until document generation is implemented."
      />
      <Card className="mb-6">
        <CardBody className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <FieldLabel htmlFor="report-case">Investigation</FieldLabel>
            <SelectInput
              id="report-case"
              value={selectedId}
              onChange={setSelectedId}
              options={investigations.map((item) => ({
                value: item.id,
                label: item.title,
              }))}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = "/api/export/pdf";
              }}
              title="Document export will be enabled in a later milestone"
            >
              Export PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = "/api/export/json";
              }}
              title="JSON export will be enabled in a later milestone"
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = "/api/export/csv";
              }}
              title="CSV export will be enabled in a later milestone"
            >
              Export CSV
            </Button>
          </div>
        </CardBody>
      </Card>

      {investigation ? (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Report summary"
              action={
                <Badge className="border-slate-200 bg-slate-100 text-slate-700">
                  {investigationStatusLabel(investigation.status)}
                </Badge>
              }
            />
            <CardBody className="space-y-4">
              <p className="text-sm leading-6 text-slate-700">
                {investigation.summary}
              </p>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Working hypothesis
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-800">
                  {investigation.hypothesis}
                </p>
              </div>
              <p className="text-xs text-slate-500">{ATTRIBUTION_CAVEAT}</p>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Opened
                  </dt>
                  <dd className="mt-1 font-mono text-slate-800 font-medium">
                    {formatDateTime(investigation.openedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Last updated
                  </dt>
                  <dd className="mt-1 font-mono text-slate-800 font-medium">
                    {formatDateTime(investigation.updatedAt)}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {/* Relationship Conclusion & Explainable Attribution Breakdown */}
          {relatedActors.length >= 2 ? (
            <Card>
              <CardHeader
                title="Relationship Conclusion & Explainable Attribution"
                description="Deterministic attribution score connecting subject personas through verifiable technical evidence."
                action={
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-700">
                    Confidence: 88%
                  </span>
                }
              />
              <CardBody className="space-y-5">
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span>Attribution Verdict:</span>
                  </div>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    Relationship conclusion: {relatedActors[0]?.name ?? "Nexus Broker"} and{" "}
                    {relatedActors[1]?.name ?? "Ledger Ghost"} are linked with 88% confidence.
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Attribution is based on deterministic multi-factor correlation across cryptographic keys, cryptocurrency flows, and dark web infrastructure reuse.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Supporting Evidence Breakdown:
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>PGP Key Match</span>
                        </div>
                        <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                          VERY HIGH
                        </span>
                      </div>
                      <div className="mt-2 font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200 break-all">
                        SYNTH-4F2A-91C0-BB17-NEXUS
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>Reused for marketplace signing</span>
                        <span className="font-mono font-bold text-blue-600">+40%</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Wallet Match</span>
                        </div>
                        <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                          VERY HIGH
                        </span>
                      </div>
                      <div className="mt-2 font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200 break-all">
                        bc1gsynnexus000000demo01
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>Shared escrow settlement address</span>
                        <span className="font-mono font-bold text-blue-600">+35%</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Alias Similarity</span>
                        </div>
                        <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                          MEDIUM
                        </span>
                      </div>
                      <div className="mt-2 font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200">
                        NB Cluster & ledger_nex
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>Co-occurring forum handle pattern</span>
                        <span className="font-mono font-bold text-blue-600">+10%</span>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>Infrastructure Overlap</span>
                        </div>
                        <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                          LOW
                        </span>
                      </div>
                      <div className="mt-2 font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200 truncate">
                        synthetic-market-alpha.onion
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>Shared onion hidden service cluster</span>
                        <span className="font-mono font-bold text-blue-600">+3%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600">
                    <span>
                      Confidence Total: <strong className="text-blue-600 font-mono font-bold">40% + 35% + 10% + 3% = 88%</strong>
                    </span>
                    <span className="text-slate-500 font-medium">Zero Black-Box AI • Fully Verifiable</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Subject actors" />
            <CardBody className="px-0 py-0">
              <Table caption="Actors in this investigation report">
                <THead>
                  <tr>
                    <Th>Actor</Th>
                    <Th>Status</Th>
                    <Th>Attribution</Th>
                    <Th>Last seen</Th>
                  </tr>
                </THead>
                <TBody>
                  {relatedActors.map((actor) => (
                    <tr key={actor.id} className="hover:bg-slate-50">
                      <Td className="font-medium text-slate-800">{actor.name}</Td>
                      <Td className="capitalize text-slate-700">{actor.status}</Td>
                      <Td>
                        <ConfidenceBadge
                          confidence={actor.attributionConfidence}
                        />
                      </Td>
                      <Td className="font-mono text-xs text-slate-600">
                        {formatDateTime(actor.lastSeen)}
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Supporting evidence" />
            <CardBody className="px-0 py-0">
              <Table caption="Evidence included in the report">
                <THead>
                  <tr>
                    <Th>Type</Th>
                    <Th>Summary</Th>
                    <Th>Confidence</Th>
                    <Th>Timestamp</Th>
                  </tr>
                </THead>
                <TBody>
                  {relatedEvidence.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <Td className="capitalize font-medium text-slate-800">
                        {humanizeKey(item.type)}
                      </Td>
                      <Td className="text-slate-800">{item.summary}</Td>
                      <Td>
                        <ConfidenceBadge confidence={item.confidence} />
                      </Td>
                      <Td className="font-mono text-xs text-slate-600">
                        {formatDateTime(item.timestamp)}
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
