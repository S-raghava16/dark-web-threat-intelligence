import type { Metadata } from "next";
import { EvidenceExplorer } from "@/components/evidence/evidence-explorer";
import { getEvidence, getInvestigationTitlesById } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Evidence",
};

export default function EvidencePage() {
  return (
    <EvidenceExplorer
      records={getEvidence()}
      investigationTitles={getInvestigationTitlesById()}
    />
  );
}
