import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Read environment from window.env (set in env.js)
const SUPABASE_URL = window.env?.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.env?.SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Edit env.js with your project values.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
