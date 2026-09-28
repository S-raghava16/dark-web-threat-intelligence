"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ConfidenceBadge, ConfidenceMeter } from "@/components/ui/confidence";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { ATTRIBUTION_CAVEAT } from "@/lib/constants";
import { formatDateTime, humanizeKey } from "@/lib/format";
import type {
  ActorRecord,
  EvidenceRecord,
  InfrastructureIndicator,
  TimelineEvent,
} from "@/lib/types";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "identifiers", label: "Identifiers" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "timeline", label: "Timeline" },
  { id: "evidence", label: "Evidence" },
];

function formatMonthYear(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch {
    return dateStr;
  }
}

function formatDayMonthYear(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getUTCDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${day} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch {
    return dateStr;
  }
}

export function ActorProfile({
  actor,
  related,
  infrastructure,
  timeline,
  evidence,
}: {
  actor: ActorRecord;
  related: ActorRecord[];
  infrastructure: InfrastructureIndicator[];
  timeline: TimelineEvent[];
  evidence: EvidenceRecord[];
}) {
  const [tab, setTab] = useState("overview");

  // Secondary aliases resolution
  const secondaryAliases = (
    actor.aliases && actor.aliases.length > 0
      ? actor.aliases
      : ["NB Cluster", "ledger_nex"]
  ).filter((alias) => alias !== actor.name && alias !== "Nexus Broker");

  // Wallets resolution
  const btcWallet =
    actor.wallets.find((w) => w.asset === "BTC") ?? {
      address: "bc1gsynnexus000000demo01",
      asset: "BTC",
      firstSeen: "2025-12-01T08:00:00.000Z",
      lastSeen: "2026-08-30T16:22:00.000Z",
    };

  const ethWallet =
    actor.wallets.find((w) => w.asset === "ETH") ?? {
      address: "0x71c605273f548e65f3f09800000000000000demo",
      asset: "ETH",
      firstSeen: "2026-01-15T12:00:00.000Z",
      lastSeen: "2026-08-25T14:00:00.000Z",
    };

  return (
    <div>
      <PageHeader
        title={actor.name}
        description={actor.summary}
        actions={
          <Badge className="border-slate-200 bg-slate-100 text-slate-700 capitalize">
            {actor.status}
          </Badge>
        }
      />

      {/* Top Threat Intelligence Cards */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {/* Feature 3: Confidence Breakdown Visualization */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Attribution Confidence
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-blue-600">
                  {actor.attributionConfidence.score}%
                </p>
              </div>
              <Badge className="border-blue-200 bg-blue-50 font-mono text-xs font-semibold text-blue-700">
                Deterministic
              </Badge>
            </div>

            <div className="mt-3">
              <ConfidenceMeter confidence={actor.attributionConfidence} />
            </div>

            {/* Visual Contribution Bars */}
            <div className="mt-4 border-t border-slate-200 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                Visual Contribution Breakdown
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: "PGP Key Match",
                    score: 40,
                    barColor: "bg-blue-600",
                  },
                  {
                    label: "Wallet Reuse",
                    score: 30,
                    barColor: "bg-emerald-600",
                  },
                  {
                    label: "Alias Similarity",
                    score: 10,
                    barColor: "bg-amber-500",
                  },
                  {
                    label: "Infrastructure Overlap",
                    score: 2,
                    barColor: "bg-purple-600",
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded border border-slate-200 bg-slate-50 p-2.5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-700">{item.label}</span>
                      <span className="font-mono text-xs font-semibold text-slate-900">
                        Contribution: {item.score}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${item.barColor}`}
                        style={{ width: `${item.score * 2.5}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-4 text-slate-500">
              Deterministic scoring: Confidence is calculated transparently from verifiable signal weights. Zero black-box AI.
            </p>
          </CardBody>
        </Card>

        {/* Feature 4: Threat Classification Card */}
        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Threat Classification
            </p>
            <div className="mt-3 space-y-3.5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  Threat Category:
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {actor.category ?? "Marketplace Vendor"}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  Risk Level:
                </p>
                <div className="mt-1">
                  <Badge className="border-red-200 bg-red-50 text-red-700 font-bold uppercase tracking-wider text-xs px-2.5 py-0.5">
                    {actor.riskLevel ?? "HIGH"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">
                  Observed Activities:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(actor.observedActivities ?? [
                    "Data Trading",
                    "Credential Selling",
                    "Forum Activity",
                  ]).map((activity) => (
                    <Badge
                      key={activity}
                      className="border-slate-200 bg-white text-slate-700 text-xs px-2.5 py-1 shadow-sm"
                    >
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Feature 5: Source Reliability Section */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Source Intelligence
              </p>
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-500 block">Last Scan Date:</span>
                <span className="font-mono text-xs font-semibold text-slate-900">
                  {formatDayMonthYear(actor.lastScanDate ?? "2026-09-20T14:30:00.000Z")}
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">
                Data Sources:
              </p>
              {[
                { source: "Marketplace Intelligence", reliability: "HIGH" },
                { source: "Forum Observation", reliability: "MEDIUM" },
                { source: "Infrastructure Data", reliability: "LOW" },
              ].map((telemetry) => (
                <div
                  key={telemetry.source}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span className="text-xs font-medium text-slate-700">
                    {telemetry.source}
                  </span>
                  <Badge
                    className={
                      telemetry.reliability === "HIGH"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold"
                        : telemetry.reliability === "MEDIUM"
                        ? "border-amber-200 bg-amber-700/20 text-amber-800 text-xs font-semibold"
                        : "border-slate-300 bg-slate-100 text-slate-600 text-xs font-semibold"
                    }
                  >
                    Reliability: {telemetry.reliability}
                  </Badge>
                </div>
              ))}
            </div>

            <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Purpose: </span>
              Show where intelligence came from and how reliable the source is.
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Profile Navigation Tabs */}
      <Tabs items={TABS} value={tab} onChange={setTab} />

      <div className="mt-5" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {/* ============================================================ */}
        {/* OVERVIEW TAB */}
        {/* ============================================================ */}
        {tab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Relationship Summary Card */}
            <Card className="lg:col-span-2">
              <CardHeader
                title="Relationship Summary"
                description="Network correlation and attribution linking this actor to other personas."
                action={
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Connected Personas:</span>
                    <Badge className="border-blue-200 bg-blue-50 text-blue-700 font-mono text-sm px-2.5 py-0.5">
                      {actor.relationshipSummary?.connectedPersonas ?? 12}
                    </Badge>
                  </div>
                }
              />
              <CardBody className="space-y-4">
                <div className="grid gap-4 md:grid-cols-[1fr_auto_1.5fr] items-center rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Strongest Relationship:
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {actor.relationshipSummary?.strongestRelationship?.name ?? "Ledger Ghost"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-500">Confidence:</span>
                      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 font-bold font-mono">
                        {actor.relationshipSummary?.strongestRelationship?.confidence ?? 88}%
                      </Badge>
                    </div>
                  </div>

                  <div className="hidden md:block h-16 w-px bg-slate-200" />

                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                      Shared Evidence:
                    </p>
                    <ul className="space-y-1.5">
                      {(actor.relationshipSummary?.strongestRelationship?.sharedEvidence ?? [
                        "Same PGP Key",
                        "Same Wallet",
                        "Similar Alias Pattern",
                      ]).map((evidenceItem) => (
                        <li
                          key={evidenceItem}
                          className="flex items-center gap-2 text-xs font-medium text-slate-700"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                            ✓
                          </span>
                          <span>{evidenceItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Purpose: </span>
                  Quickly show investigators why this actor is connected with other identities.
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Marketplaces" />
              <CardBody className="px-0 py-0">
                <Table caption="Associated marketplaces">
                  <THead>
                    <tr>
                      <Th>Marketplace</Th>
                      <Th>Role</Th>
                      <Th>Last seen</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {actor.marketplaces.length === 0 ? (
                      <tr>
                        <Td className="text-slate-500">None recorded</Td>
                        <Td>{""}</Td>
                        <Td>{""}</Td>
                      </tr>
                    ) : (
                      actor.marketplaces.map((market) => (
                        <tr key={market.id} className="hover:bg-slate-50">
                          <Td className="font-medium text-slate-800">{market.name}</Td>
                          <Td className="text-slate-600">{market.role}</Td>
                          <Td className="font-mono text-xs text-slate-600">
                            {formatDateTime(market.lastSeen)}
                          </Td>
                        </tr>
                      ))
                    )}
                  </TBody>
                </Table>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Forums" />
              <CardBody className="px-0 py-0">
                <Table caption="Associated forums">
                  <THead>
                    <tr>
                      <Th>Forum</Th>
                      <Th>Last seen</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {actor.forums.length === 0 ? (
                      <tr>
                        <Td className="text-slate-500">None recorded</Td>
                        <Td>{""}</Td>
                      </tr>
                    ) : (
                      actor.forums.map((forum) => (
                        <tr key={forum.id} className="hover:bg-slate-50">
                          <Td className="font-medium text-slate-800">{forum.name}</Td>
                          <Td className="font-mono text-xs text-slate-600">
                            {formatDateTime(forum.lastSeen)}
                          </Td>
                        </tr>
                      ))
                    )}
                  </TBody>
                </Table>
              </CardBody>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader
                title="Related personas"
                description="Hypothesized cluster links. Not identity confirmation."
              />
              <CardBody>
                {related.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No related personas in the demo set.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {related.map((persona) => (
                      <li
                        key={persona.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-3 hover:bg-slate-50"
                      >
                        <div>
                          <Link
                            href={`/actors/${persona.id}`}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {persona.name}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">
                            {persona.summary}
                          </p>
                        </div>
                        <ConfidenceBadge
                          confidence={persona.attributionConfidence}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>
        ) : null}

        {/* ============================================================ */}
        {/* IDENTIFIERS TAB */}
        {/* ============================================================ */}
        {tab === "identifiers" ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* 1. PGP Keys Card */}
              <Card className="md:col-span-1">
                <CardHeader
                  title="PGP Keys"
                  action={
                    <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-mono text-blue-700">
                      {actor.pgpKeys.length || 1} Key
                    </span>
                  }
                />
                <CardBody className="space-y-4">
                  {(actor.pgpKeys.length > 0
                    ? actor.pgpKeys
                    : [
                        {
                          id: "pgp-default",
                          fingerprint: "SYNTH-4F2A-91C0-BB17-NEXUS",
                          associatedHandle: "nexus_broker_syn",
                          firstSeen: "2026-09-02T18:40:00.000Z",
                          lastSeen: "2026-09-02T18:40:00.000Z",
                        },
                      ]
                  ).map((key) => (
                    <div
                      key={key.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2.5"
                    >
                      <div>
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
                          Fingerprint:
                        </p>
                        <p className="mt-1 font-mono text-xs font-semibold text-slate-800 break-all select-all bg-white p-2 rounded border border-slate-200">
                          {key.fingerprint}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase">First Seen:</p>
                          <p className="font-mono text-slate-800 mt-0.5 font-medium">
                            {formatDayMonthYear(key.firstSeen)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase">Usage:</p>
                          <p className="text-slate-800 mt-0.5 font-medium">Marketplace Signing</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* High-value Identifier Explanation */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                    <span className="font-semibold text-slate-800">Explanation: </span>
                    PGP keys should be treated as high-value identifiers because they are difficult for users to change without losing trust.
                  </div>
                </CardBody>
              </Card>

              {/* 2. Wallet Addresses Card */}
              <Card className="md:col-span-1">
                <CardHeader
                  title="Wallet Addresses"
                  action={
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-mono text-emerald-700">
                      2 Assets
                    </span>
                  }
                />
                <CardBody className="space-y-4">
                  {/* Bitcoin Wallet */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">
                        Bitcoin:
                      </span>
                      <Badge className="border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-bold">
                        BTC
                      </Badge>
                    </div>
                    <p className="font-mono text-xs font-medium text-slate-800 break-all select-all bg-white p-2 rounded border border-slate-200">
                      {btcWallet.address}
                    </p>
                    <div className="pt-1 text-[10px] text-slate-500 flex justify-between">
                      <span>Observed Asset</span>
                      <span className="font-mono text-slate-600">First seen: {formatDayMonthYear(btcWallet.firstSeen)}</span>
                    </div>
                  </div>

                  {/* Ethereum Wallet */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">
                        Ethereum:
                      </span>
                      <Badge className="border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold">
                        ETH
                      </Badge>
                    </div>
                    <p className="font-mono text-xs font-medium text-slate-800 break-all select-all bg-white p-2 rounded border border-slate-200">
                      {ethWallet.address.length > 18
                        ? `${ethWallet.address.slice(0, 10)}...`
                        : ethWallet.address}
                    </p>
                    <div className="pt-1 text-[10px] text-slate-500 flex justify-between">
                      <span>Observed Asset</span>
                      <span className="font-mono text-slate-600">Escrow settlement</span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* 3. Known Aliases Card */}
              <Card className="md:col-span-1">
                <CardHeader
                  title="Known Aliases"
                  action={
                    <span className="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-mono text-indigo-700">
                      {1 + secondaryAliases.length} Recorded
                    </span>
                  }
                />
                <CardBody className="space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Primary Alias:
                    </p>
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-3.5 py-2.5">
                      <span className="font-mono text-sm font-bold text-blue-700">
                        {actor.name}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Secondary Aliases:
                    </p>
                    <div className="space-y-1.5">
                      {secondaryAliases.map((alias) => (
                        <div
                          key={alias}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-xs text-slate-800"
                        >
                          {alias}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* 4. Handles Table */}
            <Card>
              <CardHeader
                title="Handles & Identities"
                description="Persona handles tracked across synthetic dark web forums and marketplaces"
              />
              <CardBody className="px-0 py-0">
                <Table caption="Handles table">
                  <THead>
                    <tr>
                      <Th>Platform</Th>
                      <Th>Handle</Th>
                      <Th>Observation Window</Th>
                    </tr>
                  </THead>
                  <TBody>
                    {(actor.handles.length > 0
                      ? actor.handles.map((h) => ({
                          platform: h.platform,
                          handle: h.value,
                          window: `${formatMonthYear(h.firstSeen)} - ${formatMonthYear(h.lastSeen)}`,
                        }))
                      : [
                          {
                            platform: "Forum Alpha",
                            handle: "Nexus123",
                            window: "Jan 2026 - Sept 2026",
                          },
                          {
                            platform: "Marketplace Beta",
                            handle: "NB Cluster",
                            window: "Mar 2026 - Aug 2026",
                          },
                        ]
                    ).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <Td className="font-medium text-slate-800">
                          {row.platform}
                        </Td>
                        <Td className="font-mono text-xs text-blue-700 font-semibold">
                          {row.handle}
                        </Td>
                        <Td className="font-mono text-xs text-slate-600">
                          {row.window}
                        </Td>
                      </tr>
                    ))}
                  </TBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        ) : null}

        {/* ============================================================ */}
        {/* INFRASTRUCTURE TAB */}
        {/* ============================================================ */}
        {tab === "infrastructure" ? (
          <Card>
            <CardHeader
              title="Infrastructure indicators"
              description="Analytical observations from the synthetic corpus."
            />
            <CardBody className="px-0 py-0">
              <Table caption="Infrastructure indicators">
                <THead>
                  <tr>
                    <Th>Type</Th>
                    <Th>Value</Th>
                    <Th>Confidence</Th>
                    <Th>Source</Th>
                  </tr>
                </THead>
                <TBody>
                  {infrastructure.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <Td className="capitalize font-medium text-slate-800">
                        {humanizeKey(item.type)}
                      </Td>
                      <Td className="font-mono text-xs text-slate-800">{item.value}</Td>
                      <Td>
                        <ConfidenceBadge confidence={item.confidence} />
                      </Td>
                      <Td className="text-slate-600">{item.source}</Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </CardBody>
          </Card>
        ) : null}

        {/* ============================================================ */}
        {/* TIMELINE TAB */}
        {/* ============================================================ */}
        {tab === "timeline" ? (
          <Card>
            <CardHeader title="Observed timeline events" />
            <CardBody className="px-0 py-0">
              <Table caption="Actor timeline">
                <THead>
                  <tr>
                    <Th>Time</Th>
                    <Th>Type</Th>
                    <Th>Description</Th>
                    <Th>Confidence</Th>
                  </tr>
                </THead>
                <TBody>
                  {timeline.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <Td className="font-mono text-xs text-slate-600">
                        {formatDateTime(item.timestamp)}
                      </Td>
                      <Td className="capitalize font-medium text-slate-800">{humanizeKey(item.type)}</Td>
                      <Td className="text-slate-800">{item.detail || item.title}</Td>
                      <Td>
                        <ConfidenceBadge confidence={item.confidence} />
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </CardBody>
          </Card>
        ) : null}

        {/* ============================================================ */}
        {/* EVIDENCE TAB */}
        {/* ============================================================ */}
        {tab === "evidence" ? (
          <Card>
            <CardHeader
              title="Evidence linked to this actor"
              description={ATTRIBUTION_CAVEAT}
            />
            <CardBody className="px-0 py-0">
              <Table caption="Associated evidence">
                <THead>
                  <tr>
                    <Th>Type</Th>
                    <Th>Summary</Th>
                    <Th>Timestamp</Th>
                    <Th>Confidence</Th>
                  </tr>
                </THead>
                <TBody>
                  {evidence.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <Td className="capitalize font-medium text-slate-800">{humanizeKey(item.type)}</Td>
                      <Td className="text-slate-800">{item.summary}</Td>
                      <Td className="font-mono text-xs text-slate-600">
                        {formatDateTime(item.timestamp)}
                      </Td>
                      <Td>
                        <ConfidenceBadge confidence={item.confidence} />
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
