NicheMiner — No-API Suggestion Pack (ready-to-deploy)
================================================

What you get:
1. functions/suggest_noapi.js  — Cloudflare Pages Function that generates keyword suggestions without
   calling any external APIs (fully local, deterministic).
2. static/getSuggestions_noapi.js — client helper to call the function.
3. app-suggests-replacement.js — example snippet to wire the suggestions into your app UI.
4. example_env.txt — how to set SITE_KEYWORDS / LOCATIONS / BRANDS in Cloudflare Pages env vars.

How it works:
- The function uses algorithmic patterns (modifiers, locations, brands, synonyms, year variants)
  and optional site-seed keywords (configured via env var SITE_KEYWORDS) to produce autocomplete-like suggestions.
- No external network calls required at runtime — 100% stable and under your control.

Install:
1. Copy functions/suggest_noapi.js to your Pages repo under /functions/.
2. Copy static/getSuggestions_noapi.js into your static assets (or import its code into your app.js).
3. Add the app-suggests-replacement.js snippet into your app.js or include it as a separate script.
4. (Optional) In Cloudflare Pages dashboard -> Settings -> Environment variables add:
   - SITE_KEYWORDS (value is JSON array string, e.g. ["drone mapping","drone jobs","drone inspection"])
   - LOCATIONS (JSON array string)
   - BRANDS (JSON array string)
5. Commit & push. Cloudflare Pages will redeploy. Test:
   - https://<your-pages-subdomain>.pages.dev/api/suggest_noapi?q=drone

Notes:
- For production, update CORS 'Access-Control-Allow-Origin' in the function to your exact origin.
- If you want data closer to real-user queries without runtime APIs, consider a build-time scraper that runs
  in GitHub Actions, collects autocompletes, and commits a site_keywords.json file. This keeps runtime API-free.

Need help wiring this into your repo? Paste the suggestion-related portion of your app.js and I will produce a ready-to-apply patch that replaces the remote calls with this no-API function.
