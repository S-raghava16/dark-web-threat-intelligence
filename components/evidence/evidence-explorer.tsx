"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/ui/confidence";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FieldLabel,
  SelectInput,
  TextInput,
} from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TBody, Td, Th, THead } from "@/components/ui/table";
import { formatDateTime, humanizeKey } from "@/lib/format";
import type { EvidenceRecord, EvidenceType } from "@/lib/types";

const TYPE_OPTIONS: Array<{ value: "all" | EvidenceType; label: string }> = [
  { value: "all", label: "All evidence types" },
  { value: "post", label: "Post" },
  { value: "listing", label: "Listing" },
  { value: "pgp_signature", label: "PGP signature" },
  { value: "wallet_reuse", label: "Wallet reuse" },
  { value: "infrastructure_overlap", label: "Infrastructure overlap" },
  { value: "linguistic_marker", label: "Linguistic marker" },
];

export function EvidenceExplorer({
  records,
  investigationTitles,
}: {
  records: EvidenceRecord[];
  investigationTitles: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | EvidenceType>("all");

  const filtered = useMemo(() => {
    return records.filter((item) => {
      const matchesType = type === "all" || item.type === type;
      const haystack = `${item.summary} ${item.source}`.toLowerCase();
      return matchesType && haystack.includes(query.trim().toLowerCase());
    });
  }, [records, query, type]);

  return (
    <div>
      <PageHeader
        title="Evidence locker"
        description="Structured evidence items linked to investigations. Replace this catalog with database rows later."
      />
      <Card className="mb-4">
        <CardBody className="grid gap-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="evd-search">Search</FieldLabel>
            <TextInput
              id="evd-search"
              type="search"
              value={query}
              onChange={setQuery}
              placeholder="Summary or source"
            />
          </div>
          <div>
            <FieldLabel htmlFor="evd-type">Evidence type</FieldLabel>
            <SelectInput
              id="evd-type"
              value={type}
              onChange={(value) => setType(value as "all" | EvidenceType)}
              options={TYPE_OPTIONS}
            />
          </div>
        </CardBody>
      </Card>
      {filtered.length === 0 ? (
        <EmptyState
          title="No evidence matches"
          description="Clear the type filter to review the full synthetic evidence table."
        />
      ) : (
        <Card>
          <Table caption="Evidence table">
            <THead>
              <tr>
                <Th>Type</Th>
                <Th>Source</Th>
                <Th>Timestamp</Th>
                <Th>Confidence</Th>
                <Th>Investigation</Th>
              </tr>
            </THead>
            <TBody>
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <Td className="capitalize font-medium text-slate-800">{humanizeKey(item.type)}</Td>
                  <Td>
                    <p className="font-medium text-slate-800">{item.source}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.summary}</p>
                  </Td>
                  <Td className="whitespace-nowrap font-mono text-xs text-slate-600">
                    {formatDateTime(item.timestamp)}
                  </Td>
                  <Td>
                    <ConfidenceBadge confidence={item.confidence} />
                  </Td>
                  <Td>
                    <Link
                      href="/reports"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {investigationTitles[item.investigationId] ??
                        item.investigationId}
                    </Link>
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
