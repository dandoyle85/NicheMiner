const cfg = window.NICHEMINER_CONFIG || {};
const SUPABASE_URL = cfg.SUPABASE_URL;
const SUPABASE_KEY = cfg.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase keys missing. Check config.js or Cloudflare variables.");
}

const supabase = SUPABASE_URL && SUPABASE_KEY 
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;
