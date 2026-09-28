import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RelationshipSignal = {
  type:
    | "shared_handle"
    | "shared_wallet"
    | "shared_pgp"
    | "shared_infrastructure"
    | "shared_marketplace"
    | "shared_forum";

  evidenceCount: number;
  evidenceConfidence: number;
  explanation: string;
};

type DiscoveredRelationship = {
  fromActorId: string;
  toActorId: string;
  type: RelationshipSignal["type"];
  confidence: number;
  hypothesis: string;
  signals: RelationshipSignal[];
  provenance: "correlation_engine";
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Calculates relationship confidence from the evidence itself.
 *
 * This deliberately does NOT say:
 *
 * shared wallet = 91%
 *
 * Instead, the confidence is derived from:
 * - how many independent signals exist
 * - the confidence of those signals
 * - corroboration between different signal types
 *
 * A single weak signal therefore cannot produce a very high score.
 */
function calculateRelationshipConfidence(
  signals: RelationshipSignal[],
) {
  if (signals.length === 0) {
    return 0;
  }

  const averageEvidenceConfidence =
    signals.reduce(
      (total, signal) => total + signal.evidenceConfidence,
      0,
    ) / signals.length;

  const signalCount = signals.length;

  /*
   * Independent signal corroboration.
   *
   * More distinct evidence types increase confidence,
   * but with diminishing returns.
   */
  const corroborationFactor =
    1 + Math.min(0.45, (signalCount - 1) * 0.12);

  /*
   * Evidence breadth prevents one isolated observation
   * from looking equivalent to several corroborating observations.
   */
  const breadthFactor =
    Math.min(1, 0.55 + signalCount * 0.15);

  return clamp(
    averageEvidenceConfidence *
      corroborationFactor *
      breadthFactor,
  );
}

function relationshipKey(
  actorA: string,
  actorB: string,
  type: RelationshipSignal["type"],
) {
  const [from, to] = [actorA, actorB].sort();

  return `${from}|${to}|${type}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const query =
      typeof body.query === "string"
        ? body.query.trim()
        : "";

    if (!query) {
      return NextResponse.json(
        {
          error: "Search query is required.",
        },
        { status: 400 },
      );
    }

    const search = {
      contains: query,
      mode: "insensitive" as const,
    };

    // ------------------------------------------------------------
    // 1. Find direct indicator matches
    // ------------------------------------------------------------

    const [
      actors,
      aliases,
      handles,
      pgpKeys,
      wallets,
      infrastructure,
      marketplaces,
      forums,
    ] = await Promise.all([
      prisma.actor.findMany({
        where: {
          name: search,
        },
      }),

      prisma.actorAlias.findMany({
        where: {
          value: search,
        },
      }),

      prisma.actorHandle.findMany({
        where: {
          value: search,
        },
      }),

      prisma.pgpKey.findMany({
        where: {
          OR: [
            { fingerprint: search },
            { associatedHandle: search },
          ],
        },
      }),

      prisma.wallet.findMany({
        where: {
          address: search,
        },
      }),

      prisma.infrastructureIndicator.findMany({
        where: {
          value: search,
        },
      }),

      prisma.marketplace.findMany({
        where: {
          name: search,
        },
      }),

      prisma.forum.findMany({
        where: {
          name: search,
        },
      }),
    ]);

    // ------------------------------------------------------------
    // 2. Build initial actor set
    // ------------------------------------------------------------

    const actorIds = new Set<string>();

    for (const actor of actors) {
      actorIds.add(actor.id);
    }

    for (const alias of aliases) {
      actorIds.add(alias.actorId);
    }

    for (const handle of handles) {
      actorIds.add(handle.actorId);
    }

    for (const key of pgpKeys) {
      actorIds.add(key.actorId);
    }

    // Actors connected to matched wallets

    if (wallets.length > 0) {
      const walletLinks =
        await prisma.actorWallet.findMany({
          where: {
            walletId: {
              in: wallets.map((wallet) => wallet.id),
            },
          },
          select: {
            actorId: true,
          },
        });

      for (const link of walletLinks) {
        actorIds.add(link.actorId);
      }
    }

    // Actors connected to matched infrastructure

    if (infrastructure.length > 0) {
      const infrastructureLinks =
        await prisma.actorInfrastructure.findMany({
          where: {
            infrastructureId: {
              in: infrastructure.map(
                (indicator) => indicator.id,
              ),
            },
          },
          select: {
            actorId: true,
          },
        });

      for (const link of infrastructureLinks) {
        actorIds.add(link.actorId);
      }
    }

    // Actors connected to matched marketplaces

    if (marketplaces.length > 0) {
      const marketplaceLinks =
        await prisma.marketplacePresence.findMany({
          where: {
            marketplaceId: {
              in: marketplaces.map(
                (marketplace) => marketplace.id,
              ),
            },
          },
          select: {
            actorId: true,
          },
        });

      for (const link of marketplaceLinks) {
        actorIds.add(link.actorId);
      }
    }

    // Actors connected to matched forums

    if (forums.length > 0) {
      const forumLinks =
        await prisma.forumPresence.findMany({
          where: {
            forumId: {
              in: forums.map((forum) => forum.id),
            },
          },
          select: {
            actorId: true,
          },
        });

      for (const link of forumLinks) {
        actorIds.add(link.actorId);
      }
    }

    // ------------------------------------------------------------
    // 3. Load discovered actors
    // ------------------------------------------------------------

    const discoveredActorIds = [...actorIds];

    const matchedActors =
      discoveredActorIds.length === 0
        ? []
        : await prisma.actor.findMany({
            where: {
              id: {
                in: discoveredActorIds,
              },
            },

            include: {
              aliases: true,
              handles: true,
              pgpKeys: true,

              wallets: {
                include: {
                  wallet: true,
                },
              },

              infrastructure: {
                include: {
                  infrastructure: true,
                },
              },

              marketplacePresences: {
                include: {
                  marketplace: true,
                },
              },

              forumPresences: {
                include: {
                  forum: true,
                },
              },

              relatedPersonas: true,
            },
          });

    // ------------------------------------------------------------
    // 4. Load ALL raw evidence for discovered actors
    // ------------------------------------------------------------

    const [
      actorWalletLinks,
      actorPgpKeys,
      actorHandles,
      actorInfrastructureLinks,
      actorMarketplaceLinks,
      actorForumLinks,
    ] = await Promise.all([
      discoveredActorIds.length > 0
        ? prisma.actorWallet.findMany({
            where: {
              actorId: {
                in: discoveredActorIds,
              },
            },
            include: {
              wallet: true,
              actor: true,
            },
          })
        : [],

      discoveredActorIds.length > 0
        ? prisma.pgpKey.findMany({
            where: {
              actorId: {
                in: discoveredActorIds,
              },
            },
          })
        : [],

      discoveredActorIds.length > 0
        ? prisma.actorHandle.findMany({
            where: {
              actorId: {
                in: discoveredActorIds,
              },
            },
          })
        : [],

      discoveredActorIds.length > 0
        ? prisma.actorInfrastructure.findMany({
            where: {
              actorId: {
                in: discoveredActorIds,
              },
            },
            include: {
              infrastructure: true,
              actor: true,
            },
          })
        : [],

      discoveredActorIds.length > 0
        ? prisma.marketplacePresence.findMany({
            where: {
              actorId: {
                in: discoveredActorIds,
              },
            },
            include: {
              marketplace: true,
              actor: true,
            },
          })
        : [],

      discoveredActorIds.length > 0
        ? prisma.forumPresence.findMany({
            where: {
              actorId: {
                in: discoveredActorIds,
              },
            },
            include: {
              forum: true,
              actor: true,
            },
          })
        : [],
    ]);

    // ------------------------------------------------------------
    // 5. CORRELATION ENGINE
    // ------------------------------------------------------------

    const discoveredRelationships =
      new Map<string, DiscoveredRelationship>();

    function addSignal(
      actorA: string,
      actorB: string,
      signal: RelationshipSignal,
    ) {
      if (actorA === actorB) {
        return;
      }

      const key = relationshipKey(
        actorA,
        actorB,
        signal.type,
      );

      const existing =
        discoveredRelationships.get(key);

      if (!existing) {
        discoveredRelationships.set(key, {
          fromActorId: actorA,
          toActorId: actorB,
          type: signal.type,
          confidence: 0,
          hypothesis: signal.explanation,
          signals: [signal],
          provenance: "correlation_engine",
        });

        return;
      }

      existing.signals.push(signal);

      existing.confidence =
        calculateRelationshipConfidence(
          existing.signals,
        );
    }

    // ------------------------------------------------------------
    // 5A. Shared wallets
    // ------------------------------------------------------------

    const actorsByWallet =
      new Map<string, string[]>();

    for (const link of actorWalletLinks) {
      const existing =
        actorsByWallet.get(link.walletId) ?? [];

      existing.push(link.actorId);

      actorsByWallet.set(
        link.walletId,
        existing,
      );
    }

    for (const [walletId, linkedActors] of actorsByWallet) {
      const uniqueActors = [
        ...new Set(linkedActors),
      ];

      for (let i = 0; i < uniqueActors.length; i++) {
        for (
          let j = i + 1;
          j < uniqueActors.length;
          j++
        ) {
          const wallet =
            actorWalletLinks.find(
              (link) =>
                link.walletId === walletId,
            )?.wallet;

          addSignal(
            uniqueActors[i],
            uniqueActors[j],
            {
              type: "shared_wallet",
              evidenceCount: 1,
              evidenceConfidence: 100,
              explanation: wallet
                ? `Both actors are associated with wallet ${wallet.address}.`
                : "Both actors are associated with the same wallet.",
            },
          );
        }
      }
    }

    // ------------------------------------------------------------
    // 5B. Shared PGP keys
    // ------------------------------------------------------------

    const actorsByPgp =
      new Map<string, string[]>();

    for (const key of actorPgpKeys) {
      const existing =
        actorsByPgp.get(key.fingerprint) ?? [];

      existing.push(key.actorId);

      actorsByPgp.set(
        key.fingerprint,
        existing,
      );
    }

    for (const [fingerprint, linkedActors] of actorsByPgp) {
      const uniqueActors = [
        ...new Set(linkedActors),
      ];

      for (let i = 0; i < uniqueActors.length; i++) {
        for (
          let j = i + 1;
          j < uniqueActors.length;
          j++
        ) {
          addSignal(
            uniqueActors[i],
            uniqueActors[j],
            {
              type: "shared_pgp",
              evidenceCount: 1,
              evidenceConfidence: 100,
              explanation: `Both actors are associated with PGP fingerprint ${fingerprint}.`,
            },
          );
        }
      }
    }

    // ------------------------------------------------------------
    // 5C. Shared handles
    // ------------------------------------------------------------

    const actorsByHandle =
      new Map<string, string[]>();

    for (const handle of actorHandles) {
      const normalized =
        handle.value.trim().toLowerCase();

      const existing =
        actorsByHandle.get(normalized) ?? [];

      existing.push(handle.actorId);

      actorsByHandle.set(
        normalized,
        existing,
      );
    }

    for (const [handle, linkedActors] of actorsByHandle) {
      const uniqueActors = [
        ...new Set(linkedActors),
      ];

      for (let i = 0; i < uniqueActors.length; i++) {
        for (
          let j = i + 1;
          j < uniqueActors.length;
          j++
        ) {
          addSignal(
            uniqueActors[i],
            uniqueActors[j],
            {
              type: "shared_handle",
              evidenceCount: 1,
              evidenceConfidence: 100,
              explanation: `Both actors use the handle "${handle}".`,
            },
          );
        }
      }
    }

    // ------------------------------------------------------------
    // 5D. Shared infrastructure
    // ------------------------------------------------------------

    const actorsByInfrastructure =
      new Map<string, string[]>();

    for (const link of actorInfrastructureLinks) {
      const existing =
        actorsByInfrastructure.get(
          link.infrastructureId,
        ) ?? [];

      existing.push(link.actorId);

      actorsByInfrastructure.set(
        link.infrastructureId,
        existing,
      );
    }

    for (
      const [
        infrastructureId,
        linkedActors,
      ] of actorsByInfrastructure
    ) {
      const uniqueActors = [
        ...new Set(linkedActors),
      ];

      const indicator =
        actorInfrastructureLinks.find(
          (link) =>
            link.infrastructureId ===
            infrastructureId,
        )?.infrastructure;

      const evidenceConfidence =
        indicator?.confidence ?? 0;

      for (let i = 0; i < uniqueActors.length; i++) {
        for (
          let j = i + 1;
          j < uniqueActors.length;
          j++
        ) {
          addSignal(
            uniqueActors[i],
            uniqueActors[j],
            {
              type: "shared_infrastructure",
              evidenceCount: 1,
              evidenceConfidence,
              explanation: indicator
                ? `Both actors are linked to infrastructure indicator ${indicator.value}.`
                : "Both actors are linked to the same infrastructure indicator.",
            },
          );
        }
      }
    }

    // ------------------------------------------------------------
    // 5E. Shared marketplaces
    // ------------------------------------------------------------

    const actorsByMarketplace =
      new Map<string, string[]>();

    for (const presence of actorMarketplaceLinks) {
      const existing =
        actorsByMarketplace.get(
          presence.marketplaceId,
        ) ?? [];

      existing.push(presence.actorId);

      actorsByMarketplace.set(
        presence.marketplaceId,
        existing,
      );
    }

    for (
      const [
        marketplaceId,
        linkedActors,
      ] of actorsByMarketplace
    ) {
      const uniqueActors = [
        ...new Set(linkedActors),
      ];

      const marketplace =
        actorMarketplaceLinks.find(
          (presence) =>
            presence.marketplaceId ===
            marketplaceId,
        )?.marketplace;

      for (let i = 0; i < uniqueActors.length; i++) {
        for (
          let j = i + 1;
          j < uniqueActors.length;
          j++
        ) {
          addSignal(
            uniqueActors[i],
            uniqueActors[j],
            {
              type: "shared_marketplace",
              evidenceCount: 1,
              /*
               * Marketplace overlap by itself is weak evidence.
               * Its confidence is deliberately derived from the
               * nature of the signal rather than an actor-specific
               * hardcoded confidence value.
               */
              evidenceConfidence: 35,
              explanation: marketplace
                ? `Both actors have a presence on ${marketplace.name}.`
                : "Both actors have a presence on the same marketplace.",
            },
          );
        }
      }
    }

    // ------------------------------------------------------------
    // 5F. Shared forums
    // ------------------------------------------------------------

    const actorsByForum =
      new Map<string, string[]>();

    for (const presence of actorForumLinks) {
      const existing =
        actorsByForum.get(
          presence.forumId,
        ) ?? [];

      existing.push(presence.actorId);

      actorsByForum.set(
        presence.forumId,
        existing,
      );
    }

    for (
      const [forumId, linkedActors] of actorsByForum
    ) {
      const uniqueActors = [
        ...new Set(linkedActors),
      ];

      const forum =
        actorForumLinks.find(
          (presence) =>
            presence.forumId === forumId,
        )?.forum;

      for (let i = 0; i < uniqueActors.length; i++) {
        for (
          let j = i + 1;
          j < uniqueActors.length;
          j++
        ) {
          addSignal(
            uniqueActors[i],
            uniqueActors[j],
            {
              type: "shared_forum",
              evidenceCount: 1,
              evidenceConfidence: 30,
              explanation: forum
                ? `Both actors have a presence on ${forum.name}.`
                : "Both actors have a presence on the same forum.",
            },
          );
        }
      }
    }

    // ------------------------------------------------------------
    // 6. Existing analytical relationships
    //
    // These are retained as previously generated/analyst
    // relationships, but raw evidence above is now sufficient
    // to discover relationships automatically.
    // ------------------------------------------------------------

    const existingRelationships =
      discoveredActorIds.length > 0
        ? await prisma.actorRelationship.findMany({
            where: {
              OR: [
                {
                  fromActorId: {
                    in: discoveredActorIds,
                  },
                },
                {
                  toActorId: {
                    in: discoveredActorIds,
                  },
                },
              ],
            },

            include: {
              fromActor: true,
              toActor: true,
              evidenceContributions: true,
            },

            orderBy: {
              confidence: "desc",
            },
          })
        : [];

    // ------------------------------------------------------------
    // 7. Related personas
    // ------------------------------------------------------------

    const relatedPersonas =
      discoveredActorIds.length > 0
        ? await prisma.relatedPersona.findMany({
            where: {
              actorId: {
                in: discoveredActorIds,
              },
            },
            include: {
              actor: true,
            },
          })
        : [];

    // ------------------------------------------------------------
    // 8. Finalize discovered relationship confidence
    // ------------------------------------------------------------

    for (const relationship of discoveredRelationships.values()) {
      relationship.confidence =
        calculateRelationshipConfidence(
          relationship.signals,
        );

      relationship.hypothesis =
        relationship.signals
          .map((signal) => signal.explanation)
          .join(" ");
    }

    const correlationRelationships = [
      ...discoveredRelationships.values(),
    ].sort(
      (a, b) =>
        b.confidence - a.confidence,
    );

    // ------------------------------------------------------------
    // 9. Return complete investigation bundle
    // ------------------------------------------------------------

    return NextResponse.json({
      query,

      matchedActors,

      matchedIndicators: {
        actors,
        aliases,
        handles,
        pgpKeys,
        wallets,
        infrastructure,
        marketplaces,
        forums,
      },

      investigation: {
        wallets: actorWalletLinks,
        pgpKeys: actorPgpKeys,
        handles: actorHandles,
        infrastructure: actorInfrastructureLinks,
        marketplaces: actorMarketplaceLinks,
        forums: actorForumLinks,

        /*
         * Automatically discovered relationships.
         */
        correlationRelationships,

        /*
         * Previously persisted analytical relationships.
         */
        existingRelationships,
        relationships: existingRelationships,

        relatedPersonas,
      },
    });
  } catch (error) {
    console.error(
      "Investigation search failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Investigation search failed.",
      },
      {
        status: 500,
      },
    );
  }
}