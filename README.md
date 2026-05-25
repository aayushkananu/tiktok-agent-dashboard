TikTok Agent — Web Dashboard

A Next.js app that gives you an AI-powered TikTok dashboard with:
- Video performance overview
- Audience analysis (Claude AI)
- Weekly content brief with trending sounds, topics, and video ideas
- Auto-emails the brief to [professional_email] every Monday at 9am

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub
```bash
cd tiktok-dashboard
git init
git add .
git commit -m "launch"
gh repo create username-tiktok-agent --private --push
```

### 2. Deploy on Vercel
Go to vercel.com → New Project → import your repo → Deploy

### 3. Add Environment Variables in Vercel
Go to Project Settings → Environment Variables and add:

| Name | Value |
|------|-------|
| ANTHROPIC_API_KEY | sk-ant-your-key |
| FROM_EMAIL | youremail |
| TO_EMAIL | professional_email |
| GMAIL_APP_PASSWORD | your-16-char-app-password |
| TIKTOK_USERNAME | tiktokusername |

### 4. Done
Your dashboard is live. The weekly brief auto-runs every Monday at 9am UTC via Vercel Cron.

## Run locally
```bash
npm install
cp .env.example .env.local
# fill in .env.local with your values
npm run dev
# open http://localhost:3000
```

## How weekly auto-send works
`vercel.json` configures a cron job that hits `/api/cron` every Monday at 9am UTC.
That generates a fresh brief and emails it automatically — no action needed from you.
