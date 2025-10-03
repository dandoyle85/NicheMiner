import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "";
console.log("🔧 Supabase env — url?", !!SUPABASE_URL, " key?", !!SUPABASE_ANON_KEY);
let supabase; let mockMode=false;
if (SUPABASE_URL && SUPABASE_ANON_KEY){ supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); console.log("✅ Supabase client initialized"); }
else { mockMode=true; console.warn("⚠️ Supabase not configured — using mock mode"); }
export { supabase, mockMode };
