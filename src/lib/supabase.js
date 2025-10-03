// Load supabase directly from the official CDN
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Use Cloudflare-injected environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || window.SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY;

let supabase;

if (SUPABASE_URL && SUPABASE_KEY) {
  console.log("✅ Supabase connected:", SUPABASE_URL);
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn("⚠️ Supabase not configured, fallback mode");
  supabase = {
    from: () => ({
      select: async () => ({
        data: [
          { site: "Mock Site 1", revenue: "$120", status: "✅ Healthy" },
          { site: "Mock Site 2", revenue: "$80", status: "⚠️ Needs Update" }
        ],
        error: null
      })
    })
  };
}

export default supabase;
