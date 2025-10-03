import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_KEY = window.SUPABASE_ANON_KEY || "";

let supabase;
let mockMode = false;

if (SUPABASE_URL && SUPABASE_KEY) {
  console.log("✅ Supabase connected:", SUPABASE_URL);
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.warn("⚠️ Supabase not configured, running in mock mode");
  mockMode = true;
  supabase = {
    from: () => ({
      select: async () => ({
        data: [
          { site: "Mock Site 1", revenue: "$150", status: "✅ Healthy" },
          { site: "Mock Site 2", revenue: "$90", status: "⚠️ Needs Review" }
        ],
        error: null
      })
    })
  };
}

export { supabase, mockMode };
