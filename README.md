# Dark Web Threat Actor De-Anonymization using Explainable Cyber Threat Intelligence

Official technical documentation and system reference for the Cyber Threat Intelligence (CTI) Platform developed for Smart India Hackathon 2026.

---

# Project Overview

The Dark Web Threat Actor De-Anonymization platform is a specialized cyber threat intelligence tool designed to assist security analysts and law enforcement investigators in correlating fragmented online personas across synthetic dark web environments.

Threat actors operating on forums, illicit marketplaces, and Tor hidden services routinely generate distinct accounts and handles across different platforms to conceal their operations. However, operational habits—such as reusing PGP public keys, sharing cryptocurrency wallet addresses for escrow or settlement, deploying infrastructure on overlapping hosting blocks, or maintaining consistent naming patterns—leave technical traces across platforms.

Currently, identifying whether two separate personas belong to the same underlying operator requires investigators to manually extract, cross-reference, and compare indicators across disparate logs, blockchain records, and message archives. This manual correlation is slow, prone to oversight, and lacks standardized scoring to justify attribution decisions to judicial bodies or senior intelligence personnel.

This platform replaces manual indicator tracking with a centralized system that:
- Indexes threat actors, pseudonyms, handles, cryptographic keys, cryptocurrency addresses, and infrastructure telemetry.
- Evaluates technical overlaps using an explainable, deterministic scoring model.
- Visualizes correlation hypotheses through interactive network and infrastructure graphs.
- Produces structured evidence dossiers and audit-ready intelligence summaries.

---

# Problem Statement

Investigating dark web threat actors presents specific operational challenges:

1. **Indicator Fragmentation**: Threat actors operate across decentralized and independent platforms (forums, marketplaces, instant messaging channels, and private services) without persistent unified identity registries.
2. **High Latency in Manual Cross-Referencing**: Investigators manually compare cryptographic fingerprints, wallet transactions, server technologies, and registration timestamps. A cross-correlation between dozens of personas across multiple months of activity requires significant analyst hours.
3. **Black-Box Scoring and Legal Scrutiny**: Automated attribution tools that use uninterpretable machine learning models produce attribution percentages without exposing the underlying logic. In legal and forensic proceedings, an unexplainable confidence score cannot be validated or presented as credible evidence.
4. **Complexity of Multi-Entity Networks**: Correlating direct actor-to-actor links is insufficient when actors are connected indirectly through intermediary infrastructure clusters, shared mirrors, or multi-party payment escrows.

---

# Proposed Solution

The application implements a deterministic investigation workflow:

```
[Threat Actor / Persona Index]
               │
               ▼
   [Indicator Collection]
   (PGP, Wallets, Handles, Onion Services, Domains)
               │
               ▼
   [Indicator Comparison Engine]
   (Deterministic Multi-Factor Weight Matrix)
               │
               ▼
   [Evidence Contribution Calculation]
   (Verifiable Weight + Source Reliability)
               │
               ▼
   [Explainable Confidence Score]
   (Final Attribution % with Transparent Breakdown)
               │
               ▼
   [Visualization & Analysis]
   (Actor Graph + Bipartite Infrastructure Graph)
               │
               ▼
   [Intelligence Reporting]
   (Dossiers, Timelines, Audit Logs, Case Summaries)
```

1. **Analyst Selection**: The analyst selects threat actors or enters arbitrary technical indicators (PGP fingerprint, BTC/ETH address, onion domain, handle).
2. **Identifier Collection**: The application queries the database for all related handles, public keys, cryptocurrency wallets, forums, and infrastructure records tied to the subjects.
3. **Indicator Comparison**: Observable parameters are evaluated against known personas and infrastructure links.
4. **Evidence Contribution Calculation**: Each matching parameter is assigned an explicit weight based on identifier durability and source reliability.
5. **Confidence Display**: The resulting relationship score is presented with an itemized breakdown showing exactly how each indicator contributed to the total score.
6. **Graph Visualization**: Entity-relationship graphs render actor links and bipartite actor-infrastructure graphs for cluster exploration.
7. **Reporting**: Case reports summarize the hypothesis, subject actors, supporting evidence, and confidence totals for export.

---

# System Architecture

The platform is architected as a modular web application with a Next.js server runtime, client-side rendering components for visualizers, and a PostgreSQL database accessed via Prisma ORM.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Browser)"]
        UI["React 19 Server & Client Components"]
        Tailwind["Tailwind CSS (Enterprise Theme)"]
        Cyto["Cytoscape.js Network Engine"]
    end

    subgraph Server["Application Server (Next.js / Node.js Runtime)"]
        Routes["App Router Pages (Server Rendered)"]
        API["REST Route Handlers (/api/*)"]
        Queries["Database Query Layer (lib/db/queries.ts)"]
        Engine["Attribution & Scoring Logic"]
    end

    subgraph DataTier["Data Tier"]
        Prisma["Prisma ORM Client"]
        Postgres[(PostgreSQL Database)]
    end

    Client -->|HTTP / JSON Requests| Routes
    Client -->|API Calls (Search, Graph, Export)| API
    Routes --> Queries
    API --> Queries
    Queries --> Engine
    Queries --> Prisma
    Prisma -->|SQL via Connection Pool| Postgres
```

### Data Flow

1. **User Action / Search**: The client browser issues a request either via page navigation or through API endpoints (`/api/investigation/search`, `/api/intelligence/relationships`, `/api/export/*`).
2. **Server Processing**: Next.js route handlers validate incoming query parameters and invoke database access functions in `lib/db/queries.ts`.
3. **Database Access**: Prisma ORM executes typed queries against PostgreSQL to retrieve actor profiles, relationship graphs, evidence contributions, and infrastructure telemetry.
4. **Scoring & Correlation**: If calculating overlap or relationship metrics, the system calculates score contributions based on pre-defined weight matrices and source reliability tiers.
5. **Client Rendering**: Results are returned as typed JSON or pre-rendered HTML. Interactive network views are rendered on the client canvas via Cytoscape.js.

---

# Technology Stack

| Technology | Role in Project |
| :--- | :--- |
| **Next.js 16.3.4 (Turbopack)** | Full-stack framework providing App Router, server-rendered pages, API route handlers, and production asset optimization. |
| **React 19** | Component-based user interface library managing client state, tab navigation, and modal drawers. |
| **TypeScript** | Static typing across data models, API contracts, queries, and UI components to prevent runtime errors. |
| **Node.js** | Server-side execution runtime handling API requests, database connections, and data aggregation. |
| **Prisma ORM** | Schema definition, database migrations, connection pooling, and type-safe query generation for PostgreSQL. |
| **PostgreSQL** | Relational database storing actors, aliases, handles, PGP keys, wallets, infrastructure indicators, evidence, alerts, and investigations. |
| **Tailwind CSS v4** | Utility-first styling framework configured for high-contrast, information-dense enterprise analyst interfaces. |
| **Cytoscape.js (`react-cytoscapejs`)** | Graph theory library used to render interactive actor relationship networks and bipartite infrastructure graphs. |

---

# Application Modules

The application is structured into nine specialized functional views accessible from the primary sidebar:

```
┌────────────────────────────────────────────────────────┐
│                      NAVBAR                            │
├──────────────┬─────────────────────────────────────────┤
│              │                                         │
│   SIDEBAR    │            MAIN CONTENT AREA            │
│              │                                         │
│ • Dashboard  │  [Page Header]                          │
│ • Actors     │                                         │
│ • Investigate│  [Filter Controls & Search]             │
│ • Graph      │                                         │
│ • Timeline   │  [Data Tables / Metrics / Visualizers]  │
│ • Infras.    │                                         │
│ • Evidence   │                                         │
│ • Alerts     │                                         │
│ • Reports    │                                         │
└──────────────┴─────────────────────────────────────────┘
```

---

## Dashboard

[Dashboard Screenshot]

- **Purpose**: Provides operational situational awareness across all monitored synthetic personas, open cases, and high-severity indicators.
- **Functionality**: Summarizes high-level counts, categorizes personas by attribution confidence, and lists recent system alerts.
- **Data Displayed**:
  - Key Performance Indicators: Total Actors, Active Investigations, Monitored Indicators, Critical Alerts.
  - Attribution Confidence Distribution: High, Medium, and Low confidence breakdown.
  - Recent Alerts Table: Timestamp, alert title, severity badge, confidence percentage, and assigned persona.

---

## Actors

- **Purpose**: Central catalog of all threat actors and clustered personas recorded in the database.
- **Functionality**: Full-text searching across names, aliases, and platforms; filtering by operational status (Active, Monitored, Dormant) and confidence level.
- **Data Displayed**:
  - Actor identity and internal identifier.
  - Operational status badge.
  - Attribution confidence badge (High / Medium / Low).
  - Last observed timestamp.
  - Associated dark web marketplaces.
  - Related hypothesized personas with direct profile links.

---

## Investigation

- **Purpose**: Pivot search engine allowing analysts to input any arbitrary technical indicator and retrieve matching personas, linked infrastructure, and explainable relationship links.
- **Functionality**: Single-field indicator investigation; type-based filtering; deterministic multi-factor relationship scoring; direct case correlation.
- **Data Displayed**:
  - Matched Personas with confidence levels and status.
  - Interactive relationship graph for discovered actors.
  - **Relationship Analysis & Explainable Attribution** panel displaying:
    - Persona A ↔ Persona B pairing.
    - Final confidence score and visual progress bar.
    - Itemized evidence contributions (e.g., PGP Key Match, Wallet Match, Alias Similarity, Infrastructure Overlap) with individual score contributions and source reliability tags.
  - Correlated Cryptocurrency Wallets table.
  - Correlated Infrastructure table.
  - Raw indicator hits table with source context.

---

## Graph

[Graph Screenshot]

- **Purpose**: Visual network analysis for uncovering indirect relationships and shared infrastructure dependencies.
- **Functionality**:
  - Switch between two distinct analytical graph modes:
    1. **Actor Relationships Graph**: Displays peer-to-peer attribution links between personas.
    2. **Bipartite Infrastructure Graph**: Displays actors connected to shared infrastructure indicators (Wallets, Onion services, Domains, PGP keys).
  - Interactive tap-to-inspect on any node to view entity attributes and connected relationships.
- **Data Displayed**:
  - Color-coded nodes: Blue (Threat Actors), Orange (Wallets), Purple (Onion Services & Domains), Green (PGP Keys).
  - Labeled edges displaying relationship type and confidence rating.
  - Side inspector panel showing detailed metadata for the selected entity.

---

## Timeline

- **Purpose**: Chronological reconstruction of threat actor activities and system-detected events.
- **Functionality**: Date-range filtering (UTC from/to) and event-type filtering (listing, forum post, PGP rotation, wallet activity, infrastructure change, alert).
- **Data Displayed**:
  - Vertical timeline sequence.
  - Event title, detailed observation text, and confidence badge.
  - Event timestamp, associated actor link, and linked investigation case reference.

---

## Infrastructure

- **Purpose**: Correlation tool focused specifically on technical hosting, network services, domain mirrors, and payment endpoints.
- **Functionality**:
  - **Infrastructure Overlap Analysis**: Interactive comparison tool allowing an analyst to select Actor A and Actor B and compute shared infrastructure overlap.
  - **Technical Dossier Drawer**: Clicking any indicator opens a detailed modal drawer displaying deep technical attributes.
  - Direct navigation link to the Bipartite Infrastructure Graph.
- **Data Displayed**:
  - Overlap Analysis results: Correlation score, list of matched infrastructure with evidence strength ratings, confidence impact per item, and an analytical summary explaining the overlap.
  - Filterable indicators table: Type, indicator value, first/last seen timestamps, confidence score, source, and associated persona links.
  - Dossier attributes: Server technology, certificate fingerprint, hosting pattern, contribution weight, and analyst notes.

---

## Evidence

- **Purpose**: Formal evidentiary locker holding individual technical artifacts tied to open cases.
- **Functionality**: Query by keyword; filter by evidence type (post, listing, PGP signature, wallet reuse, infrastructure overlap, linguistic marker).
- **Data Displayed**:
  - Evidence type.
  - Source location and summary of findings.
  - Timestamp of capture.
  - Evidentiary confidence score.
  - Linked investigation report.

---

## Alerts

- **Purpose**: Operational queue of automated detection rules triggered against the dataset.
- **Functionality**: Filter by severity level (Critical, High, Medium, Low, Info) and alert status (Open, Acknowledged, Investigating, Closed).
- **Data Displayed**:
  - Detection timestamp.
  - Alert title and explanatory summary.
  - Severity badge and confidence score.
  - Workflow status.
  - Subject threat actor.

---

## Reports

- **Purpose**: Generates investigation briefs summarizing case conclusions, actor attributions, and evidence trails for analyst review.
- **Functionality**: Select investigation case from dropdown; inspect executive summary and working hypothesis; review attribution verdicts; export data (PDF, JSON, CSV).
- **Data Displayed**:
  - Case metadata: Status, open date, last updated date, working hypothesis, and attribution caveat.
  - **Relationship Conclusion & Explainable Attribution** card stating the final attribution verdict between primary subjects.
  - Supporting Evidence Checklist with weight tallies.
  - Subject Actors table.
  - Supporting Evidence table.

---

# Actor Profile Documentation

[Actor Profile Screenshot]

The Actor Profile page (`/actors/[id]`) provides a CTI dossier organized into five investigation tabs:

## Overview Tab

Displays high-level intelligence assessments:
- **Attribution Confidence Card**: Numerical confidence percentage, deterministic scoring badge, and visual contribution breakdown bars (PGP Key Match, Wallet Reuse, Alias Similarity, Infrastructure Overlap).
- **Threat Classification Card**: Primary threat category (e.g., Marketplace Vendor), Risk Level badge (Critical, High, Medium, Low), and tags for observed illicit activities (e.g., Data Trading, Credential Selling).
- **Source Intelligence Card**: Last scan timestamp, list of ingestion sources (Marketplace Intelligence, Forum Observation, Infrastructure Data) with source reliability ratings (High, Medium, Low).
- **Relationship Summary Card**: Count of connected personas, strongest relationship link (e.g., Ledger Ghost at 88%), and a verified shared evidence checklist.
- **Associated Platforms**: Tables listing associated dark web marketplaces and forums with roles and observation windows.
- **Related Personas**: Hypothesized cluster linkages with attribution confidence badges.

## Identifiers Tab

Surfaces durable identifiers:
- **PGP Keys Card**: Displays cryptographic fingerprints (`SYNTH-4F2A-91C0-BB17-NEXUS`), first observed dates, and functional usage (e.g., Marketplace Signing). Includes a technical note detailing why PGP keys are high-durability attribution markers.
- **Wallet Addresses Card**: Lists monitored cryptocurrency addresses categorized by asset (Bitcoin `BTC`, Ethereum `ETH`), observation window, and observed context (e.g., Escrow settlement).
- **Known Aliases Card**: Displays primary alias alongside secondary aliases tracked across platforms.
- **Handles & Identities Table**: Tabulates platform-specific handles alongside observation windows (e.g., `Jan 2026 - Sept 2026`).

## Evidence Tab

Presents all specific evidence records tied directly to the subject actor:
- Categorized by evidence type (`pgp_signature`, `wallet_reuse`, `infrastructure_overlap`, `listing`).
- Summary of technical observations.
- Timestamp of initial observation.
- Evidence confidence score.

---

# Explainable Confidence Scoring

### The Attribution Problem

Many automated attribution systems output an arbitrary similarity percentage (e.g., `Actor A ↔ Actor B: 88%`) without exposing how that figure was derived. In criminal intelligence and cybersecurity forensics, unexplained scores cannot be verified or used as evidentiary findings.

### The Implemented Scoring Engine

The platform calculates relationship confidence strictly from observable, weighted evidence contributions. The score is deterministic:

$$\text{Confidence Score} = \min\left(100, \sum_{i=1}^{n} \text{Weight}_i\right)$$

Where each $\text{Weight}_i$ is calibrated by indicator durability and source reliability:

| Evidence Type | Maximum Weight | Reliability Level | Indicator Durability Rationale |
| :--- | :---: | :---: | :--- |
| **PGP Key Match** | `40%` | VERY HIGH | Cryptographic private keys cannot be duplicated without key compromise or deliberate operator sharing. |
| **Wallet Match** | `35%` | VERY HIGH | Direct on-chain reuse of a deposit/escrow address indicates shared financial custody. |
| **Alias Similarity** | `10%` | MEDIUM | Co-occurring handle variations or unique naming patterns provide corroborative, but non-cryptographic, context. |
| **Infrastructure Overlap** | `3%` | LOW | Colocation on the same hosting cluster or mirror network indicates operational proximity or shared hosting services. |

### Concrete Production Example

For the relationship link between **Nexus Broker** and **Ledger Ghost**:

```
Relationship: Nexus Broker ↔ Ledger Ghost
Calculated Attribution Confidence: 88%
Scoring Methodology: Multi-Factor Deterministic Attribution Weight Matrix
```

**Contribution Breakdown**:
1. **PGP Key Match** (`SYNTH-4F2A-91C0-BB17-NEXUS`):
   - Contribution: `+40%`
   - Reliability: `VERY HIGH`
   - Usage: Marketplace signing key reuse across separate vendor handles.
2. **Wallet Match** (`bc1gsynnexus000000demo01`):
   - Contribution: `+35%`
   - Reliability: `VERY HIGH`
   - Usage: Shared Bitcoin escrow settlement address.
3. **Alias Similarity** (`NB Cluster & ledger_nex`):
   - Contribution: `+10%`
   - Reliability: `MEDIUM`
   - Usage: Co-occurring forum handle naming convention.
4. **Infrastructure Overlap** (`synthetic-market-alpha.onion`):
   - Contribution: `+3%`
   - Reliability: `LOW`
   - Usage: Overlapping onion service hosting block.

$$\text{Final Score} = 40\% + 35\% + 10\% + 3\% = 88\%$$

The system provides the contribution of each indicator instead of producing an unexplained score. Analysts can inspect each line item, verify the underlying raw value, and validate the provenance of the data.

---

# Database Design

The database schema is defined in `prisma/schema.prisma` and deployed on PostgreSQL.

### Core Models

#### `Actor`
- **Purpose**: Represents a distinct threat actor persona or cluster.
- **Important Fields**: `id`, `name`, `status` (active/monitored/dormant), `attributionConfidence` (integer 0-100), `summary`, `category`, `riskLevel`, `lastScanDate`, `observedActivities` (string array), `sourceTelemetry` (JSON).
- **Relationships**: Has many `ActorAlias`, `ActorHandle`, `PgpKey`, `ActorWallet`, `MarketplacePresence`, `ForumPresence`, `ActorRelationship`, `ActorInfrastructure`, `Alert`, and `TimelineEvent`.

#### `ActorAlias`
- **Purpose**: Alternate names or pseudonyms used by a threat actor.
- **Important Fields**: `id`, `value`, `actorId`.
- **Relationships**: Belongs to `Actor`.

#### `ActorHandle`
- **Purpose**: Platform-specific usernames observed on forums and marketplaces.
- **Important Fields**: `id`, `value`, `platform`, `firstSeen`, `lastSeen`, `actorId`.
- **Relationships**: Belongs to `Actor`.

#### `PgpKey`
- **Purpose**: Public PGP keys and fingerprints observed in dark web listings or forum signatures.
- **Important Fields**: `id`, `fingerprint`, `associatedHandle`, `firstSeen`, `lastSeen`, `actorId`.
- **Relationships**: Belongs to `Actor`; can link to `InfrastructureIndicator`.

#### `Wallet` & `ActorWallet`
- **Purpose**: Tracks cryptocurrency addresses and handles many-to-many actor wallet reuse.
- **Important Fields**: `id`, `address` (unique index), `asset` (BTC, XMR, ETH), `firstSeen`, `lastSeen`.
- **Relationships**: `ActorWallet` provides the join table linking `Actor` and `Wallet`.

#### `Marketplace` & `MarketplacePresence`
- **Purpose**: Tracks illicit marketplaces and threat actor vendor presence.
- **Important Fields**: `name` (unique), `role` (vendor/buyer/admin), `lastSeen`.
- **Relationships**: `MarketplacePresence` joins `Actor` and `Marketplace`.

#### `Forum` & `ForumPresence`
- **Purpose**: Dark web forums where personas participate in discussions or illicit trade.
- **Important Fields**: `name` (unique), `lastSeen`.
- **Relationships**: `ForumPresence` joins `Actor` and `Forum`.

#### `ActorRelationship`
- **Purpose**: Stores attributed relationships and hypothesis links between pairs of actors.
- **Important Fields**: `fromActorId`, `toActorId`, `type` (enum), `confidence` (0-100), `hypothesis`, `provenance`.
- **Relationships**: Links `fromActor` and `toActor`; has many `EvidenceContribution`.

#### `EvidenceContribution`
- **Purpose**: Stores the specific weighted factors that justify an `ActorRelationship` confidence score.
- **Important Fields**: `relationshipId`, `evidenceType` (PGP_KEY, WALLET, ALIAS, INFRASTRUCTURE, MESSAGE_PATTERN), `description`, `weight` (integer impact), `reliability` (LOW, MEDIUM, HIGH, VERY_HIGH).
- **Relationships**: Belongs to `ActorRelationship`.

#### `InfrastructureIndicator` & `ActorInfrastructure`
- **Purpose**: Network and hosting artifacts (onion addresses, clearnet mirrors, IP clusters, SSL cert fingerprints).
- **Important Fields**: `type` (onion_service, domain, wallet, pgp_key, hosting_cluster), `value`, `confidence`, `source`, `reliability`, `contributionWeight`, `serverTechnology`, `certificateFingerprint`, `hostingPattern`.
- **Relationships**: `ActorInfrastructure` joins `Actor` and `InfrastructureIndicator`.

#### `Evidence` & `EvidenceActor`
- **Purpose**: Individual evidence records supporting an ongoing investigation.
- **Important Fields**: `type`, `source`, `timestamp`, `confidence`, `summary`, `investigationId`.
- **Relationships**: Belongs to `Investigation`; links to actors via `EvidenceActor`.

#### `Investigation` & `InvestigationActor`
- **Purpose**: Case dossier grouping actors, evidence, and alerts under an investigation hypothesis.
- **Important Fields**: `id`, `title`, `status` (open, active, review, closed), `openedAt`, `updatedAt`, `summary`, `hypothesis`.
- **Relationships**: Many-to-many with `Actor` via `InvestigationActor`; has many `Evidence`, `Alert`, `TimelineEvent`.

#### `Alert`
- **Purpose**: Automated anomaly and correlation alerts generated by detection rules.
- **Important Fields**: `title`, `severity` (info, low, medium, high, critical), `confidence`, `status`, `summary`, `timestamp`, `actorId`, `investigationId`.
- **Relationships**: Optionally belongs to `Actor` and `Investigation`.

#### `TimelineEvent`
- **Purpose**: Structured chronological activity entries.
- **Important Fields**: `timestamp`, `type`, `title`, `detail`, `confidence`, `actorId`, `investigationId`.
- **Relationships**: Belongs optionally to `Actor` and `Investigation`.

---

# User Workflow

A complete end-to-end analyst investigation proceeds through the following steps:

```
Step 1: Review Dashboard Metrics
   │
   ▼
Step 2: Pivot Search via Indicator (Investigation Page)
   │
   ▼
Step 3: Analyze Attribution Breakdown & Evidence Weights
   │
   ▼
Step 4: Inspect Actor Profile & Deep Technical Identifiers
   │
   ▼
Step 5: Run Infrastructure Overlap Analysis
   │
   ▼
Step 6: Explore Network & Bipartite Graph
   │
   ▼
Step 7: Verify Event Sequence in Timeline
   │
   ▼
Step 8: Review Investigation Report & Export Case Findings
```

### Step 1: Operations Review
The analyst opens the application (`/dashboard`) to check recent high-severity alerts, active investigation cases, and overall persona clustering statistics.

### Step 2: Indicator Investigation
The analyst navigates to `/investigation` and enters a known indicator (for example, the PGP fingerprint `SYNTH-4F2A-91C0-BB17-NEXUS` or handle `nexus_broker_syn`). The system queries the database and identifies matching personas.

### Step 3: Attribution Breakdown Evaluation
The analyst reviews the **Relationship Analysis & Explainable Attribution** card. The system reveals that `Nexus Broker` is linked to `Ledger Ghost` with 88% confidence. The analyst verifies the individual contributions: PGP key (+40%), wallet reuse (+35%), alias similarity (+10%), and infrastructure overlap (+3%).

### Step 4: Actor Dossier Inspection
The analyst clicks **View actor** to navigate to `/actors/syn-nexus-broker`. On the **Overview Tab**, the analyst reviews threat category, risk level, and source intelligence reliability. Switching to the **Identifiers Tab**, the analyst confirms the raw PGP key usage, Bitcoin escrow address, and platform handles.

### Step 5: Infrastructure Overlap Verification
The analyst opens `/infrastructure` and runs the **Analyze Infrastructure Overlap** module by selecting `Nexus Broker` as Actor A and `Ledger Ghost` as Actor B. The tool isolates shared hosting clusters, payment endpoints, and mirror domains, outputting a 60% infrastructure-specific link with technical details.

### Step 6: Interactive Network Exploration
The analyst clicks **View Infrastructure Graph** or navigates to `/graph`. Switching to the **Infrastructure Graph** mode, the analyst visualizes how both actors connect directly to the shared onion service and Bitcoin wallet nodes, verifying that the link is not an isolated single-point correlation.

### Step 7: Timeline Reconstruction
The analyst navigates to `/timeline` and sets a date window to observe the temporal sequence: when the initial vendor account was registered, when the PGP key was rotated, and when the Bitcoin escrow transaction took place.

### Step 8: Case Review and Export
The analyst navigates to `/reports` and selects the relevant investigation case. The generated brief displays the executive summary, working hypothesis, subject actor records, supporting evidence, and attribution verdict. The analyst exports the brief via PDF, JSON, or CSV for archive or handoff.

---

# Installation and Setup

### Prerequisites

- **Node.js**: Version `18.18.0` or higher (`node -v`)
- **PostgreSQL**: Version `14.0` or higher (`psql --version`)
- **npm** or compatible package manager

### Environment Configuration

Create a `.env` file in the project root directory specifying the database connection string:

```env
# PostgreSQL database connection URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/darkweb_intel?schema=public"
```

### Setup Commands

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Run Database Migrations**:
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed Database with Synthetic Intelligence Corpus**:
   ```bash
   npx prisma db seed
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```

   The application will be accessible at `http://localhost:3000`.

6. **Production Build & Verification**:
   ```bash
   npm run build
   npm run start
   ```

---

# Project Structure

```
darkweb-intelligence/
├── app/                              # Next.js App Router root
│   ├── (console)/                    # Authenticated/console layout group
│   │   ├── actors/                   # Threat actor directory & profile pages
│   │   │   ├── [id]/page.tsx         # Individual actor profile dossier
│   │   │   └── page.tsx              # Actor directory table
│   │   ├── alerts/page.tsx           # Alert operations queue
│   │   ├── dashboard/page.tsx        # Operations dashboard
│   │   ├── evidence/page.tsx         # Evidentiary artifact locker
│   │   ├── graph/page.tsx            # Interactive relationship & infra graph
│   │   ├── infrastructure/page.tsx   # Infrastructure indicators & overlap tool
│   │   ├── investigation/page.tsx    # Pivot indicator search & scoring
│   │   ├── reports/page.tsx          # Investigation case briefs & export
│   │   └── timeline/page.tsx         # Chronological event timeline
│   ├── api/                          # REST route handlers
│   │   ├── export/                   # Document & data export (PDF/JSON/CSV)
│   │   ├── intelligence/             # Intelligence relationship query API
│   │   └── investigation/search/     # Pivot indicator search endpoint
│   ├── globals.css                   # Global CSS & Tailwind imports
│   └── layout.tsx                    # Root HTML layout with metadata
├── components/                       # Modular React UI components
│   ├── actors/                       # Actor profile & explorer components
│   ├── alerts/                       # Alert queue explorer
│   ├── dashboard/                    # Dashboard cards & metric charts
│   ├── evidence/                     # Evidence locker components
│   ├── graph/                        # Cytoscape graph visualizer & inspector
│   ├── infrastructure/               # Overlap analysis & technical dossier modal
│   ├── investigation/                # Search forms, graph, & contribution cards
│   ├── layout/                       # AppShell, Sidebar, Header
│   ├── reports/                      # Report console & case summaries
│   ├── timeline/                     # Vertical timeline components
│   └── ui/                           # Reusable UI primitives (Card, Table, Badge, Form)
├── lib/                              # Core logic, types, and constants
│   ├── cn.ts                         # Class merging and confidence color mappers
│   ├── constants.ts                  # Application metadata & caveats
│   ├── data/                         # Synthetic seed data catalog & in-memory queries
│   ├── db/                           # Prisma client singleton & typed database queries
│   ├── format.ts                     # Timestamp and string formatting helpers
│   ├── navigation.ts                 # Sidebar navigation schema
│   └── types.ts                      # Shared TypeScript interfaces & types
├── prisma/                           # Database layer
│   ├── schema.prisma                 # Prisma schema definition
│   └── seed.ts                       # Database seeding script with synthetic corpus
├── public/                           # Static assets
├── package.json                      # Project dependencies and run scripts
├── tsconfig.json                     # TypeScript compiler configuration
└── next.config.ts                    # Next.js build configuration
```

---

# Testing and Verification

The codebase includes verification checks to validate runtime correctness, routing, and data integrity:

### 1. Build Verification
Production compilation is verified through Next.js Turbopack:
```bash
npm run build
```
- Validates all 18 static and dynamic routes.
- Confirms zero TypeScript type errors.
- Validates CSS compilation across all components.

### 2. Route & Endpoint Verification
All application pages and API endpoints are verified for standard status responses:
- UI Pages: `/dashboard`, `/actors`, `/actors/[id]`, `/investigation`, `/graph`, `/timeline`, `/infrastructure`, `/evidence`, `/alerts`, `/reports`.
- API Handlers: `/api/investigation/search`, `/api/intelligence/relationships`, `/api/export/pdf`, `/api/export/json`, `/api/export/csv`.

### 3. Database Integrity Verification
Database seeding and relational queries are verified using Prisma Studio:
```bash
npx prisma studio
```
- Confirms referential integrity across foreign key relations (`Actor` → `PgpKey`, `Actor` → `ActorWallet` → `Wallet`, `ActorRelationship` → `EvidenceContribution`).
- Validates deterministic score aggregation on seeded test relationships.

---

# Limitations

To maintain operational integrity and scientific transparency, the platform operates under the following documented constraints:

1. **Synthetic Demonstration Data**: The dataset used in this prototype consists of synthetic intelligence generated specifically for research, development, and evaluation. It contains no personally identifiable information (PII) or real-world dark web operational data.
2. **No Active Crawling or Exploitation**: The application does not conduct active scraping, vulnerability exploitation, or Tor network penetration. It acts solely as an analytical intelligence engine ingesting pre-collected, structured feeds.
3. **Correlation, Not Legal Identification**: Attributed relationships indicate technical indicator overlap between anonymous pseudonyms. They represent probabilistic hypotheses and do not constitute legal identification of a natural person.
4. **Static Weight Calibration**: Scoring weights currently follow standardized heuristics (e.g., PGP = 40%, Wallet = 35%). In dynamic production environments, weights should be adjusted based on the specific threat environment and forensic confidence requirements.

---

# Future Improvements

Planned future iterations for production deployment include:

1. **Automated Ingestion Pipelines**: Connectors for ingesting real-time threat intelligence feeds, Tor onion monitors, and blockchain transaction monitors via Kafka or RabbitMQ message queues.
2. **Advanced Heuristic Models**: Incorporating Jaccard similarity indexing on forum writing styles (stylometry) and transaction graph hops for cryptocurrency flow tracing.
3. **Role-Based Access Control (RBAC)**: Fine-grained access management distinguishing between read-only analysts, case investigators, and intelligence supervisors.
4. **Scalable Graph Cluster Clustering**: Transitioning large-scale entity networks to a dedicated graph database (such as Neo4j) to support multi-hop pathfinding across tens of thousands of personas.
5. **Dynamic Weight Tuning**: Analyst-configurable scoring profiles allowing investigation teams to adjust contribution weights based on specific operational priorities.
