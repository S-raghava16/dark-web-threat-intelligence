import type { Metadata } from "next";
import { InvestigationSearch } from "@/components/investigation/investigation-search";
import { getActorNamesById } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Investigation",
};

export default async function InvestigationPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = params.q;
  const query = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");

  return (
    <InvestigationSearch
      initialQuery={query}
      actorNames={getActorNamesById()}
    />
  );
}
