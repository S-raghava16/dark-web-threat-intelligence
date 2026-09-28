import type { Metadata } from "next";
import { ReportsConsole } from "@/components/reports/reports-console";
import { getActors, getEvidence, getInvestigations } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <ReportsConsole
      investigations={getInvestigations()}
      actors={getActors()}
      evidence={getEvidence()}
    />
  );
}
