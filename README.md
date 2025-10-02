
# Auto Niche Miner Pro — Phase 6

**Affiliate Hub Scraper (Mock) + Save Links to Supabase**

## What's New
- **Affiliate Hub page** (separate from Empire):
  - Select a **niche** (Drones, Fitness, Home Improvement, Solar)
  - Click **Scan Competitors** → loads **mock discovered offers**
  - **Sign Up** buttons (open provider pages)
  - **Save Link** → persists to Supabase `affiliate_links`
  - **My Links** section shows your saved links per niche
  - **Auto Inject** toggles per link (stored locally via `localStorage` for demo)

## Files
- `index.html` — Affiliate Hub UI with mock scraper + Supabase save
- `supabase-client.js` — helpers used by the Hub (`getAffiliateLinks`, `addAffiliateLink`, `getSites`)

## Deploy
- Ensure Cloudflare env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- Drop in repo root and deploy (Framework: None, Build: blank, Output: `/`)

## Next (Optional)
- Persist Auto Inject in DB (new table or column)
- Real scraping via Workers/Actions (rate-limit safe)
- Use Hub links in blog/pin/short generators automatically
