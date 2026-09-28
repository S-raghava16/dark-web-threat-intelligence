"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { humanizeKey } from "@/lib/format";

export type GraphRelationship = {
  id: string;
  fromActorId: string;
  toActorId: string;
  fromActorName: string;
  toActorName: string;
  type: string;
  confidence: number;
  hypothesis: string | null;
};

export type GraphInfrastructure = {
  id: string;
  type: string;
  value: string;
  confidence: number;
  source: string;
  reliability: string;
  associatedActorIds: string[];
};

type GraphViewProps = {
  relationships: GraphRelationship[];
  infrastructure?: GraphInfrastructure[];
  actorMap?: Record<string, string>;
  initialMode?: "relationships" | "infrastructure";
};

export function GraphView({
  relationships,
  infrastructure = [],
  actorMap = {},
  initialMode = "relationships",
}: GraphViewProps) {
  const [mode, setMode] = useState<"relationships" | "infrastructure">(initialMode);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // Relationships Graph Elements
  // -------------------------------------------------------------
  const relationshipElements = useMemo(() => {
    const nodes = new Map<
      string,
      {
        data: {
          id: string;
          label: string;
          nodeType: "actor";
        };
      }
    >();

    for (const relationship of relationships) {
      nodes.set(relationship.fromActorId, {
        data: {
          id: relationship.fromActorId,
          label: relationship.fromActorName,
          nodeType: "actor",
        },
      });

      nodes.set(relationship.toActorId, {
        data: {
          id: relationship.toActorId,
          label: relationship.toActorName,
          nodeType: "actor",
        },
      });
    }

    const edges = relationships.map((relationship) => ({
      data: {
        id: relationship.id,
        source: relationship.fromActorId,
        target: relationship.toActorId,
        label: humanizeKey(relationship.type),
        confidence: relationship.confidence,
      },
    }));

    return [...nodes.values(), ...edges];
  }, [relationships]);

  // -------------------------------------------------------------
  // Infrastructure Bipartite Graph Elements
  // -------------------------------------------------------------
  const infrastructureElements = useMemo(() => {
    const nodes = new Map<string, any>();
    const edges: any[] = [];

    // Add indicator nodes and connect to their associated actors
    for (const item of infrastructure) {
      const infraNodeId = `infra-${item.id}`;
      nodes.set(infraNodeId, {
        data: {
          id: infraNodeId,
          label: item.value.length > 24 ? `${item.value.slice(0, 22)}…` : item.value,
          fullValue: item.value,
          nodeType: "infra",
          infraType: item.type,
          reliability: item.reliability,
          confidence: item.confidence,
          source: item.source,
          rawId: item.id,
        },
      });

      // For every associated actor, ensure actor node exists & add edge
      for (const actorId of item.associatedActorIds) {
        const actorNodeId = `actor-${actorId}`;
        if (!nodes.has(actorNodeId)) {
          nodes.set(actorNodeId, {
            data: {
              id: actorNodeId,
              label: actorMap[actorId] ?? actorId,
              nodeType: "actor",
              actorId,
            },
          });
        }

        const edgeLabel =
          item.type === "wallet"
            ? "transacts"
            : item.type === "onion_service"
            ? "hosts on"
            : item.type === "domain"
            ? "resolves"
            : item.type === "pgp_key"
            ? "signs with"
            : "uses";

        edges.push({
          data: {
            id: `edge-${actorId}-${item.id}`,
            source: actorNodeId,
            target: infraNodeId,
            label: edgeLabel,
            confidence: item.confidence,
          },
        });
      }
    }

    return [...nodes.values(), ...edges];
  }, [infrastructure, actorMap]);

  const activeElements =
    mode === "infrastructure" ? infrastructureElements : relationshipElements;

  // Selected Entity details
  const selectedActor = useMemo(() => {
    if (!selectedNodeId || mode !== "relationships") return null;

    return (
      relationships
        .flatMap((relationship) => [
          {
            id: relationship.fromActorId,
            name: relationship.fromActorName,
          },
          {
            id: relationship.toActorId,
            name: relationship.toActorName,
          },
        ])
        .find((actor) => actor.id === selectedNodeId) ?? null
    );
  }, [relationships, selectedNodeId, mode]);

  const selectedRelationships = useMemo(() => {
    if (!selectedNodeId || mode !== "relationships") return [];

    const seen = new Set<string>();
    return relationships.filter((relationship) => {
      const key = [relationship.fromActorId, relationship.toActorId, relationship.type]
        .sort()
        .join("-");

      if (seen.has(key)) return false;
      seen.add(key);

      return (
        relationship.fromActorId === selectedNodeId ||
        relationship.toActorId === selectedNodeId
      );
    });
  }, [relationships, selectedNodeId, mode]);

  const selectedInfraNode = useMemo(() => {
    if (!selectedNodeId || mode !== "infrastructure") return null;

    if (selectedNodeId.startsWith("infra-")) {
      const infraId = selectedNodeId.replace("infra-", "");
      return infrastructure.find((i) => i.id === infraId) ?? null;
    }
    return null;
  }, [infrastructure, selectedNodeId, mode]);

  const selectedInfraActor = useMemo(() => {
    if (!selectedNodeId || mode !== "infrastructure") return null;

    if (selectedNodeId.startsWith("actor-")) {
      const actorId = selectedNodeId.replace("actor-", "");
      const name = actorMap[actorId] ?? actorId;
      const linkedInfra = infrastructure.filter((i) =>
        i.associatedActorIds.includes(actorId),
      );
      return { actorId, name, linkedInfra };
    }
    return null;
  }, [actorMap, infrastructure, selectedNodeId, mode]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Graph investigation"
        description="Interactive graph visualizer powered by multi-actor attribution and shared infrastructure telemetry."
      />

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("relationships");
              setSelectedNodeId(null);
            }}
            className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
              mode === "relationships"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Actor Relationships</span>
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-700">
              {relationships.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("infrastructure");
              setSelectedNodeId(null);
            }}
            className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
              mode === "infrastructure"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Infrastructure Graph</span>
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono text-slate-700">
              {infrastructure.length}
            </span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-600 ring-1 ring-blue-400" />
            <span className="font-medium">Threat Actor</span>
          </div>
          {mode === "infrastructure" ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-orange-600 ring-1 ring-orange-400" />
                <span>Wallet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-purple-600 ring-1 ring-purple-400" />
                <span>Onion Service</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-purple-600 ring-1 ring-purple-400" />
                <span>Domain / Mirror</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-emerald-600 ring-1 ring-emerald-400" />
                <span>PGP Key</span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Graph Visualizer Card */}
      <Card>
        <CardHeader
          title={
            mode === "relationships"
              ? "Actor Relationship Graph"
              : "Bipartite Infrastructure Correlation Graph"
          }
          description={
            mode === "relationships"
              ? `${relationships.length} persona relationships loaded. Click any node to inspect attribution hypotheses.`
              : `${infrastructure.length} infrastructure indicators connected to threat actor clusters. Click any node to inspect correlation details.`
          }
        />
        <CardBody className="p-0">
          <CytoscapeComponent
            key={mode}
            elements={activeElements}
            style={{
              width: "100%",
              height: "560px",
              background: "#f8fafc",
            }}
            layout={{
              name: "cose",
              animate: false,
              fit: true,
              padding: 60,
              nodeRepulsion: () => 8000,
              idealEdgeLength: () => 120,
            }}
            cy={(cy: any) => {
              cy.on("tap", "node", (event: any) => {
                const id = event.target.id();
                setSelectedNodeId(id);
              });
            }}
            stylesheet={[
              // Actor Nodes Default (Blue)
              {
                selector: "node[nodeType = 'actor'], node[!nodeType]",
                style: {
                  label: "data(label)",
                  "background-color": "#2563eb",
                  color: "#ffffff",
                  "font-size": 12,
                  "font-weight": "bold",
                  "text-valign": "center",
                  "text-halign": "center",
                  "border-width": 2,
                  "border-color": "#1d4ed8",
                  width: 65,
                  height: 65,
                },
              },
              // Infrastructure Wallet Nodes (Orange)
              {
                selector: "node[infraType = 'wallet']",
                style: {
                  label: "data(label)",
                  "background-color": "#ea580c",
                  color: "#ffffff",
                  "font-size": 10,
                  "font-family": "monospace",
                  "text-valign": "bottom",
                  "text-halign": "center",
                  "border-width": 2,
                  "border-color": "#c2410c",
                  width: 48,
                  height: 48,
                },
              },
              // Infrastructure Onion Nodes (Purple)
              {
                selector: "node[infraType = 'onion_service']",
                style: {
                  label: "data(label)",
                  "background-color": "#7c3aed",
                  color: "#ffffff",
                  "font-size": 10,
                  "font-family": "monospace",
                  "text-valign": "bottom",
                  "text-halign": "center",
                  "border-width": 2,
                  "border-color": "#6d28d9",
                  width: 52,
                  height: 52,
                },
              },
              // Infrastructure Domain Nodes (Purple)
              {
                selector: "node[infraType = 'domain']",
                style: {
                  label: "data(label)",
                  "background-color": "#7c3aed",
                  color: "#ffffff",
                  "font-size": 10,
                  "font-family": "monospace",
                  "text-valign": "bottom",
                  "text-halign": "center",
                  "border-width": 2,
                  "border-color": "#6d28d9",
                  width: 48,
                  height: 48,
                },
              },
              // Infrastructure PGP Key Nodes (Green)
              {
                selector: "node[infraType = 'pgp_key']",
                style: {
                  label: "data(label)",
                  "background-color": "#16a34a",
                  color: "#ffffff",
                  "font-size": 10,
                  "font-family": "monospace",
                  "text-valign": "bottom",
                  "text-halign": "center",
                  "border-width": 2,
                  "border-color": "#15803d",
                  width: 48,
                  height: 48,
                },
              },
              // Infrastructure Cluster Nodes
              {
                selector: "node[infraType = 'hosting_cluster']",
                style: {
                  label: "data(label)",
                  "background-color": "#64748b",
                  color: "#ffffff",
                  "font-size": 10,
                  "text-valign": "bottom",
                  "text-halign": "center",
                  "border-width": 2,
                  "border-color": "#475569",
                  width: 48,
                  height: 48,
                },
              },
              // Selected Node State
              {
                selector: "node:selected",
                style: {
                  "border-width": 4,
                  "border-color": "#1e40af",
                  width: 76,
                  height: 76,
                },
              },
              // Edges (Gray)
              {
                selector: "edge",
                style: {
                  label: "data(label)",
                  width: 2,
                  "line-color": "#94a3b8",
                  "target-arrow-color": "#94a3b8",
                  "target-arrow-shape": "triangle",
                  "curve-style": "bezier",
                  color: "#334155",
                  "font-size": 11,
                  "font-weight": "500",
                  "text-background-color": "#ffffff",
                  "text-background-opacity": 1,
                  "text-background-padding": 3,
                  "text-border-color": "#cbd5e1",
                  "text-border-width": 1,
                  "text-border-opacity": 1,
                },
              },
            ]}
          />
        </CardBody>
      </Card>

      {/* Selected Entity Details Card (Relationships Mode) */}
      {selectedActor ? (
        <Card>
          <CardHeader
            title={`Selected Persona: ${selectedActor.name}`}
            description="Observable relationships and attribution hypotheses in current intelligence corpus"
            action={
              <Link
                href={`/actors/${selectedActor.id}`}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                View Full Actor Profile →
              </Link>
            }
          />
          <CardBody>
            <div className="space-y-3">
              {selectedRelationships.map((relationship) => (
                <div
                  key={relationship.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {relationship.fromActorName}
                      </span>
                      <span className="text-slate-400 font-bold">↔</span>
                      <span className="font-semibold text-slate-800">
                        {relationship.toActorName}
                      </span>
                      <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs capitalize text-slate-700 font-medium">
                        {humanizeKey(relationship.type)}
                      </span>
                    </div>
                    <div className="font-mono text-sm font-bold text-blue-600">
                      {relationship.confidence}% Confidence
                    </div>
                  </div>
                  {relationship.hypothesis ? (
                    <p className="mt-2 text-xs text-slate-600">
                      {relationship.hypothesis}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* Selected Infrastructure Indicator Node Details (Infrastructure Mode) */}
      {selectedInfraNode ? (
        <Card>
          <CardHeader
            title="Selected Infrastructure Indicator"
            description="Operational indicator linking threat actors across the dark web corpus"
            action={
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs font-semibold text-blue-700 capitalize">
                {humanizeKey(selectedInfraNode.type)}
              </span>
            }
          />
          <CardBody className="space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
                Indicator Value
              </div>
              <div className="mt-1 font-mono text-sm font-bold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200 break-all">
                {selectedInfraNode.value}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500 font-medium">Reliability</div>
                <div className="mt-1 font-semibold text-slate-900">
                  {selectedInfraNode.reliability}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500 font-medium">Confidence Score</div>
                <div className="mt-1 font-mono font-bold text-blue-600">
                  {selectedInfraNode.confidence}%
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-500 font-medium">Source</div>
                <div className="mt-1 text-xs text-slate-700 font-medium">
                  {selectedInfraNode.source}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Correlated Personas ({selectedInfraNode.associatedActorIds.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedInfraNode.associatedActorIds.map((actorId) => (
                  <Link
                    key={actorId}
                    href={`/actors/${actorId}`}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 hover:border-blue-400 hover:underline shadow-sm"
                  >
                    {actorMap[actorId] ?? actorId}
                  </Link>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* Selected Threat Actor Node Details (Infrastructure Mode) */}
      {selectedInfraActor ? (
        <Card>
          <CardHeader
            title={`Actor: ${selectedInfraActor.name}`}
            description="Infrastructure correlation footprint"
            action={
              <Link
                href={`/actors/${selectedInfraActor.actorId}`}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                View Full Actor Profile →
              </Link>
            }
          />
          <CardBody>
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Connected Infrastructure Indicators ({selectedInfraActor.linkedInfra.length})
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedInfraActor.linkedInfra.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-slate-600 font-medium">
                        {humanizeKey(item.type)}
                      </span>
                      <span className="font-mono font-bold text-blue-600">
                        {item.confidence}%
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-slate-800 truncate">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}