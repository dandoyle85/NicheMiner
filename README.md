# Auto Niche Miner Pro — Phase 8.1 Clean Bundle

## What’s Included
- index.html — Clean UI with Empire, Affiliate Hub (Coming Soon), Niches
- fetch-keywords.js — Fetches live keywords via /api proxy endpoints
- supabase-client.js — Supabase integration
- functions/api/autocomplete.js — Proxy for Google/YouTube/Amazon/Walmart/Etsy/Pinterest
- functions/api/paa.js — Proxy for People Also Ask
- functions/api/trends.js — Proxy for related trends

## Deploy
1. Drop this repo into GitHub.
2. Set SUPABASE_URL and SUPABASE_ANON_KEY in your Cloudflare environment.
3. Cloudflare Pages will detect `functions/` and expose `/api/*` endpoints.
4. Redeploy and test.
