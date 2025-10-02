
# Auto Niche Miner Pro — Phase 4

**Automation + Goal-Based Optimizer**

## What's New
- 🤖 **Automation Engine (demo)** — modal with “Run Automation Now” simulates scheduled runs:
  - Auto-blog → + (aggression × 3) revenue, +2 traffic/day
  - Auto-pins → + (aggression × 2) revenue, +3 traffic/day
  - Auto-shorts → + (aggression × 4) revenue, +4 traffic/day
- 🎯 **Empire Goal & Optimizer**
  - Set a revenue goal and enable **Auto Aggression**
  - “Run Optimizer” sets per-site aggression (1–10) weighted by current performance
- 🧩 All changes persist via Supabase (`sites`, `settings`)

## Files
- `index.html` — Phase 4 UI (automation modal, goal controls, optimizer)
- `supabase-client.js` — same helper API used in Phases 2–3

## Deploy
- Cloudflare Pages env vars:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
- Build settings: Framework **None**, Build command **(blank)**, Output **/**

## Notes
- The Automation Engine here is a **front-end simulator** for demoing behavior.
- For real scheduling later, wire a cron (GitHub Actions or Cloudflare Workers/Pages Functions) to call a serverless function that updates Supabase.
