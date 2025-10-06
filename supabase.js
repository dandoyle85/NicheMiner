// ✅ Supabase client configured for Cloudflare Pages + Vite
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Safety check: helps you debug if env vars didn’t inject correctly
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "🚨 Supabase environment variables missing. Check Cloudflare Pages settings → Environment Variables tab → must include VITE_SUPABASE_URL and VITE_SUPABASE_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
console.log("✅ Supabase client initialized:", !!supabaseUrl);
