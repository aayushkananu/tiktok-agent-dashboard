"use client";

import { useState, useEffect, useCallback } from "react";

interface Video {
  id: string;
  title: string;
  views: number;
  hashtags: string[];
}

interface AudienceInsights {
  generatedAt: string;
  analysis: string;
  stats: {
    totalVideos: number;
    totalViews: number;
    topVideo: string;
    avgViews: number;
  };
}

interface WeeklyBrief {
  week: string;
  analysis: string;
  generatedAt: string;
}

const VIDEOS: Video[] = [
  { id: "1",  title: "I have to go to nyc for an emergency",                        views: 3389,   hashtags: [] },
  { id: "2",  title: "Chori sanche Valera yes and idc",                             views: 3070,   hashtags: ["nepali"] },
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
];

function fmt(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return n.toString();
}

function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/## (.+)/g, '<h3 class="section-head">$1</h3>')
    .replace(/### (.+)/g, '<h4 class="sub-head">$1</h4>')
    .split("\n\n")
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

type Tab = "overview" | "audience" | "weekly";

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [insights, setInsights] = useState<AudienceInsights | null>(null);
  const [brief, setBrief] = useState<WeeklyBrief | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const sorted = [...VIDEOS].sort((a, b) => b.views - a.views);
  const totalViews = VIDEOS.reduce((s, v) => s + v.views, 0);

  const fetchInsights = useCallback(async () => {
    setLoadingInsights(true);
    setError("");
    try {
      const res = await fetch("/api/analyze");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInsights(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load insights");
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  const fetchBrief = useCallback(async () => {
    setLoadingBrief(true);
    setError("");
    try {
      const res = await fetch("/api/weekly");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBrief(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load brief");
    } finally {
      setLoadingBrief(false);
    }
  }, []);

  const sendEmail = async () => {
    setSendingEmail(true);
    setError("");
    try {
      const res = await fetch("/api/weekly", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    if (tab === "audience" && !insights) fetchInsights();
    if (tab === "weekly" && !brief) fetchBrief();
  }, [tab, insights, brief, fetchInsights, fetchBrief]);

  return (
    <div className="shell">
      <header className="header">
        <div className="header-left">
          <span className="logo">@lalmooon</span>
          <span className="logo-sub">TikTok Agent</span>
        </div>
        <div>
          <span className="live-dot" />
          <span className="live-label">AI-Powered</span>
        </div>
      </header>

      <nav className="nav">
        {(["overview", "audience", "weekly"] as Tab[]).map((t) => (
          <button key={t} className={`nav-btn${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t === "overview" ? "Overview" : t === "audience" ? "Audience Analysis" : "Weekly Brief"}
          </button>
        ))}
      </nav>

      <main className="content">
        {error && <div className="error-box">{error}</div>}
        {emailSent && <div className="success-box">Email sent to lalmooon03@gmail.com</div>}

        {tab === "overview" && (
          <>
            <div className="stats">
              <div className="stat">
                <div className="stat-val">{fmt(totalViews)}</div>
                <div className="stat-lbl">Total Views</div>
              </div>
              <div className="stat">
                <div className="stat-val">{VIDEOS.length}</div>
                <div className="stat-lbl">Videos</div>
              </div>
              <div className="stat">
                <div className="stat-val">{fmt(Math.round(totalViews / VIDEOS.length))}</div>
                <div className="stat-lbl">Avg Views</div>
              </div>
              <div className="stat">
                <div className="stat-val">{fmt(sorted[0].views)}</div>
                <div className="stat-lbl">Best Video</div>
              </div>
            </div>
            <p className="grid-label">All videos — sorted by views</p>
            <div className="video-list">
              {sorted.map((v, i) => (
                <div key={v.id} className="video-row">
                  <span className="video-rank">{String(i + 1).padStart(2, "0")}</span>
                  <span className="video-title">{v.title}</span>
                  <span className="video-views">{fmt(v.views)}</span>
                  {v.views >= 50000 && <span className="viral-tag">viral</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "audience" && (
          <>
            {loadingInsights ? (
              <div className="loading">
                <div className="spinner" />
                <span className="loading-text">Claude is analyzing your audience...</span>
              </div>
            ) : insights ? (
              <>
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">Audience Intelligence</span>
                    <span className="panel-date">
                      {new Date(insights.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="analysis-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(insights.analysis) }} />
                </div>
                <div className="btn-row">
                  <button className="btn btn-secondary" onClick={fetchInsights} disabled={loadingInsights}>Refresh Analysis</button>
                </div>
              </>
            ) : (
              <div className="empty">
                <div className="empty-icon">◎</div>
                <p>Click below to generate your audience analysis.</p>
                <br />
                <button className="btn btn-primary" onClick={fetchInsights}>Generate Analysis</button>
              </div>
            )}
          </>
        )}

        {tab === "weekly" && (
          <>
            {loadingBrief ? (
              <div className="loading">
                <div className="spinner" />
                <span className="loading-text">Searching trends and writing your brief...</span>
              </div>
            ) : brief ? (
              <>
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">Weekly Brief — {brief.week}</span>
                    <span className="panel-date">
                      {new Date(brief.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="analysis-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(brief.analysis) }} />
                </div>
                <div className="btn-row">
                  <button className="btn btn-primary" onClick={sendEmail} disabled={sendingEmail}>
                    {sendingEmail ? "Sending..." : "Send to Email"}
                  </button>
                  <button className="btn btn-secondary" onClick={fetchBrief} disabled={loadingBrief}>Refresh Brief</button>
                </div>
              </>
            ) : (
              <div className="empty">
                <div className="empty-icon">◎</div>
                <p>Click below to generate this week&apos;s content brief.<br />Auto-runs every Monday via Vercel Cron.</p>
                <br />
                <button className="btn btn-primary" onClick={fetchBrief}>Generate This Week&apos;s Brief</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
