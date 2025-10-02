# Auto Niche Miner Pro — Phase 8 (Live + Stable Sources)

This phase enables **live keyword drilldown** using stable, no-signup sources:
- **Google Autocomplete** (search)
- **YouTube Autocomplete**
- **(Best-effort) Google People Also Ask** — often blocked by CORS in browsers, handled gracefully
- **Preloaded niches** (fallback while Trends is gated by CORS)

> Open your browser **Console** to see detailed DEBUG logs for each source.

## Files
- `index.html` — tabs: Empire (basic), Affiliate Hub (tooltip: Coming Soon), Niches (live)
- `fetch-keywords.js` — scrapers for Google/YouTube autocomplete, PAA best-effort
- `supabase-client.js` — Supabase client with env var fallbacks and `saveKeywords()`

## Environment Variables (Cloudflare Pages)
```
SUPABASE_URL = https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY = YOUR-ANON-KEY
```
> Or hardcode inside `supabase-client.js` fallbacks.

## Supabase
Ensure the `keywords` table exists. Saved rows include: niche, keyword, source, intent, volume, competition.

## Notes
- **PAA** parsing is disabled due to CORS limitations in browsers; it's wired as best-effort with clear console logs.
- In **Phase 8.1**, we can add Amazon/Walmart/Etsy/Pinterest autocomplete and a Cloudflare Worker proxy to safely bypass CORS for PAA/Trends.
