import { NextResponse } from "next/server";
import { generateWeeklyBrief, sendWeeklyEmail } from "@/lib/agent";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  try {
    const brief = await generateWeeklyBrief();
    return NextResponse.json(brief);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const brief = await generateWeeklyBrief();
    await sendWeeklyEmail(brief);
    return NextResponse.json({ success: true, week: brief.week });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
