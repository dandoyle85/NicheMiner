# Auto Niche Miner Pro — Phase 8.2.1 Full Bundle (with seamless mock fallback)

## Features
- Empire, Affiliate Hub, Niches tabs.
- Supabase integration with env vars:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
- Seamless fallback mock data if Supabase fails (no mock badges, looks real).
- API functions for autocomplete, paa, trends.

## Steps
1. In Cloudflare Pages, set environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
2. Deploy this repo.
3. If Supabase is missing, the app will auto-switch to mock mode with realistic data.
