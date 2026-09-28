"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/ui/confidence";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Button,
  FieldLabel,
  SelectInput,
  TextInput,
} from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { formatDateTime, humanizeKey } from "@/lib/format";
import type { InfrastructureIndicator, InfrastructureType } from "@/lib/types";

const TYPE_OPTIONS: Array<{ value: "all" | InfrastructureType; label: string }> =
  [
    { value: "all", label: "All types" },
    { value: "onion_service", label: "Onion service" },
    { value: "domain", label: "Domain" },
    { value: "wallet", label: "Wallet" },
    { value: "pgp_key", label: "PGP key" },
    { value: "hosting_cluster", label: "Hosting cluster" },
  ];

interface InfrastructureExplorerProps {
  indicators: InfrastructureIndicator[];
  actorNames: Record<string, string>;
  actorOptions?: Array<{ id: string; name: string }>;
}

export function InfrastructureExplorer({
  indicators,
  actorNames,
  actorOptions = [],
}: InfrastructureExplorerProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | InfrastructureType>("all");

  // Selected indicator for Details Modal/Drawer
  const [selectedIndicator, setSelectedIndicator] =
    useState<InfrastructureIndicator | null>(null);

  // Overlap Analysis State
  const defaultActorA =
    actorOptions.find((a) => a.id === "syn-nexus-broker")?.id ??
    actorOptions[0]?.id ??
    "";
  const defaultActorB =
    actorOptions.find((a) => a.id === "syn-ledger-ghost")?.id ??
    actorOptions[1]?.id ??
    "";

  const [actorA, setActorA] = useState<string>(defaultActorA);
  const [actorB, setActorB] = useState<string>(defaultActorB);
  const [analyzedOverlap, setAnalyzedOverlap] = useState<{
    actorAId: string;
    actorBId: string;
    matches: Array<{
      id: string;
      label: string;
      value: string;
      confidenceImpact: number;
      evidenceStrength: string;
      indicatorType: string;
    }>;
    correlationScore: number;
    explanation: string;
  } | null>(null);

  const actorSelectOptions = useMemo(() => {
    return actorOptions.map((actor) => ({
      value: actor.id,
      label: actor.name,
    }));
  }, [actorOptions]);

  const handleRunOverlapAnalysis = () => {
    if (!actorA || !actorB) return;

    // Find all indicators linked to BOTH Actor A and Actor B
    const matched = indicators.filter((item) => {
      const hasA = item.associatedActorIds.includes(actorA);
      const hasB = item.associatedActorIds.includes(actorB);
      return hasA && hasB;
    });

    const matches = matched.map((item) => {
      let label = `${humanizeKey(item.type)} Overlap`;
      let impact = item.contributionWeight ?? 20;

      if (item.type === "wallet") {
        label = "Wallet Reuse";
        impact = item.contributionWeight ?? 30;
      } else if (item.type === "onion_service") {
        label = "Onion Service Overlap";
        impact = item.contributionWeight ?? 20;
      } else if (item.type === "domain") {
        label = "Domain Linkage";
        impact = item.contributionWeight ?? 10;
      }

      return {
        id: item.id,
        label,
        value: item.value,
        confidenceImpact: impact,
        evidenceStrength: item.reliability ?? "HIGH",
        indicatorType: item.type,
      };
    });

    const score = Math.min(
      100,
      matches.reduce((sum, m) => sum + m.confidenceImpact, 0),
    );

    const explanation =
      matches.length > 0
        ? "These actors share operational infrastructure including cryptocurrency wallets and hosting services, indicating strong technical coordination or single-operator infrastructure."
        : "No shared infrastructure indicators observed between the selected actors in the current intelligence corpus.";

    setAnalyzedOverlap({
      actorAId: actorA,
      actorBId: actorB,
      matches,
      correlationScore: score,
      explanation,
    });
  };

  const filtered = useMemo(() => {
    return indicators.filter((item) => {
      const matchesType = type === "all" || item.type === type;
      const haystack = `${item.value} ${item.source}`.toLowerCase();
      return matchesType && haystack.includes(query.trim().toLowerCase());
    });
  }, [indicators, query, type]);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Infrastructure indicators"
          description="Observed indicators from the synthetic corpus. Values are placeholders and must be treated as analytical observations, not confirmed operator identity."
        />

        {/* Feature 4: View Infrastructure Graph Button */}
        <div className="shrink-0">
          <Link href="/graph?mode=infrastructure">
            <Button
              variant="secondary"
              className="flex items-center gap-2 border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>View Infrastructure Graph</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature 3: Infrastructure Explanation Card */}
      <Card className="border-blue-200 bg-blue-50/40">
        <CardBody className="p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <div className="rounded-lg border border-blue-200 bg-blue-100 p-2.5 text-blue-700">
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
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">
                Infrastructure Attribution Engine
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                This module correlates hosting clusters, shared wallets, PGP key
                usage, and Tor hidden service metadata across synthetic dark web
                actors to identify infrastructure reuse and operator overlap.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Feature 1: Infrastructure Overlap Analysis Panel */}
      <Card>
        <CardHeader
          title="Analyze Infrastructure Overlap"
          description="Select two threat actors to evaluate shared hosting clusters, cryptocurrency wallets, and mirror services."
        />
        <CardBody className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 md:items-end">
            <div>
              <FieldLabel htmlFor="actor-a-select">Actor A</FieldLabel>
              <SelectInput
                id="actor-a-select"
                value={actorA}
                onChange={setActorA}
                options={actorSelectOptions}
              />
            </div>

            <div>
              <FieldLabel htmlFor="actor-b-select">Actor B</FieldLabel>
              <SelectInput
                id="actor-b-select"
                value={actorB}
                onChange={setActorB}
                options={actorSelectOptions}
              />
            </div>

            <div>
              <Button
                type="button"
                onClick={handleRunOverlapAnalysis}
                className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Analyze Infrastructure Overlap
              </Button>
            </div>
          </div>

          {/* Overlap Result Display */}
          {analyzedOverlap ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="border-b border-slate-200 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-900">
                    Infrastructure Overlap Analysis:
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">
                      Correlation Score:
                    </span>
                    <span className="font-mono text-base font-bold text-blue-600">
                      {analyzedOverlap.correlationScore}% Confidence Link
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span>Actor A:</span>
                  <Link
                    href={`/actors/${analyzedOverlap.actorAId}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {actorNames[analyzedOverlap.actorAId] ?? analyzedOverlap.actorAId}
                  </Link>
                  <span className="text-slate-400">vs</span>
                  <span>Actor B:</span>
                  <Link
                    href={`/actors/${analyzedOverlap.actorBId}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {actorNames[analyzedOverlap.actorBId] ?? analyzedOverlap.actorBId}
                  </Link>
                </div>
              </div>

              {/* Matched Infrastructure List */}
              <div className="mt-5 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Matched Infrastructure:
                </h4>

                {analyzedOverlap.matches.length > 0 ? (
                  <div className="space-y-3">
                    {analyzedOverlap.matches.map((item, idx) => {
                      const relColor =
                        item.evidenceStrength.toUpperCase() === "HIGH" ||
                        item.evidenceStrength.toUpperCase() === "VERY_HIGH"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : item.evidenceStrength.toUpperCase() === "MEDIUM"
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-slate-200 bg-slate-100 text-slate-700";

                      return (
                        <div
                          key={item.id}
                          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="font-semibold text-slate-800">
                              {idx + 1}. {item.label}
                            </div>
                            <span
                              className={`rounded border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${relColor}`}
                            >
                              Evidence Strength: {item.evidenceStrength}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-baseline gap-2">
                            <span className="text-xs text-slate-500">Indicator:</span>
                            <span className="font-mono text-xs font-medium text-slate-800 break-all bg-slate-50 px-2 py-1 rounded border border-slate-200">
                              {item.value}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <span>Confidence Impact:</span>
                            <span className="font-mono font-bold text-blue-600">
                              +{item.confidenceImpact}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No matching infrastructure indicators found between these two actors.
                  </p>
                )}

                {/* Score Progress Bar */}
                <div className="mt-4 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                    <span className="font-semibold text-slate-800">
                      Infrastructure Correlation Score:
                    </span>
                    <span className="font-mono font-bold text-blue-600">
                      {analyzedOverlap.correlationScore}% Confidence Link
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${Math.min(100, Math.max(0, analyzedOverlap.correlationScore))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Analytical Explanation */}
                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3.5 text-xs text-slate-600 shadow-sm">
                  <span className="font-semibold text-slate-800">Explanation: </span>
                  {analyzedOverlap.explanation}
                </div>
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>

      {/* Search & Filter Card */}
      <Card>
        <CardBody className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="infra-search">Search</FieldLabel>
            <TextInput
              id="infra-search"
              type="search"
              value={query}
              onChange={setQuery}
              placeholder="Value or source"
            />
          </div>
          <div>
            <FieldLabel htmlFor="infra-type">Indicator type</FieldLabel>
            <SelectInput
              id="infra-type"
              value={type}
              onChange={(value) => setType(value as "all" | InfrastructureType)}
              options={TYPE_OPTIONS}
            />
          </div>
        </CardBody>
      </Card>

      {/* Infrastructure Indicators Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No indicators match"
          description="Clear filters to see the full synthetic infrastructure table."
        />
      ) : (
        <Card>
          <Table caption="Infrastructure indicator table (Click any row for technical dossier)">
            <THead>
              <tr>
                <Th>Type</Th>
                <Th>Value</Th>
                <Th>First seen</Th>
                <Th>Last seen</Th>
                <Th>Confidence</Th>
                <Th>Source</Th>
                <Th>Actors</Th>
              </tr>
            </THead>
            <TBody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedIndicator(item)}
                  className="cursor-pointer transition-colors hover:bg-slate-50"
                  title="Click to view full indicator dossier"
                >
                  <Td className="capitalize font-medium text-slate-800">{humanizeKey(item.type)}</Td>
                  <Td className="font-mono text-xs font-semibold text-blue-700">{item.value}</Td>
                  <Td className="whitespace-nowrap font-mono text-xs text-slate-600">
                    {formatDateTime(item.firstSeen)}
                  </Td>
                  <Td className="whitespace-nowrap font-mono text-xs text-slate-600">
                    {formatDateTime(item.lastSeen)}
                  </Td>
                  <Td>
                    <ConfidenceBadge confidence={item.confidence} />
                  </Td>
                  <Td className="text-slate-600">{item.source}</Td>
                  <Td>
                    <div
                      className="flex flex-wrap gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.associatedActorIds.map((id) => (
                        <Link
                          key={id}
                          href={`/actors/${id}`}
                          className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-blue-600 hover:border-blue-300 hover:underline"
                        >
                          {actorNames[id] ?? id}
                        </Link>
                      ))}
                    </div>
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        </Card>
      )}

      {/* Feature 2: Indicator Details Modal / Drawer */}
      {selectedIndicator ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl text-slate-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold capitalize text-blue-700">
                  {humanizeKey(selectedIndicator.type)}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Indicator Technical Dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIndicator(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <FieldLabel htmlFor="modal-indicator-val">Indicator Value</FieldLabel>
                <div id="modal-indicator-val" className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm font-semibold text-slate-900 break-all select-all">
                  {selectedIndicator.value}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Reliability
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {selectedIndicator.reliability ?? "HIGH"}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Score Contribution Weight
                  </div>
                  <div className="mt-1 font-mono font-bold text-blue-600">
                    +{selectedIndicator.contributionWeight ?? 25}%
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Used For
                  </div>
                  <div className="mt-1 text-sm text-slate-800">
                    {selectedIndicator.usedFor ?? "Identity correlation"}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Source
                  </div>
                  <div className="mt-1 text-sm text-slate-800">
                    {selectedIndicator.source}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    First Seen
                  </div>
                  <div className="mt-1 font-mono text-xs text-slate-600">
                    {formatDateTime(selectedIndicator.firstSeen)}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Last Seen
                  </div>
                  <div className="mt-1 font-mono text-xs text-slate-600">
                    {formatDateTime(selectedIndicator.lastSeen)}
                  </div>
                </div>
              </div>

              {selectedIndicator.serverTechnology ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Server Technology
                  </div>
                  <div className="mt-1 font-mono text-xs text-slate-800">
                    {selectedIndicator.serverTechnology}
                  </div>
                </div>
              ) : null}

              {selectedIndicator.certificateFingerprint ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Certificate Fingerprint
                  </div>
                  <div className="mt-1 font-mono text-xs text-slate-800 break-all">
                    {selectedIndicator.certificateFingerprint}
                  </div>
                </div>
              ) : null}

              {selectedIndicator.hostingPattern ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                    Hosting Pattern
                  </div>
                  <div className="mt-1 text-xs text-slate-800">
                    {selectedIndicator.hostingPattern}
                  </div>
                </div>
              ) : null}

              {/* Associated Actors */}
              <div>
                <FieldLabel htmlFor="modal-associated-actors">Associated Personas</FieldLabel>
                <div id="modal-associated-actors" className="flex flex-wrap gap-2 mt-1">
                  {selectedIndicator.associatedActorIds.map((actorId) => (
                    <Link
                      key={actorId}
                      href={`/actors/${actorId}`}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 hover:border-blue-400 hover:underline shadow-sm"
                    >
                      {actorNames[actorId] ?? actorId}
                    </Link>
                  ))}
                </div>
              </div>

              {selectedIndicator.note ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Note: </span>
                  {selectedIndicator.note}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
              <Button
                variant="secondary"
                onClick={() => setSelectedIndicator(null)}
              >
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
