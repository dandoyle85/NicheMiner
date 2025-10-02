
# Auto Niche Miner Pro — Phase 7 (Full, Fixed)

## What's New
- Supabase client now has **fallback values** if Cloudflare env vars aren't set.
- Update `supabase-client.js` with your real project URL + anon key if Cloudflare vars don't inject correctly.

## Setup
1. Add Cloudflare Pages environment variables:
   - SUPABASE_URL = https://YOUR-PROJECT.supabase.co
   - SUPABASE_ANON_KEY = YOUR-ANON-KEY

2. Or edit `supabase-client.js` to hardcode them.

3. Ensure your Supabase DB has these tables:
   - sites
   - settings
   - affiliate_links
   - keywords

## After Deploy
- Empire tab: shows sites from Supabase
- Affiliate Hub: saves affiliate links
- Niches: shows mock niches + saves selected keywords
