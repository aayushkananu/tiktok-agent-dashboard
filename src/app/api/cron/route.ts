import { NextResponse } from "next/server";
import { generateWeeklyBrief, sendWeeklyEmail } from "@/lib/agent";

export const maxDuration = 60;

// This route is called by Vercel Cron every Monday at 9am UTC
// Configure in vercel.json
export async function GET() {
  try {
    console.log("Cron: generating weekly brief...");
    const brief = await generateWeeklyBrief();
    await sendWeeklyEmail(brief);
    console.log("Cron: weekly brief sent for week", brief.week);
    return NextResponse.json({ success: true, week: brief.week });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Cron error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
