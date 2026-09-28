import { NextResponse } from "next/server";

import { getActors } from "@/lib/db/queries";

export async function GET() {
  const actors = await getActors();

  const escapeCsv = (value: string | number) => {
    const text = String(value);

    if (
      text.includes(",") ||
      text.includes('"') ||
      text.includes("\n")
    ) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  };

  const csv = [
    "Name,Status,Confidence",
    ...actors.map((actor) =>
      [
        escapeCsv(actor.name),
        escapeCsv(actor.status),
        escapeCsv(actor.attributionConfidence),
      ].join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        "attachment; filename=actors.csv",
    },
  });
}