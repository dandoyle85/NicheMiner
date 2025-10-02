# Auto Niche Miner Pro — Phase 3

This drop adds a **clean slide-in Site Panel** and a **full-screen AI Overview modal**.

## What’s New
- Click a row in the leaderboard (or use the dropdown) → opens a **slide-in site panel** with:
  - 30d mini chart, revenue & status
  - Settings (aggression slider, auto-blog/pins/shorts toggles) — saved to Supabase
  - Affiliate links list + add box
  - **Site-specific AI Coach** with “Apply This” (writes to Supabase)
- ⚡ **AI Overview** floating button (bottom-right) when no site is open
  - Opens full-screen modal with **stacked recommendations** (one card per site)
  - “Apply This” per site **or** “Apply All” for bulk changes

## Files
- `index.html` — Empire dashboard + slide-in panel + AI Overview modal
- `supabase-client.js` — Supabase helpers for sites, settings, and affiliate links

## Deploy
1. Ensure Supabase env vars in Cloudflare Pages:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
2. Push these files to GitHub (root). Cloudflare Pages settings:
   - Framework: **None**
   - Build command: *(blank)*
   - Output folder: `/`

## Notes
- AI actions are simple simulations (bump revenue/traffic, adjust status/settings) to demonstrate flow.
- You can evolve the coach logic to use your revenue goals and aggression strategy later.