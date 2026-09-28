"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { InvestigationGraph } from "@/components/investigation/investigation-graph";
import { Card, CardBody } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/ui/confidence";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Button,
  FieldLabel,
  SelectInput,
  TextInput,
} from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TBody,
  Td,
  Th,
  THead,
} from "@/components/ui/table";
import { humanizeKey } from "@/lib/format";
import type { IndicatorType } from "@/lib/types";

const TYPE_OPTIONS: Array<{
  value: "all" | IndicatorType;
  label: string;
}> = [
  { value: "all", label: "All indicator types" },
  { value: "actor", label: "Actor" },
  { value: "handle", label: "Handle" },
  { value: "pgp_key", label: "PGP key" },
  { value: "wallet", label: "Wallet" },
  { value: "onion_service", label: "Onion service" },
  { value: "domain", label: "Domain" },
];

type Actor = {
  id: string;
  name: string;
  status: string;
  attributionConfidence: number;
};

type InvestigationResponse = {
  query: string;

  matchedActors: Actor[];

  matchedIndicators: {
    actors: Actor[];

    aliases: Array<{
      id: string;
      value: string;
      actorId: string;
    }>;

    handles: Array<{
      id: string;
      value: string;
      platform: string;
      actorId: string;
    }>;

    pgpKeys: Array<{
      id: string;
      fingerprint: string;
      associatedHandle: string;
      actorId: string;
    }>;

    wallets: Array<{
      id: string;
      address: string;
      asset: string;
    }>;

    infrastructure: Array<{
      id: string;
      type: string;
      value: string;
      confidence: number;
    }>;

    marketplaces: Array<{
      id: string;
      name: string;
    }>;

    forums: Array<{
      id: string;
      name: string;
    }>;
  };

  investigation: {
    wallets: Array<{
      actorId: string;
      walletId: string;
      actor: Actor;
      wallet: {
        id: string;
        address: string;
        asset: string;
      };
    }>;

    pgpKeys: Array<{
      id: string;
      fingerprint: string;
      associatedHandle: string;
      actorId: string;
    }>;

    infrastructure: Array<{
      actorId: string;
      infrastructureId: string;
      actor: Actor;
      infrastructure: {
        id: string;
        type: string;
        value: string;
        confidence: number;
      };
    }>;

    relationships: Array<{
      id: string;
      fromActorId: string;
      toActorId: string;
      type: string;
      confidence: number;
      hypothesis: string | null;
      provenance: string;
      fromActor: Actor;
      toActor: Actor;
      evidenceContributions?: Array<{
        id: string;
        evidenceType: string;
        description: string;
        scoreContribution: number;
        reliability: string;
        matchedValue?: string | null;
      }>;
    }>;

    relatedPersonas: Array<{
      id: string;
      actorId: string;
      confidence: number;
      hypothesis: string | null;
      actor: Actor;
    }>;
  };
};

type SearchResult = {
  id: string;
  type: string;
  value: string;
  actorId: string | null;
  confidence: number;
  context: string;
};

function confidenceAssessment(score: number) {
  return {
    score,
    level:
      score >= 75
        ? ("high" as const)
        : score >= 50
          ? ("medium" as const)
          : ("low" as const),
  };
}

function buildResults(
  data: InvestigationResponse,
): SearchResult[] {
  const results: SearchResult[] = [];

  for (const actor of data.matchedIndicators.actors) {
    results.push({
      id: `actor-${actor.id}`,
      type: "actor",
      value: actor.name,
      actorId: actor.id,
      confidence: actor.attributionConfidence,
      context: `Actor status: ${actor.status}`,
    });
  }

  for (const alias of data.matchedIndicators.aliases) {
    results.push({
      id: `alias-${alias.id}`,
      type: "alias",
      value: alias.value,
      actorId: alias.actorId,
      confidence: 100,
      context: "Matched actor alias",
    });
  }

  for (const handle of data.matchedIndicators.handles) {
    results.push({
      id: `handle-${handle.id}`,
      type: "handle",
      value: handle.value,
      actorId: handle.actorId,
      confidence: 100,
      context: `Observed on ${handle.platform}`,
    });
  }

  for (const key of data.matchedIndicators.pgpKeys) {
    results.push({
      id: `pgp-${key.id}`,
      type: "pgp_key",
      value: key.fingerprint,
      actorId: key.actorId,
      confidence: 100,
      context: `Associated handle: ${key.associatedHandle}`,
    });
  }

  for (const wallet of data.matchedIndicators.wallets) {
    results.push({
      id: `wallet-${wallet.id}`,
      type: "wallet",
      value: wallet.address,
      actorId: null,
      confidence: 100,
      context: `Asset: ${wallet.asset}`,
    });
  }

  for (const indicator of data.matchedIndicators.infrastructure) {
    results.push({
      id: `infra-${indicator.id}`,
      type: indicator.type,
      value: indicator.value,
      actorId: null,
      confidence: indicator.confidence,
      context: "Matched infrastructure indicator",
    });
  }

  for (const marketplace of data.matchedIndicators.marketplaces) {
    results.push({
      id: `marketplace-${marketplace.id}`,
      type: "marketplace",
      value: marketplace.name,
      actorId: null,
      confidence: 100,
      context: "Matched marketplace",
    });
  }

  for (const forum of data.matchedIndicators.forums) {
    results.push({
      id: `forum-${forum.id}`,
      type: "forum",
      value: forum.name,
      actorId: null,
      confidence: 100,
      context: "Matched forum",
    });
  }

  return results;
}

export function InvestigationSearch({
  initialQuery,
  actorNames,
}: {
  initialQuery: string;
  actorNames: Record<string, string>;
}) {
  const [query, setQuery] = useState(initialQuery);

  const [type, setType] =
    useState<"all" | IndicatorType>("all");

  const [submitted, setSubmitted] = useState("");

  const [results, setResults] = useState<SearchResult[]>([]);

  const [data, setData] =
    useState<InvestigationResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const runInvestigation = async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSubmitted("");
      setResults([]);
      setData(null);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setSubmitted(trimmedQuery);

    try {
      const response = await fetch(
        "/api/investigation/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: trimmedQuery,
          }),
        },
      );

      const responseData =
        (await response.json()) as InvestigationResponse & {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          responseData.error ??
            "Investigation search failed.",
        );
      }

      setData(responseData);
      setResults(buildResults(responseData));
    } catch (searchError) {
      console.error(searchError);

      setData(null);
      setResults([]);

      setError(
        searchError instanceof Error
          ? searchError.message
          : "Investigation search failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery.trim()) {
      void runInvestigation();
    }

    // Initial URL query only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredResults =
    type === "all"
      ? results
      : results.filter(
          (result) => result.type === type,
        );

  const discoveredActors = data?.matchedActors ?? [];

  const relationships =
    data?.investigation.relationships ?? [];

  /*
   * Transform API relationship records into the smaller
   * structure required by the InvestigationGraph component.
   */
  const graphRelationships =
    relationships.map((relationship) => ({
      id: relationship.id,
      fromActorId: relationship.fromActorId,
      toActorId: relationship.toActorId,
      fromActorName: relationship.fromActor.name,
      toActorName: relationship.toActor.name,
      type: relationship.type,
      confidence: relationship.confidence,
      hypothesis: relationship.hypothesis,
    }));

  const wallets =
    data?.investigation.wallets ?? [];

  const infrastructure =
    data?.investigation.infrastructure ?? [];

  const relatedPersonas =
    data?.investigation.relatedPersonas ?? [];

  return (
    <div>
      <PageHeader
        title="Investigation search"
        description="Pivot across the synthetic intelligence corpus using actors, handles, PGP fingerprints, wallets, infrastructure, marketplaces, and forums. No live collection is performed."
      />

      <Card className="mb-6">
        <CardBody>
          <form
            className="grid gap-4 md:grid-cols-[1fr_16rem_auto] md:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              void runInvestigation();
            }}
          >
            <div>
              <FieldLabel htmlFor="inv-query">
                Indicator
              </FieldLabel>

              <TextInput
                id="inv-query"
                type="search"
                value={query}
                onChange={setQuery}
                placeholder="Example: nexus_broker_syn or SYNTH-4F2A"
              />
            </div>

            <div>
              <FieldLabel htmlFor="inv-type">
                Type
              </FieldLabel>

              <SelectInput
                id="inv-type"
                value={type}
                onChange={(value) =>
                  setType(
                    value as "all" | IndicatorType,
                  )
                }
                options={TYPE_OPTIONS}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Investigating..."
                : "Investigate"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {error ? (
        <Card className="mb-6">
          <CardBody>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-medium text-red-700">
                Investigation failed
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {!submitted ? (
        <EmptyState
          title="Enter an indicator to begin"
          description="Search the synthetic intelligence corpus using a handle, alias, wallet, PGP fingerprint, infrastructure indicator, actor name, marketplace, or forum."
        />
      ) : loading ? (
        <EmptyState
          title="Investigating..."
          description={`Searching the intelligence corpus for "${submitted}".`}
        />
      ) : !data || filteredResults.length === 0 ? (
        <EmptyState
          title="No matching intelligence found"
          description={`The database does not contain a matching indicator for "${submitted}".`}
        />
      ) : (
        <>
          {/* Investigation summary */}

          <Card className="mb-6">
            <CardBody>
              <div className="grid gap-6 md:grid-cols-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Query
                  </p>

                  <p className="mt-1 truncate font-mono text-sm font-semibold text-blue-700">
                    {submitted}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Actors
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {discoveredActors.length}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Relationships
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {relationships.length}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Correlation indicators
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {wallets.length +
                      infrastructure.length +
                      relatedPersonas.length}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Discovered actors */}

          {discoveredActors.length > 0 ? (
            <Card className="mb-6">
              <Table caption="Discovered threat actors">
                <THead>
                  <tr>
                    <Th>Actor</Th>
                    <Th>Status</Th>
                    <Th>Confidence</Th>
                    <Th>Action</Th>
                  </tr>
                </THead>

                <TBody>
                  {discoveredActors.map((actor) => (
                    <tr
                      key={actor.id}
                      className="hover:bg-slate-50"
                    >
                      <Td>
                        <Link
                          href={`/actors/${actor.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {actorNames[actor.id] ??
                            actor.name}
                        </Link>
                      </Td>

                      <Td className="capitalize text-slate-700">
                        {actor.status}
                      </Td>

                      <Td>
                        <ConfidenceBadge
                          confidence={confidenceAssessment(
                            actor.attributionConfidence,
                          )}
                        />
                      </Td>

                      <Td>
                        <Link
                          href={`/actors/${actor.id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          View actor →
                        </Link>
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </Card>
          ) : null}

          {/* Investigation relationship graph */}

          {graphRelationships.length > 0 ? (
            <InvestigationGraph
              relationships={graphRelationships}
              focalActorId={
                discoveredActors.length > 0
                  ? discoveredActors[0].id
                  : null
              }
            />
          ) : null}

          {/* Relationship Analysis & Explainable Attribution */}

          {relationships.length > 0 ? (
            <Card className="mb-6">
              <CardBody>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Relationship Analysis & Explainable Attribution
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Transparent attribution scoring connecting discovered personas through observable technical evidence.
                    </p>
                  </div>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-700">
                    Deterministic Scoring • No Black-Box AI
                  </span>
                </div>

                <div className="space-y-6">
                  {relationships.map((relationship) => (
                    <div
                      key={relationship.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                    >
                      {/* Header: Actor A ↔ Actor B + Score */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`/actors/${relationship.fromActorId}`}
                            className="text-base font-semibold text-blue-600 hover:underline"
                          >
                            {relationship.fromActor.name}
                          </Link>
                          <span className="text-lg font-bold text-slate-400">↔</span>
                          <Link
                            href={`/actors/${relationship.toActorId}`}
                            className="text-base font-semibold text-blue-600 hover:underline"
                          >
                            {relationship.toActor.name}
                          </Link>
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs uppercase tracking-wide text-slate-700 font-medium">
                            {humanizeKey(relationship.type)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">Confidence Score:</span>
                          <span className="font-mono text-xl font-bold text-blue-600">
                            {relationship.confidence}%
                          </span>
                          <ConfidenceBadge
                            confidence={confidenceAssessment(relationship.confidence)}
                          />
                        </div>
                      </div>

                      {/* Confidence Progress Bar */}
                      <div className="mt-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${Math.min(100, Math.max(0, relationship.confidence))}%` }}
                          />
                        </div>
                      </div>

                      {/* Evidence Supporting Link Breakdown */}
                      {relationship.evidenceContributions && relationship.evidenceContributions.length > 0 ? (
                        <div className="mt-5 space-y-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Evidence Supporting Link:
                          </h4>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {relationship.evidenceContributions.map((contrib) => {
                              const relColor =
                                contrib.reliability === "VERY_HIGH" || contrib.reliability === "High"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : contrib.reliability === "HIGH"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : contrib.reliability === "MEDIUM" || contrib.reliability === "Medium"
                                  ? "border-amber-200 bg-amber-50 text-amber-800"
                                  : "border-slate-200 bg-slate-100 text-slate-700";

                              const label =
                                contrib.evidenceType === "PGP_KEY_MATCH"
                                  ? "PGP Key Match"
                                  : contrib.evidenceType === "WALLET_MATCH"
                                  ? "Wallet Match"
                                  : contrib.evidenceType === "ALIAS_SIMILARITY"
                                  ? "Alias Similarity"
                                  : contrib.evidenceType === "INFRASTRUCTURE_OVERLAP"
                                  ? "Infrastructure Overlap"
                                  : humanizeKey(contrib.evidenceType);

                              return (
                                <div
                                  key={contrib.id}
                                  className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                      <span className="text-emerald-600 font-bold">✓</span>
                                      <span>{label}</span>
                                    </div>
                                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${relColor}`}>
                                      {contrib.reliability.replace("_", " ")}
                                    </span>
                                  </div>

                                  {contrib.matchedValue ? (
                                    <div className="mt-2 font-mono text-xs text-slate-800 break-all bg-slate-50 rounded px-2 py-1 border border-slate-200">
                                      {contrib.matchedValue}
                                    </div>
                                  ) : null}

                                  <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="text-slate-500">{contrib.description}</span>
                                    <span className="font-mono font-semibold text-blue-600 shrink-0 ml-2">
                                      +{contrib.scoreContribution}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 shadow-sm">
                            <div>
                              <span className="font-semibold text-slate-800">Final Confidence: </span>
                              <span className="font-mono text-sm font-bold text-blue-600">{relationship.confidence}%</span>
                              <span className="ml-2 text-slate-500">
                                (Computed via multi-factor attribution weight matrix)
                              </span>
                            </div>
                            <span className="text-slate-500">Provenance: {relationship.provenance}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3">
                          {relationship.hypothesis ? (
                            <p className="text-sm text-slate-600">{relationship.hypothesis}</p>
                          ) : null}
                          <p className="mt-2 text-xs text-slate-500">
                            Provenance: {relationship.provenance}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ) : null}

          {/* Shared wallets */}

          {wallets.length > 0 ? (
            <Card className="mb-6">
              <Table caption="Wallet correlation evidence">
                <THead>
                  <tr>
                    <Th>Actor</Th>
                    <Th>Wallet</Th>
                    <Th>Asset</Th>
                  </tr>
                </THead>

                <TBody>
                  {wallets.map((item) => (
                    <tr
                      key={`${item.actorId}-${item.walletId}`}
                      className="hover:bg-slate-50"
                    >
                      <Td>
                        <Link
                          href={`/actors/${item.actorId}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {item.actor.name}
                        </Link>
                      </Td>

                      <Td className="font-mono text-xs text-slate-800">
                        {item.wallet.address}
                      </Td>

                      <Td className="text-slate-700">
                        {item.wallet.asset}
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </Card>
          ) : null}

          {/* Infrastructure */}

          {infrastructure.length > 0 ? (
            <Card className="mb-6">
              <Table caption="Infrastructure correlation evidence">
                <THead>
                  <tr>
                    <Th>Actor</Th>
                    <Th>Type</Th>
                    <Th>Indicator</Th>
                    <Th>Confidence</Th>
                  </tr>
                </THead>

                <TBody>
                  {infrastructure.map((item) => (
                    <tr
                      key={`${item.actorId}-${item.infrastructureId}`}
                      className="hover:bg-slate-50"
                    >
                      <Td>
                        <Link
                          href={`/actors/${item.actorId}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {item.actor.name}
                        </Link>
                      </Td>

                      <Td className="capitalize text-slate-700">
                        {humanizeKey(
                          item.infrastructure.type,
                        )}
                      </Td>

                      <Td className="font-mono text-xs text-slate-800">
                        {item.infrastructure.value}
                      </Td>

                      <Td>
                        <ConfidenceBadge
                          confidence={confidenceAssessment(
                            item.infrastructure.confidence,
                          )}
                        />
                      </Td>
                    </tr>
                  ))}
                </TBody>
              </Table>
            </Card>
          ) : null}

          {/* Related personas */}

          {relatedPersonas.length > 0 ? (
            <Card className="mb-6">
              <CardBody>
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  Related personas
                </h2>

                <div className="space-y-3">
                  {relatedPersonas.map((persona) => (
                    <div
                      key={persona.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/actors/${persona.actorId}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {persona.actor.name}
                        </Link>

                        <ConfidenceBadge
                          confidence={confidenceAssessment(
                            persona.confidence,
                          )}
                        />
                      </div>

                      {persona.hypothesis ? (
                        <p className="mt-3 text-sm text-slate-600">
                          {persona.hypothesis}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          ) : null}

          {/* Direct indicator results */}

          <Card>
            <Table caption="Direct investigation matches">
              <THead>
                <tr>
                  <Th>Type</Th>
                  <Th>Value</Th>
                  <Th>Linked actor</Th>
                  <Th>Confidence</Th>
                  <Th>Context</Th>
                </tr>
              </THead>

              <TBody>
                {filteredResults.map((hit) => (
                  <tr
                    key={hit.id}
                    className="hover:bg-slate-50"
                  >
                    <Td className="capitalize text-slate-700">
                      {humanizeKey(hit.type)}
                    </Td>

                    <Td className="font-mono text-xs text-slate-800">
                      {hit.value}
                    </Td>

                    <Td>
                      {hit.actorId ? (
                        <Link
                          href={`/actors/${hit.actorId}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {actorNames[hit.actorId] ??
                            hit.actorId}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </Td>

                    <Td>
                      <ConfidenceBadge
                        confidence={confidenceAssessment(
                          hit.confidence,
                        )}
                      />
                    </Td>

                    <Td className="max-w-md text-slate-600">
                      {hit.context}
                    </Td>
                  </tr>
                ))}
              </TBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}