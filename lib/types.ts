export type ConfidenceLevel = "low" | "medium" | "high";
export type SeverityLevel = "info" | "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "acknowledged" | "investigating" | "closed";
export type InvestigationStatus = "open" | "active" | "review" | "closed";
export type IndicatorType =
  | "actor"
  | "handle"
  | "pgp_key"
  | "wallet"
  | "onion_service"
  | "domain";
export type InfrastructureType =
  | "onion_service"
  | "domain"
  | "wallet"
  | "pgp_key"
  | "hosting_cluster";
export type EvidenceType =
  | "post"
  | "listing"
  | "pgp_signature"
  | "wallet_reuse"
  | "infrastructure_overlap"
  | "linguistic_marker";
export type TimelineEventType =
  | "listing"
  | "forum_post"
  | "pgp_rotation"
  | "wallet_activity"
  | "infrastructure_change"
  | "alert";

export type DataProvenance = "synthetic_demo";

export interface ConfidenceAssessment {
  level: ConfidenceLevel;
  score: number;
}

export interface ActorHandle {
  id: string;
  value: string;
  platform: string;
  firstSeen: string;
  lastSeen: string;
}

export interface PgpKeyRecord {
  id: string;
  fingerprint: string;
  associatedHandle: string;
  firstSeen: string;
  lastSeen: string;
}

export interface WalletRecord {
  id: string;
  address: string;
  asset: "BTC" | "XMR" | "ETH";
  firstSeen: string;
  lastSeen: string;
}

export interface MarketplacePresence {
  id: string;
  name: string;
  role: string;
  lastSeen: string;
}

export interface ForumPresence {
  id: string;
  name: string;
  lastSeen: string;
}

export interface RelatedPersona {
  id: string;
  actorId: string;
  label: string;
  hypothesis: string;
  confidence: ConfidenceAssessment;
}

export interface ActorRecord {
  id: string;
  name: string;
  aliases: string[];
  status: "monitored" | "active" | "dormant";
  attributionConfidence: ConfidenceAssessment;
  lastSeen: string;
  firstSeen: string;
  summary: string;
  category?: string;
  riskLevel?: SeverityLevel;
  lastScanDate?: string;
  observedActivities?: string[];
  sourceTelemetry?: Array<{ source: string; reliability: "HIGH" | "MEDIUM" | "LOW" }>;
  confidenceBreakdown?: Array<{ label: string; score: number; color?: string }>;
  relationshipSummary?: {
    connectedPersonas: number;
    strongestRelationship: {
      name: string;
      id: string;
      confidence: number;
      sharedEvidence: string[];
    } | null;
  };
  handles: ActorHandle[];
  pgpKeys: PgpKeyRecord[];
  wallets: WalletRecord[];
  marketplaces: MarketplacePresence[];
  forums: ForumPresence[];
  emails?: Array<{
    id: string;
    address: string;
    provider?: string;
    context?: string;
    firstSeen: string;
    lastSeen: string;
  }>;
  relatedPersonaIds: string[];
  infrastructureIds: string[];
  provenance: DataProvenance;
}

export interface InvestigationRecord {
  id: string;
  title: string;
  status: InvestigationStatus;
  actorIds: string[];
  openedAt: string;
  updatedAt: string;
  summary: string;
  hypothesis: string;
}

export interface InfrastructureIndicator {
  id: string;
  type: InfrastructureType;
  value: string;
  firstSeen: string;
  lastSeen: string;
  confidence: ConfidenceAssessment;
  source: string;
  associatedActorIds: string[];
  investigationIds: string[];
  note: string;
  reliability?: string;
  contributionWeight?: number;
  usedFor?: string;
  serverTechnology?: string;
  certificateFingerprint?: string;
  hostingPattern?: string;
  provenance: DataProvenance;
}

export interface EvidenceRecord {
  id: string;
  type: EvidenceType;
  source: string;
  timestamp: string;
  confidence: ConfidenceAssessment;
  investigationId: string;
  actorIds: string[];
  summary: string;
  provenance: DataProvenance;
}

export interface AlertRecord {
  id: string;
  title: string;
  severity: SeverityLevel;
  confidence: ConfidenceAssessment;
  timestamp: string;
  status: AlertStatus;
  investigationId: string | null;
  actorId: string | null;
  summary: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: TimelineEventType;
  title: string;
  detail: string;
  actorId: string | null;
  investigationId: string | null;
  confidence: ConfidenceAssessment;
}

export interface DashboardStats {
  totalActors: number;
  activeInvestigations: number;
  highConfidenceRelationships: number;
  infrastructureIndicators: number;
}

export interface SearchHit {
  id: string;
  type: IndicatorType;
  label: string;
  value: string;
  actorId: string | null;
  investigationId: string | null;
  confidence: ConfidenceAssessment;
  context: string;
}
