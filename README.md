# Auto Niche Miner Pro (Supabase Enabled)

This version of the dashboard pulls **live site data from Supabase**.

## ✅ Setup
1. Deploy schema & seed data in Supabase (see SQL scripts).
2. In Cloudflare Pages, add Environment Variables:
   - SUPABASE_URL = https://xxxx.supabase.co
   - SUPABASE_ANON_KEY = your anon key

## 🚀 Deploy
- Commit these files to GitHub.
- Connect to Cloudflare Pages with build settings:
  - Framework: None
  - Build command: (blank)
  - Output folder: /
- Deploy → see live dashboard pulling from Supabase.

## 🔹 Files
- index.html → Dashboard wired to Supabase
- supabase-client.js → Supabase connection + helper functions
