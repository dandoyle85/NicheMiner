# NicheMiner — Phase 9 (CRUD + Niches Drilldown + AI Coach)

## Deploy
1) Delete your old GitHub repo or wipe it clean.
2) Create a fresh repo and upload these files.
3) Cloudflare Pages → Settings → Environment Variables:
   - VITE_SUPABASE_URL = https://YOURPROJECT.supabase.co
   - VITE_SUPABASE_ANON_KEY = your anon key
4) Redeploy.

## Tables expected
- sites: id (pk), name text unique, revenue int, status text, traffic jsonb
- keyword_metrics: niche text, keyword text, volume int, competition text
