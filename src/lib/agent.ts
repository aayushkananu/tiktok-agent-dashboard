import Anthropic from "@anthropic-ai/sdk";
import nodemailer from "nodemailer";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const VIDEOS = [
  { id: "1",  title: "I have to go to nyc for an emergency",                        views: 3389,   hashtags: [] },
  { id: "2",  title: "Chori sanche Vayera yes and idc",                             views: 3070,   hashtags: ["nepali"] },
  { id: "3",  title: "Create aesthetic photos",                                      views: 16500,  hashtags: ["aesthetic"] },
  { id: "4",  title: "Are nepali international students cooked?",                    views: 156800, hashtags: ["nepali", "internationalstudent"] },
  { id: "5",  title: "Literally the mood",                                           views: 3083,   hashtags: [] },
  { id: "6",  title: "Do. What. You. Want. But. Youre. Never. Gonna break me",      views: 2770,   hashtags: [] },
  { id: "7",  title: "Things only nepali people do",                                 views: 9501,   hashtags: ["nepali"] },
  { id: "8",  title: "I made $25000 in 3 months as a nepali international student", views: 135400, hashtags: ["nepali", "money"] },
  { id: "9",  title: "I made $25000 in 3 months (repost)",                          views: 10000,  hashtags: ["nepali", "money"] },
  { id: "10", title: "Get unready with me while ranting about insecurities",         views: 13000,  hashtags: ["grwm"] },
  { id: "11", title: "Episode 1: will I make it in America",                         views: 26700,  hashtags: ["internationalstudent"] },
  { id: "12", title: "Pov: finally finishing my app",                                views: 3150,   hashtags: ["tech"] },
  { id: "13", title: "Unemployed me after graduation",                               views: 179000, hashtags: ["graduation", "unemployed"] },
  { id: "14", title: "Q/A",                                                          views: 4337,   hashtags: [] },
  { id: "15", title: "Gym vlog",                                                     views: 20500,  hashtags: ["gymvlog"] },
  { id: "16", title: "Day in my life vlog",                                          views: 6114,   hashtags: ["dayinmylife"] },
] as const;

export interface AudienceInsights {
  generatedAt: string;
  analysis: string;
  stats: {
    totalVideos: number;
    totalViews: number;
    topVideo: string;
    avgViews: number;
  };
}

export interface WeeklyBrief {
  week: string;
  analysis: string;
  generatedAt: string;
}

export async function generateAudienceAnalysis(): Promise<AudienceInsights> {
  const sorted = [...VIDEOS].sort((a, b) => b.views - a.views);
  const totalViews = VIDEOS.reduce((s, v) => s + v.views, 0);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: `You are a TikTok content strategist for @lalmooon.

TOP VIDEOS:
${sorted.slice(0, 10).map((v, i) => `${i + 1}. "${v.title}" - ${v.views.toLocaleString()} views`).join("\n")}

TOTAL VIDEOS: ${VIDEOS.length}
TOTAL VIEWS: ${totalViews.toLocaleString()}

AUDIENCE:
1. Women ages 18-30 broadly - career anxiety, financial independence, self-improvement, confidence, burnout
2. Nepali international students and South Asian diaspora in the US - OPT/H1B anxiety, post-graduation survival, identity

Provide a sharp audience analysis with these sections:

## Audience Profile
Who is watching and why. What the top videos reveal about what resonates.

## Content Patterns That Work
Specific patterns in the top videos. Topics, formats, hooks that perform.

## What To Make More Of
3-5 specific content ideas based on what is already working. Include hooks and hashtags.

## What To Stop Or Change
What is underperforming and why.

## Growth Opportunities
2-3 untapped angles this creator has not tried yet.

Be direct. Reference actual video titles and numbers.`
    }],
  });

  return {
    generatedAt: new Date().toISOString(),
    analysis: message.content[0].type === "text" ? message.content[0].text : "",
    stats: {
      totalVideos: VIDEOS.length,
      totalViews,
      topVideo: sorted[0].title,
      avgViews: Math.round(totalViews / VIDEOS.length),
    },
  };
}

export async function generateWeeklyBrief(): Promise<WeeklyBrief> {
  const sorted = [...VIDEOS].sort((a, b) => b.views - a.views);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  let searchSummary = "";
  const queries = [
    "TikTok trending sounds viral this week 2026",
    "TikTok trending topics women career money 2026",
    "nepali international students USA news 2026",
  ];

  for (const q of queries) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const searchTools: any[] = [{ type: "web_search_20250305", name: "web_search", max_uses: 1 }];
      const res = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        tools: searchTools,
        messages: [{ role: "user", content: `Search: ${q}. Summarize in 3 sentences.` }],
      });
      const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      if (text) searchSummary += `\n\nQUERY: ${q}\n${text}`;
    } catch { /* skip failed searches */ }
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: `You are a TikTok content strategist for @lalmooon.

CREATOR TOP CONTENT:
${sorted.slice(0, 5).map((v) => `"${v.title}" - ${v.views.toLocaleString()} views`).join("\n")}

AUDIENCE:
1. Women ages 18-30 - career, money, self-improvement, burnout, confidence
2. Nepali international students in the US - OPT/H1B, post-grad survival, identity

TODAY: ${today}

TREND DATA:${searchSummary || " Use your current knowledge of trends."}

Write a WEEKLY CONTENT BRIEF:

## Top 3 Trending Sounds This Week
Sound name, why trending, specific video concept for @lalmooon.

## Top 5 Topics for Your Audience This Week
What is trending, why her audience cares, one specific hook.

## 3 Videos to Post This Week
Ranked by predicted performance. Hook (first 3 seconds), format, hashtags, best posting day.

## Jump On This TODAY
Single highest-urgency trend peaking right now.

## Audience Mood This Week
Emotional temperature of the audience right now.

Be specific and direct.`
    }],
  });

  return {
    week: new Date().toISOString().split("T")[0],
    analysis: message.content[0].type === "text" ? message.content[0].text : "",
    generatedAt: new Date().toISOString(),
  };
}

export async function sendWeeklyEmail(brief: WeeklyBrief): Promise<void> {
  const fromEmail = process.env.FROM_EMAIL!;
  const toEmail = process.env.TO_EMAIL!;
  const appPassword = process.env.GMAIL_APP_PASSWORD!;

  if (!appPassword) throw new Error("GMAIL_APP_PASSWORD not set");

  const safe = (str: string) =>
    str.replace(/[\uD800-\uDFFF]/g, "");

  const body = safe(brief.analysis)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/### (.+)/g, "<p><b>$1</b></p>")
    .replace(/## (.+)/g, `<hr style="border:none;border-top:1px solid #eee;margin:24px 0;"><p style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#555;margin:0 0 12px;">$1</p>`)
    .replace(/\n\n/g, `</p><p style="margin:0 0 12px;">`)
    .replace(/\n/g, "<br>");

  const weekLabel = new Date(brief.generatedAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:Georgia,serif;background:#fff;">
<div style="max-width:580px;margin:0 auto;padding:40px 24px;color:#222;">
  <p style="margin:0 0 4px;font-size:13px;color:#888;">${safe(weekLabel)}</p>
  <h2 style="margin:0 0 24px;font-size:20px;font-weight:600;color:#111;">Your weekly TikTok brief, @lalmooon</h2>
  <p style="margin:0 0 12px;">${body}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
  <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
    Sent by your TikTok AI Agent &middot;
    <a href="https://www.tiktok.com/@lalmooon" style="color:#aaa;">@lalmooon</a>
  </p>
</div></body></html>`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: fromEmail, pass: appPassword },
  });

  await transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    subject: `@lalmooon Weekly TikTok Brief - ${weekLabel}`,
    text: safe(brief.analysis).replace(/\*\*/g, ""),
    html,
  });
}