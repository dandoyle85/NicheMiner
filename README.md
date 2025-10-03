# Auto Niche Miner Pro — Live Bundle

This bundle renders a live leaderboard + per-site 30‑day traffic charts from your Supabase project.

## Quick Start
1) Open `env.js` and replace the placeholders with your **Supabase Project URL** and **anon key**  
   (Supabase → Settings → API).
2) Commit these files to your GitHub repo connected to **Cloudflare Pages**.
3) Cloudflare redeploys automatically. Refresh your site.

## Tables
Expected table: `sites`

```sql
create table if not exists sites (
  id bigint generated always as identity primary key,
  name text not null unique,
  revenue int default 0,
  traffic jsonb default '[]',
  status text default 'Cooling'
);
```

## Notes
- The Supabase **anon** key is designed for public use in the browser.
- Charts use Chart.js via CDN.
