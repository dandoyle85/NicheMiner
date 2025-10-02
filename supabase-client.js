
// supabase-client.js (with fallback)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Try to pull from env vars, fallback to hardcoded placeholders
const supabaseUrl = typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "https://YOUR-PROJECT.supabase.co";
const supabaseKey = typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "YOUR-ANON-KEY";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Example functions
export async function getSites(){
  const { data, error } = await supabase.from("sites").select("*");
  if(error){ console.error("getSites error:", error.message); return []; }
  return data;
}

export async function saveKeywords(niche, keywords){
  const payload = keywords.map(k => ({
    niche,
    keyword: k.keyword,
    volume: k.volume,
    competition: k.competition
  }));
  const { data, error } = await supabase.from("keywords").insert(payload).select();
  if(error){ console.error("saveKeywords error:", error.message); return null; }
  return data;
}
