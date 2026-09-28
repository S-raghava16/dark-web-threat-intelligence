import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { generateRelationships } from "../lib/intelligence/relationship-engine";
import {
  PrismaClient,
  ActorStatus,
  WalletAsset,
  InvestigationStatus,
  InfrastructureType,
  EvidenceType,
  SeverityLevel,
  AlertStatus,
  TimelineEventType,
  RelationshipType,
} from "@prisma/client";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

  
  const date = (value: string) => new Date(value);
  
  async function main() {
    console.log("🌱 Starting synthetic database seed...");
  
    // Clean existing seed data so this script can safely be re-run.
    await prisma.evidenceContribution.deleteMany();
    await prisma.timelineEvent.deleteMany();
    await prisma.alert.deleteMany();
    await prisma.evidenceActor.deleteMany();
    await prisma.evidence.deleteMany();
    await prisma.investigationInfrastructure.deleteMany();
    await prisma.actorInfrastructure.deleteMany();
    await prisma.investigationActor.deleteMany();
    await prisma.actorRelationship.deleteMany();
    await prisma.relatedPersona.deleteMany();
    await prisma.actorHandle.deleteMany();
    await prisma.actorAlias.deleteMany();
    await prisma.actorEmail.deleteMany();
    await prisma.marketplacePresence.deleteMany();
    await prisma.forumPresence.deleteMany();
    await prisma.pgpKey.deleteMany();
    await prisma.actorWallet.deleteMany();
    await prisma.infrastructureIndicator.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.marketplace.deleteMany();
    await prisma.forum.deleteMany();
    await prisma.investigation.deleteMany();
    await prisma.actor.deleteMany();
  
    // ---------------------------------------------------------
    // ACTORS
    // ---------------------------------------------------------
  
    const actors = [
      {
        id: "syn-nexus-broker",
        name: "Nexus Broker",
        status: ActorStatus.active,
        attributionConfidence: 82,
        firstSeen: date("2025-11-04T09:12:00.000Z"),
        lastSeen: date("2026-09-02T18:40:00.000Z"),
        category: "Marketplace Vendor",
        riskLevel: SeverityLevel.high,
        lastScanDate: date("2026-09-20T14:30:00.000Z"),
        observedActivities: ["Data Trading", "Credential Selling", "Forum Activity"],
        sourceTelemetry: [
          { source: "Marketplace Intelligence", reliability: "HIGH" },
          { source: "Forum Observation", reliability: "MEDIUM" },
          { source: "Infrastructure Data", reliability: "LOW" },
        ],
        summary:
          "Synthetic marketplace vendor cluster used to demonstrate handle, PGP, and wallet reuse analysis. Observed only in the demo corpus.",
      },
      {
        id: "nexus_B",
        name: "Ghost",
        status: ActorStatus.active,
        attributionConfidence: 76,
        firstSeen: date("2024-11-04T09:12:00.000Z"),
        lastSeen: date("2025-09-02T18:40:00.000Z"),
        category: "Threat Actor Cluster",
        riskLevel: SeverityLevel.medium,
        lastScanDate: date("2026-09-18T10:00:00.000Z"),
        observedActivities: ["Financial Escrow", "Forum Discussions"],
        summary:
          "Synthetic vendor cluster used to demonstrate handle, PGP, and wallet reuse analysis. Observed only in the demo corpus.",
      },
      {
        id: "syn-ledger-ghost",
        name: "Ledger Ghost",
        status: ActorStatus.monitored,
        attributionConfidence: 61,
        firstSeen: date("2026-02-11T10:00:00.000Z"),
        lastSeen: date("2026-08-28T07:45:00.000Z"),
        category: "Escrow Persona",
        riskLevel: SeverityLevel.high,
        lastScanDate: date("2026-09-20T11:15:00.000Z"),
        observedActivities: ["Escrow Arbitration", "Cryptocurrency Pooling"],
        sourceTelemetry: [
          { source: "Marketplace Intelligence", reliability: "HIGH" },
          { source: "Forum Observation", reliability: "MEDIUM" },
        ],
        summary:
          "Synthetic escrow-style persona hypothesized to share wallet reuse patterns with Nexus Broker. Relationship is a demo hypothesis only.",
      },
      {
        id: "syn-cipher-vendor",
        name: "Cipher Vendor",
        status: ActorStatus.active,
        attributionConfidence: 54,
        firstSeen: date("2026-03-18T13:20:00.000Z"),
        lastSeen: date("2026-09-01T21:05:00.000Z"),
        category: "Marketplace Vendor",
        riskLevel: SeverityLevel.medium,
        lastScanDate: date("2026-09-15T09:00:00.000Z"),
        observedActivities: ["Data Trading"],
        summary:
          "Synthetic vendor used to show marketplace listing activity and onion-service indicator tracking.",
      },
      {
        id: "syn-harbor-admin",
        name: "Harbor Admin",
        status: ActorStatus.monitored,
        attributionConfidence: 37,
        firstSeen: date("2026-01-08T16:44:00.000Z"),
        lastSeen: date("2026-06-30T04:18:00.000Z"),
        category: "Forum Moderator",
        riskLevel: SeverityLevel.low,
        lastScanDate: date("2026-09-10T12:00:00.000Z"),
        observedActivities: ["Forum Administration"],
        summary:
          "Synthetic forum moderator cluster with weak overlap signals. Included to demonstrate low-confidence presentation.",
      },
      {
        id: "syn-relay-merchant",
        name: "Relay Merchant",
        status: ActorStatus.dormant,
        attributionConfidence: 29,
        firstSeen: date("2025-09-22T12:00:00.000Z"),
        lastSeen: date("2026-04-11T19:33:00.000Z"),
        category: "Dormant Merchant",
        riskLevel: SeverityLevel.info,
        lastScanDate: date("2026-08-01T08:00:00.000Z"),
        observedActivities: ["Historical Marketplace Sales"],
        summary:
          "Dormant synthetic merchant used for last-seen filtering and dormant-status badges.",
      },
    ];
  
    for (const actor of actors) {
      await prisma.actor.create({
        data: {
          ...actor,
          provenance: "synthetic_demo",
        },
      });
    }
  
    // ---------------------------------------------------------
    // ALIASES
    // ---------------------------------------------------------
  
    const aliases = [
      ["syn-nexus-broker", "NB Cluster"],
      ["syn-nexus-broker", "NB-Cluster"],
      ["syn-nexus-broker", "ledger_nex"],
      ["syn-ledger-ghost", "ghost_pay"],
      ["syn-ledger-ghost", "LG-Escrow"],
      ["syn-cipher-vendor", "cv_ops"],
      ["syn-harbor-admin", "harbor_mod"],
      ["syn-relay-merchant", "relay_mx"],
    ];
  
    for (const [actorId, value] of aliases) {
      await prisma.actorAlias.create({
        data: {
          actorId,
          value,
        },
      });
    }
  
    // ---------------------------------------------------------
    // HANDLES
    // ---------------------------------------------------------
  
    const handles = [
      {
        id: "h-nb-1",
        value: "nexus_broker_syn",
        platform: "Demo Market Alpha",
        firstSeen: "2025-11-04T09:12:00.000Z",
        lastSeen: "2026-09-02T18:40:00.000Z",
        actorId: "syn-nexus-broker",
      },
      {
        id: "h-nb-2",
        value: "nb_support",
        platform: "Demo Forum Helix",
        firstSeen: "2026-01-19T14:03:00.000Z",
        lastSeen: "2026-08-21T11:16:00.000Z",
        actorId: "syn-nexus-broker",
      },
      {
        id: "h-lg-1",
        value: "ledger_ghost",
        platform: "Demo Market Alpha",
        firstSeen: "2026-02-11T10:00:00.000Z",
        lastSeen: "2026-08-28T07:45:00.000Z",
        actorId: "syn-ledger-ghost",
      },
      {
        id: "h-cv-1",
        value: "cipher_vendor_syn",
        platform: "Demo Market Beta",
        firstSeen: "2026-03-18T13:20:00.000Z",
        lastSeen: "2026-09-01T21:05:00.000Z",
        actorId: "syn-cipher-vendor",
      },
      {
        id: "h-ha-1",
        value: "harbor_admin",
        platform: "Demo Forum Helix",
        firstSeen: "2026-01-08T16:44:00.000Z",
        lastSeen: "2026-06-30T04:18:00.000Z",
        actorId: "syn-harbor-admin",
      },
      {
        id: "h-rm-1",
        value: "relay_merchant",
        platform: "Demo Market Beta",
        firstSeen: "2025-09-22T12:00:00.000Z",
        lastSeen: "2026-04-11T19:33:00.000Z",
        actorId: "syn-relay-merchant",
      },
    ];
  
    for (const handle of handles) {
      await prisma.actorHandle.create({
        data: {
          ...handle,
          firstSeen: date(handle.firstSeen),
          lastSeen: date(handle.lastSeen),
        },
      });
    }
  
    // ---------------------------------------------------------
    // PGP KEYS
    // ---------------------------------------------------------
  
    const pgpKeys = [
      {
        id: "pgp-nb-1",
        fingerprint: "SYNTH-4F2A-91C0-BB17-NEXUS",
        associatedHandle: "nexus_broker_syn",
        firstSeen: "2025-11-04T09:12:00.000Z",
        lastSeen: "2026-09-02T18:40:00.000Z",
        actorId: "syn-nexus-broker",
      },
      {
        id: "pgp-lg-1",
        fingerprint: "SYNTH-4F2A-91C0-BB17-NEXUS",
        associatedHandle: "ledger_ghost",
        firstSeen: "2026-02-11T10:00:00.000Z",
        lastSeen: "2026-07-02T12:00:00.000Z",
        actorId: "syn-ledger-ghost",
      },
      {
        id: "pgp-cv-1",
        fingerprint: "SYNTH-CIPH-88F1-VENDOR",
        associatedHandle: "cipher_vendor_syn",
        firstSeen: "2026-03-18T13:20:00.000Z",
        lastSeen: "2026-09-01T21:05:00.000Z",
        actorId: "syn-cipher-vendor",
      },
      {
        id: "pgp-rm-1",
        fingerprint: "SYNTH-RELAY-0002-MERCH",
        associatedHandle: "relay_merchant",
        firstSeen: "2025-09-22T12:00:00.000Z",
        lastSeen: "2026-02-01T08:00:00.000Z",
        actorId: "syn-relay-merchant",
      },
    ];
  
    for (const key of pgpKeys) {
      await prisma.pgpKey.create({
        data: {
          ...key,
          firstSeen: date(key.firstSeen),
          lastSeen: date(key.lastSeen),
        },
      });
    }
  
    // ---------------------------------------------------------
    // WALLETS
    // ---------------------------------------------------------
  
    const wallets = [
      {
        id: "w-nb-1",
        address: "bc1gsynnexus000000demo01",
        asset: WalletAsset.BTC,
        firstSeen: "2025-12-01T08:00:00.000Z",
        lastSeen: "2026-08-30T16:22:00.000Z",
        actorIds: ["syn-nexus-broker", "syn-ledger-ghost"],
      },
      {
        id: "w-nb-eth",
        address: "0x71c605273f548e65f3f09800000000000000demo",
        asset: WalletAsset.ETH,
        firstSeen: "2026-01-15T12:00:00.000Z",
        lastSeen: "2026-08-25T14:00:00.000Z",
        actorIds: ["syn-nexus-broker"],
      },
      {
        id: "w-cv-1",
        address: "4synDemoMoneroAddress00000000000001",
        asset: WalletAsset.XMR,
        firstSeen: "2026-04-02T11:00:00.000Z",
        lastSeen: "2026-08-19T15:41:00.000Z",
        actorIds: ["syn-cipher-vendor"],
      },
      {
        id: "w-rm-1",
        address: "0xSYNTHETIC0000000000000000000DEAD",
        asset: WalletAsset.ETH,
        firstSeen: "2025-10-03T10:10:00.000Z",
        lastSeen: "2026-03-20T22:00:00.000Z",
        actorIds: ["syn-relay-merchant"],
      },
    ];
  
    for (const wallet of wallets) {
      await prisma.wallet.create({
        data: {
          id: wallet.id,
          address: wallet.address,
          asset: wallet.asset,
          firstSeen: date(wallet.firstSeen),
          lastSeen: date(wallet.lastSeen),
        },
      });
  
      for (const actorId of wallet.actorIds) {
        await prisma.actorWallet.create({
          data: {
            actorId,
            walletId: wallet.id,
          },
        });
      }
    }
  
    // ---------------------------------------------------------
    // MARKETPLACES
    // ---------------------------------------------------------
  
    const marketplaces = ["Demo Market Alpha", "Demo Market Beta"];
  
    for (const name of marketplaces) {
      await prisma.marketplace.create({
        data: { name },
      });
    }
  
    const marketplacePresences = [
      {
        id: "m-nb-1",
        name: "Demo Market Alpha",
        role: "Vendor",
        lastSeen: "2026-09-02T18:40:00.000Z",
        actorId: "syn-nexus-broker",
      },
      {
        id: "m-lg-1",
        name: "Demo Market Alpha",
        role: "Escrow persona",
        lastSeen: "2026-08-28T07:45:00.000Z",
        actorId: "syn-ledger-ghost",
      },
      {
        id: "m-cv-1",
        name: "Demo Market Beta",
        role: "Vendor",
        lastSeen: "2026-09-01T21:05:00.000Z",
        actorId: "syn-cipher-vendor",
      },
      {
        id: "m-rm-1",
        name: "Demo Market Beta",
        role: "Vendor",
        lastSeen: "2026-04-11T19:33:00.000Z",
        actorId: "syn-relay-merchant",
      },

    ];
  
    for (const presence of marketplacePresences) {
      const marketplace = await prisma.marketplace.findUniqueOrThrow({
        where: { name: presence.name },
      });
  
      await prisma.marketplacePresence.create({
        data: {
          id: presence.id,
          role: presence.role,
          lastSeen: date(presence.lastSeen),
          actorId: presence.actorId,
          marketplaceId: marketplace.id,
        },
      });
    }
  
    // ---------------------------------------------------------
    // FORUMS
    // ---------------------------------------------------------
  
    await prisma.forum.create({
      data: { name: "Demo Forum Helix" },
    });
  
    const forumPresences = [
      {
        id: "f-nb-1",
        lastSeen: "2026-08-21T11:16:00.000Z",
        actorId: "syn-nexus-broker",
      },
      {
        id: "f-cv-1",
        lastSeen: "2026-07-14T09:12:00.000Z",
        actorId: "syn-cipher-vendor",
      },

      {
        id: "f-ha-1",
        lastSeen: "2026-06-30T04:18:00.000Z",
        actorId: "syn-harbor-admin",
      },
    ];
  
    const helix = await prisma.forum.findUniqueOrThrow({
      where: { name: "Demo Forum Helix" },
    });
  
    for (const presence of forumPresences) {
      await prisma.forumPresence.create({
        data: {
          id: presence.id,
          lastSeen: date(presence.lastSeen),
          actorId: presence.actorId,
          forumId: helix.id,
        },
      });
    }
  
    // ---------------------------------------------------------
    // RELATED PERSONAS
    // ---------------------------------------------------------
  
    await prisma.relatedPersona.create({
      data: {
        id: "rp-nexus-ledger",
        actorId: "syn-nexus-broker",
        label: "Ledger Ghost",
        hypothesis:
          "Shared synthetic wallet may indicate vendor/escrow operational overlap.",
        confidence: 61,
      },
    });
  
    await prisma.relatedPersona.create({
      data: {
        id: "rp-ledger-nexus",
        actorId: "syn-ledger-ghost",
        label: "Nexus Broker",
        hypothesis:
          "Shared synthetic wallet may indicate vendor/escrow operational overlap.",
        confidence: 61,
      },
    });
  
    await prisma.relatedPersona.create({
      data: {
        id: "rp-relay-cipher",
        actorId: "syn-relay-merchant",
        label: "Cipher Vendor",
        hypothesis:
          "Hosting similarity is an infrastructure observation only.",
        confidence: 54,
      },
    });
  
    // ---------------------------------------------------------
    // INVESTIGATIONS
    // ---------------------------------------------------------
  
    const investigations = [
      {
        id: "inv-alpha-wallet-reuse",
        title: "Alpha wallet reuse cluster",
        status: InvestigationStatus.active,
        openedAt: "2026-07-12T08:00:00.000Z",
        updatedAt: "2026-09-03T10:15:00.000Z",
        summary:
          "Demo case examining hypothesized BTC address reuse between two synthetic personas on Demo Market Alpha.",
        hypothesis:
          "Shared synthetic wallet address may indicate a vendor/escrow operational overlap. This is an analytical hypothesis, not identification.",
        actorIds: ["syn-nexus-broker", "syn-ledger-ghost"],
      },
      {
        id: "inv-beta-infrastructure",
        title: "Beta onion and mirror overlap",
        status: InvestigationStatus.open,
        openedAt: "2026-08-01T09:30:00.000Z",
        updatedAt: "2026-09-01T21:20:00.000Z",
        summary:
          "Demo case for onion-service and clearnet-mirror indicator correlation in the synthetic corpus.",
        hypothesis:
          "Hosting-cluster similarity is an infrastructure observation only and does not confirm operator identity.",
        actorIds: ["syn-cipher-vendor", "syn-relay-merchant"],
      },
      {
        id: "inv-helix-moderation",
        title: "Helix moderator activity review",
        status: InvestigationStatus.review,
        openedAt: "2026-05-20T11:00:00.000Z",
        updatedAt: "2026-07-08T16:40:00.000Z",
        summary:
          "Low-confidence demo review of forum moderator language markers. Closed-loop analysis is not complete.",
        hypothesis:
          "Linguistic markers are insufficient for attribution in this synthetic example.",
        actorIds: ["syn-harbor-admin"],
      },
    ];
  
    for (const investigation of investigations) {
      await prisma.investigation.create({
        data: {
          id: investigation.id,
          title: investigation.title,
          status: investigation.status,
          openedAt: date(investigation.openedAt),
          updatedAt: date(investigation.updatedAt),
          summary: investigation.summary,
          hypothesis: investigation.hypothesis,
        },
      });
  
      for (const actorId of investigation.actorIds) {
        await prisma.investigationActor.create({
          data: {
            investigationId: investigation.id,
            actorId,
          },
        });
      }
    }
  
    // ---------------------------------------------------------
    // INFRASTRUCTURE
    // ---------------------------------------------------------
  
    const infrastructure = [
      {
        id: "infra-onion-alpha",
        type: InfrastructureType.onion_service,
        value: "synthetic-market-alpha.onion",
        firstSeen: "2025-11-04T09:12:00.000Z",
        lastSeen: "2026-09-02T18:40:00.000Z",
        confidence: 88,
        reliability: "Medium",
        contributionWeight: 20,
        usedFor: "Service hosting",
        serverTechnology: "nginx/1.24.0 (Alpine Linux)",
        certificateFingerprint: "SHA256:4A7F9BC19800E2",
        hostingPattern: "Njalla Privacy Proxy Cluster",
        source: "Authorized demo corpus / Market Alpha snapshot",
        note: "Placeholder onion hostname. Not a reachable service.",
        actorIds: ["syn-nexus-broker", "syn-ledger-ghost"],
        investigationIds: ["inv-alpha-wallet-reuse"],
      },
      {
        id: "infra-onion-beta",
        type: InfrastructureType.onion_service,
        value: "synthetic-market-beta.onion",
        firstSeen: "2026-03-18T13:20:00.000Z",
        lastSeen: "2026-09-01T21:05:00.000Z",
        confidence: 70,
        reliability: "High",
        contributionWeight: 20,
        usedFor: "Service hosting",
        serverTechnology: "Apache/2.4.52 (Unix)",
        certificateFingerprint: "SHA256:39B11C0288E912",
        hostingPattern: "Offshore Dedicated Host AS39482",
        source: "Authorized demo corpus / Market Beta snapshot",
        note: "Placeholder onion hostname. Not a reachable service.",
        actorIds: ["syn-cipher-vendor"],
        investigationIds: ["inv-beta-infrastructure"],
      },
      {
        id: "infra-wallet-nb",
        type: InfrastructureType.wallet,
        value: "bc1gsynnexus000000demo01",
        firstSeen: "2025-12-01T08:00:00.000Z",
        lastSeen: "2026-08-30T16:22:00.000Z",
        confidence: 91,
        reliability: "High",
        contributionWeight: 30,
        usedFor: "Relationship attribution",
        serverTechnology: "nginx/1.24.0 (Ubuntu) OpenSSL/3.0.2",
        certificateFingerprint: "SHA256:77E451BC98A10F",
        hostingPattern: "Bulletproof AS49870 (Offshore Relay Cluster)",
        source: "Synthetic payment field extraction",
        note: "Shared synthetic BTC address used to illustrate reuse analysis.",
        actorIds: ["syn-nexus-broker", "syn-ledger-ghost"],
        investigationIds: ["inv-alpha-wallet-reuse"],
        walletId: "w-nb-1",
      },
      {
        id: "infra-domain-mirror",
        type: InfrastructureType.domain,
        value: "demo-mirror-nexus.example",
        firstSeen: "2026-04-09T06:00:00.000Z",
        lastSeen: "2026-08-22T12:11:00.000Z",
        confidence: 58,
        reliability: "Low",
        contributionWeight: 10,
        usedFor: "Mirror discovery",
        serverTechnology: "Apache/2.4.52 (Unix)",
        hostingPattern: "Cloudflare Protected Mirror Node",
        source: "Synthetic mirror index",
        note: "Reserved example domain. Not collected from the live internet.",
        actorIds: ["syn-nexus-broker", "syn-ledger-ghost", "syn-cipher-vendor"],
        investigationIds: ["inv-beta-infrastructure"],
      },
      {
        id: "infra-hosting-cluster",
        type: InfrastructureType.hosting_cluster,
        value: "SYN-HOST-CLUSTER-07",
        firstSeen: "2026-01-08T16:44:00.000Z",
        lastSeen: "2026-06-30T04:18:00.000Z",
        confidence: 34,
        reliability: "Low",
        contributionWeight: 5,
        usedFor: "Hosting cluster clustering",
        source: "Synthetic infrastructure fingerprint",
        note: "Cluster label is a demo grouping, not a real ASN or provider.",
        actorIds: ["syn-harbor-admin"],
        investigationIds: ["inv-helix-moderation"],
      },
      {
        id: "infra-pgp-nexus",
        type: InfrastructureType.pgp_key,
        value: "SYNTH-4F2A-91C0-BB17-NEXUS",
        firstSeen: "2025-11-04T09:12:00.000Z",
        lastSeen: "2026-09-02T18:40:00.000Z",
        confidence: 86,
        reliability: "High",
        contributionWeight: 35,
        usedFor: "Identity correlation",
        source: "Synthetic vendor profile field",
        note: "Fingerprint is a labeled synthetic token.",
        actorIds: ["syn-nexus-broker", "syn-ledger-ghost"],
        investigationIds: ["inv-alpha-wallet-reuse"],
        pgpKeyId: "pgp-nb-1",
      },
    ];
  
    for (const item of infrastructure) {
      await prisma.infrastructureIndicator.create({
        data: {
          id: item.id,
          type: item.type,
          value: item.value,
          firstSeen: date(item.firstSeen),
          lastSeen: date(item.lastSeen),
          confidence: item.confidence,
          source: item.source,
          note: item.note,
          reliability: (item as any).reliability ?? "High",
          contributionWeight: (item as any).contributionWeight ?? 30,
          usedFor: (item as any).usedFor ?? "Relationship attribution",
          serverTechnology: (item as any).serverTechnology,
          certificateFingerprint: (item as any).certificateFingerprint,
          hostingPattern: (item as any).hostingPattern,
          provenance: "synthetic_demo",
          walletId: item.walletId,
          pgpKeyId: item.pgpKeyId,
        },
      });
  
      for (const actorId of item.actorIds) {
        await prisma.actorInfrastructure.create({
          data: {
            actorId,
            infrastructureId: item.id,
          },
        });
      }
  
      for (const investigationId of item.investigationIds) {
        await prisma.investigationInfrastructure.create({
          data: {
            investigationId,
            infrastructureId: item.id,
          },
        });
      }
    }
  
    // ---------------------------------------------------------
    // EVIDENCE
    // ---------------------------------------------------------
  
    const evidence = [
      {
        id: "evd-001",
        type: EvidenceType.wallet_reuse,
        source: "Demo Market Alpha / payment field",
        timestamp: "2026-08-28T07:45:00.000Z",
        confidence: 90,
        investigationId: "inv-alpha-wallet-reuse",
        actorIds: ["syn-nexus-broker", "syn-ledger-ghost"],
        summary:
          "Same synthetic BTC address appeared on two vendor profiles in the demo snapshot.",
      },
      {
        id: "evd-002",
        type: EvidenceType.pgp_signature,
        source: "Demo Market Alpha / signed notice",
        timestamp: "2026-09-02T18:40:00.000Z",
        confidence: 84,
        investigationId: "inv-alpha-wallet-reuse",
        actorIds: ["syn-nexus-broker"],
        summary:
          "Vendor notice in the demo corpus referenced fingerprint SYNTH-4F2A-91C0-BB17-NEXUS.",
      },
      {
        id: "evd-003",
        type: EvidenceType.listing,
        source: "Demo Market Beta / catalog extract",
        timestamp: "2026-09-01T21:05:00.000Z",
        confidence: 66,
        investigationId: "inv-beta-infrastructure",
        actorIds: ["syn-cipher-vendor"],
        summary:
          "New synthetic listing associated with cipher_vendor_syn and onion indicator synthetic-market-beta.onion.",
      },
      {
        id: "evd-004",
        type: EvidenceType.infrastructure_overlap,
        source: "Synthetic mirror index",
        timestamp: "2026-08-22T12:11:00.000Z",
        confidence: 57,
        investigationId: "inv-beta-infrastructure",
        actorIds: ["syn-cipher-vendor", "syn-relay-merchant"],
        summary:
          "Clearnet mirror demo-beta-mirror.example co-occurred with two dormant/active vendor records.",
      },
      {
        id: "evd-005",
        type: EvidenceType.linguistic_marker,
        source: "Demo Forum Helix / post extract",
        timestamp: "2026-06-30T04:18:00.000Z",
        confidence: 31,
        investigationId: "inv-helix-moderation",
        actorIds: ["syn-harbor-admin"],
        summary:
          "Repeated phrasing in moderator posts. Treated as a weak, non-identifying signal.",
      },
      {
        id: "evd-006",
        type: EvidenceType.post,
        source: "Demo Forum Helix / thread extract",
        timestamp: "2026-08-21T11:16:00.000Z",
        confidence: 52,
        investigationId: "inv-alpha-wallet-reuse",
        actorIds: ["syn-nexus-broker"],
        summary:
          "Support handle nb_support referenced a vendor dispute workflow consistent with the Alpha cluster.",
      },
    ];
  
    for (const item of evidence) {
      await prisma.evidence.create({
        data: {
          id: item.id,
          type: item.type,
          source: item.source,
          timestamp: date(item.timestamp),
          confidence: item.confidence,
          investigationId: item.investigationId,
          summary: item.summary,
          provenance: "synthetic_demo",
        },
      });
  
      for (const actorId of item.actorIds) {
        await prisma.evidenceActor.create({
          data: {
            evidenceId: item.id,
            actorId,
          },
        });
      }
    }
  
    // ---------------------------------------------------------
    // ALERTS
    // ---------------------------------------------------------
  
    const alerts = [
      {
        id: "alt-001",
        title: "High-confidence wallet reuse detected",
        severity: SeverityLevel.high,
        confidence: 91,
        timestamp: "2026-08-28T08:02:00.000Z",
        status: AlertStatus.investigating,
        investigationId: "inv-alpha-wallet-reuse",
        actorId: "syn-nexus-broker",
        summary: "Synthetic detector flagged shared BTC address across two personas.",
      },
      {
        id: "alt-002",
        title: "New listing on Demo Market Beta",
        severity: SeverityLevel.medium,
        confidence: 64,
        timestamp: "2026-09-01T21:12:00.000Z",
        status: AlertStatus.open,
        investigationId: "inv-beta-infrastructure",
        actorId: "syn-cipher-vendor",
        summary: "Fresh synthetic listing associated with Cipher Vendor.",
      },
      {
        id: "alt-003",
        title: "PGP rotation candidate",
        severity: SeverityLevel.low,
        confidence: 40,
        timestamp: "2026-07-02T12:20:00.000Z",
        status: AlertStatus.acknowledged,
        investigationId: "inv-alpha-wallet-reuse",
        actorId: "syn-ledger-ghost",
        summary:
          "Ledger Ghost PGP last-seen gap exceeded the demo rotation threshold.",
      },
      {
        id: "alt-004",
        title: "Dormant merchant inactivity window",
        severity: SeverityLevel.info,
        confidence: 60,
        timestamp: "2026-08-11T09:00:00.000Z",
        status: AlertStatus.closed,
        investigationId: "inv-beta-infrastructure",
        actorId: "syn-relay-merchant",
        summary: "Relay Merchant remained dormant beyond 90 days in the demo set.",
      },
      {
        id: "alt-005",
        title: "Low-confidence forum overlap",
        severity: SeverityLevel.low,
        confidence: 33,
        timestamp: "2026-07-08T16:44:00.000Z",
        status: AlertStatus.open,
        investigationId: "inv-helix-moderation",
        actorId: "syn-harbor-admin",
        summary: "Weak linguistic marker alert retained for analyst review.",
      },
    ];
  
    for (const alert of alerts) {
      await prisma.alert.create({
        data: {
          ...alert,
          timestamp: date(alert.timestamp),
        },
      });
    }
  
    // ---------------------------------------------------------
    // TIMELINE
    // ---------------------------------------------------------
  
    const timeline = [
      {
        id: "tl-001",
        timestamp: "2025-11-04T09:12:00.000Z",
        type: TimelineEventType.listing,
        title: "Nexus Broker first observed",
        detail: "Initial synthetic vendor profile captured on Demo Market Alpha.",
        actorId: "syn-nexus-broker",
        investigationId: "inv-alpha-wallet-reuse",
        confidence: 80,
      },
      {
        id: "tl-002",
        timestamp: "2026-02-11T10:00:00.000Z",
        type: TimelineEventType.listing,
        title: "Ledger Ghost profile appears",
        detail: "Escrow-style persona added to the Alpha demo snapshot.",
        actorId: "syn-ledger-ghost",
        investigationId: "inv-alpha-wallet-reuse",
        confidence: 62,
      },
      {
        id: "tl-003",
        timestamp: "2026-03-18T13:20:00.000Z",
        type: TimelineEventType.infrastructure_change,
        title: "Beta onion indicator registered",
        detail:
          "synthetic-market-beta.onion added as a placeholder service indicator.",
        actorId: "syn-cipher-vendor",
        investigationId: "inv-beta-infrastructure",
        confidence: 70,
      },
      {
        id: "tl-004",
        timestamp: "2026-06-30T04:18:00.000Z",
        type: TimelineEventType.forum_post,
        title: "Harbor Admin last forum activity",
        detail: "Moderator post containing repeated phrasing in the Helix extract.",
        actorId: "syn-harbor-admin",
        investigationId: "inv-helix-moderation",
        confidence: 31,
      },
      {
        id: "tl-005",
        timestamp: "2026-07-02T12:00:00.000Z",
        type: TimelineEventType.pgp_rotation,
        title: "Ledger Ghost PGP last seen",
        detail:
          "No later signed material in the demo corpus after this timestamp.",
        actorId: "syn-ledger-ghost",
        investigationId: "inv-alpha-wallet-reuse",
        confidence: 40,
      },
      {
        id: "tl-006",
        timestamp: "2026-08-22T12:11:00.000Z",
        type: TimelineEventType.infrastructure_change,
        title: "Beta mirror last seen",
        detail: "demo-beta-mirror.example appeared in the synthetic mirror index.",
        actorId: "syn-cipher-vendor",
        investigationId: "inv-beta-infrastructure",
        confidence: 58,
      },
      {
        id: "tl-007",
        timestamp: "2026-08-28T07:45:00.000Z",
        type: TimelineEventType.wallet_activity,
        title: "Shared wallet observed again",
        detail: "Synthetic BTC address reuse between Nexus Broker and Ledger Ghost.",
        actorId: "syn-ledger-ghost",
        investigationId: "inv-alpha-wallet-reuse",
        confidence: 91,
      },
      {
        id: "tl-008",
        timestamp: "2026-08-28T08:02:00.000Z",
        type: TimelineEventType.alert,
        title: "Wallet reuse alert opened",
        detail: "Case inv-alpha-wallet-reuse moved to investigating.",
        actorId: "syn-nexus-broker",
        investigationId: "inv-alpha-wallet-reuse",
        confidence: 91,
      },
      {
        id: "tl-009",
        timestamp: "2026-09-01T21:05:00.000Z",
        type: TimelineEventType.listing,
        title: "Cipher Vendor listing update",
        detail: "Catalog extract recorded a new synthetic listing.",
        actorId: "syn-cipher-vendor",
        investigationId: "inv-beta-infrastructure",
        confidence: 66,
      },
      {
        id: "tl-010",
        timestamp: "2026-09-02T18:40:00.000Z",
        type: TimelineEventType.pgp_rotation,
        title: "Nexus Broker signed notice",
        detail: "Latest signed vendor notice in the Alpha demo snapshot.",
        actorId: "syn-nexus-broker",
        investigationId: "inv-alpha-wallet-reuse",
        confidence: 84,
      },
    ];
  
    for (const event of timeline) {
      await prisma.timelineEvent.create({
        data: {
          ...event,
          timestamp: date(event.timestamp),
        },
      });
    }
  
    // ---------------------------------------------------------
    // ACTOR RELATIONSHIPS
    // ---------------------------------------------------------
  
  
    console.log("✅ Synthetic database seed completed successfully.");

    await generateRelationships();
  }
  
  main()
    .catch((error) => {
      console.error("❌ Seed failed:");
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });