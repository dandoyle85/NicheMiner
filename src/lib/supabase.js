import { createClient } from '@supabase/supabase-js';

// Fallback to mock if env vars are missing
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || window.SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY;

let supabase;

if (SUPABASE_URL && SUPABASE_KEY) {
  console.log("✅ Supabase mode active");
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn("⚠️ Supabase not configured, using mock mode");
  supabase = {
    from: () => ({
      select: async () => ({ data: [
        { site: "Mock Site 1", revenue: "$120", status: "✅ Healthy" },
        { site: "Mock Site 2", revenue: "$80", status: "⚠️ Needs Update" },
      ], error: null })
    })
  };
}

export default supabase;
