NicheMiner — Supabase + WordPress build
======================================

Files:
- index.html
- style.css
- config.js                  (local testing; in production use Cloudflare env vars)
- supabase-client.js
- main.js                    (Supabase tracker + WordPress draft sync)
- supabase_content_tracker.sql

Environment variables (Cloudflare Pages):
- SUPABASE_URL
- SUPABASE_ANON_KEY
- WP_URL (e.g., https://yourdomain.com/wp-json/wp/v2)
- WP_USER
- WP_APP_PASSWORD (WordPress Application Password)

Tables expected:
- niches(title text, created_at timestamptz default now())
- keywords(niche text, keyword text, score int, intent text, trend text, created_at timestamptz default now())
- content_tracker(id bigint pk, niche text, keyword text, status text, url text, date_saved timestamptz default now())

Usage:
1) Add a niche → click it to load keywords.
2) Click a keyword → drawer opens.
3) Generate Blog/eBook/Shorts/Pins → content in output box.
4) Click "Save to Tracker" to log ownership (prevents duplicates).
5) Click "Save to WordPress" to auto-create a Draft post on your site.

The keyword loader filters out keywords already in `content_tracker` for that niche.
