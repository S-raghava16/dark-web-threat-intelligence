import { prisma } from "@/lib/prisma";
import {
  getActorById as getSyntheticActorById,
  getActors as getSyntheticActors,
  getAlerts as getSyntheticAlerts,
  getAttributionBuckets as getSyntheticAttributionBuckets,
  getDashboardStats as getSyntheticDashboardStats,
  getEvidence as getSyntheticEvidence,
  getInfrastructure as getSyntheticInfrastructure,
  getInvestigations as getSyntheticInvestigations,
  getTimelineEvents as getSyntheticTimelineEvents,
} from "@/lib/data/queries";

async function withDbFallback<T>(
  operation: () => Promise<T>,
  fallback: unknown,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (process.env.DATABASE_URL) {
      console.warn("Database unavailable; using synthetic fallback data.", error);
    }
    return fallback as T;
  }
}

export async function getActors(): Promise<any[]> {
  return withDbFallback<any>(
    () =>
      prisma.actor.findMany({
        include: {
          aliases: true,
          handles: true,
          pgpKeys: true,
          wallets: {
            include: {
              wallet: true,
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
          infrastructure: {
            include: {
              infrastructure: true,
            },
          },
        },
        orderBy: {},
      }),
    getSyntheticActors() as any,
  );
}

export async function getActorById(id: string): Promise<any | null> {
  return withDbFallback<any>(
    () =>
      prisma.actor.findUnique({
        where: {
          id,
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
          infrastructure: {
            include: {
              infrastructure: true,
            },
          },
          evidence: {
            include: {
              evidence: true,
            },
          },
          investigations: {
            include: {
              investigation: true,
            },
          },
          timelineEvents: true,
          alerts: true,
          emails: true,
          relationshipsFrom: {
            include: {
              toActor: true,
              evidenceContributions: true,
            },
          },
          relationshipsTo: {
            include: {
              fromActor: true,
              evidenceContributions: true,
            },
          },
        },
      }),
    getSyntheticActorById(id) as any,
  );
}

export async function getInvestigations(): Promise<any[]> {
  return withDbFallback<any>(
    () =>
      prisma.investigation.findMany({
        include: {
          actors: {
            include: {
              actor: true,
            },
          },
          evidence: true,
          infrastructure: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      }),
    getSyntheticInvestigations() as any,
  );
}

export default async function getEvidence(): Promise<any[]> {
  return withDbFallback<any>(
    () =>
      prisma.evidence.findMany({
        include: {
          actors: {
            include: {
              actor: true,
            },
          },
          investigation: true,
        },
      }),
    getSyntheticEvidence() as any,
  );
}

export async function getAlerts(): Promise<any[]> {
  return withDbFallback<any>(
    () =>
      prisma.alert.findMany({
        include: {
          actor: true,
          investigation: true,
        },
        orderBy: {
          timestamp: "desc",
        },
      }),
    getSyntheticAlerts() as any,
  );
}

export async function getInfrastructure(): Promise<any[]> {
  return withDbFallback<any>(
    () =>
      prisma.infrastructureIndicator.findMany({
        include: {
          actors: {
            include: {
              actor: true,
            },
          },
          wallet: true,
          pgpKey: true,
        },
        orderBy: {
          lastSeen: "desc",
        },
      }),
    getSyntheticInfrastructure() as any,
  );
}

export async function getTimelineEvents(): Promise<any[]> {
  return withDbFallback<any>(
    () =>
      prisma.timelineEvent.findMany({
        include: {
          actor: true,
          investigation: true,
        },
        orderBy: {
          timestamp: "desc",
        },
      }),
    getSyntheticTimelineEvents() as any,
  );
}

export async function getDashboardStats(): Promise<any> {
  return withDbFallback<any>(async () => {
    const [
      totalActors,
      activeInvestigations,
      infrastructureIndicators,
      highConfidenceRelationships,
    ] = await Promise.all([
      prisma.actor.count(),
      prisma.investigation.count({
        where: {
          status: {
            in: ["open", "active"],
          },
        },
      }),
      prisma.infrastructureIndicator.count(),
      prisma.actor.count({
        where: {
          attributionConfidence: {
            gte: 75,
          },
          relatedPersonas: {
            some: {},
          },
        },
      }),
    ]);

    return {
      totalActors,
      activeInvestigations,
      highConfidenceRelationships,
      infrastructureIndicators,
    };
  }, getSyntheticDashboardStats() as any);
}

export async function getAttributionBuckets(): Promise<any[]> {
  return withDbFallback<any>(async () => {
    const groups = await prisma.actor.groupBy({
      by: ["attributionConfidence"],
      _count: {
        _all: true,
      },
    });

    const counts = {
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const group of groups) {
      if (group.attributionConfidence >= 75) {
        counts.high += group._count._all;
      } else if (group.attributionConfidence >= 50) {
        counts.medium += group._count._all;
      } else {
        counts.low += group._count._all;
      }
    }

    return [
      {
        level: "high" as const,
        count: counts.high,
      },
      {
        level: "medium" as const,
        count: counts.medium,
      },
      {
        level: "low" as const,
        count: counts.low,
      },
    ];
  }, getSyntheticAttributionBuckets() as any);
}

export async function getActorRelationships(): Promise<any[]> {
  return withDbFallback<any>(
    () =>
      prisma.actorRelationship.findMany({
        include: {
          fromActor: true,
          toActor: true,
        },
        orderBy: {
          confidence: "desc",
        },
      }),
    [] as any,
  );
}