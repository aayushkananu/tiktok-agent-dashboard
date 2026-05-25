import { NextResponse } from "next/server";
import { generateAudienceAnalysis } from "@/lib/agent";

export const maxDuration = 60;

export async function GET() {
  try {
    const insights = await generateAudienceAnalysis();
    return NextResponse.json(insights);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
