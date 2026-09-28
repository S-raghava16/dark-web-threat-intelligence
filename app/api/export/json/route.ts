import { NextResponse } from "next/server";
import { getActors } from "@/lib/db/queries";

export async function GET() {

  const actors = await getActors();

  return new NextResponse(
    JSON.stringify(actors, null, 2),
    {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition":
          "attachment; filename=actors.json",
      },
    }
  );
}