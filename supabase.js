import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = window.env?.SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = window.env?.SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY){
  console.warn("Supabase env not found. Set window.env in env.js or VITE_* in build env.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
