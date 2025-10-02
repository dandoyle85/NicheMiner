
// supabase-client.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Keywords
export async function saveKeywords(niche, keywords) {
  const payload = keywords.map(k => ({ niche, keyword: k.keyword, volume: k.volume, competition: k.competition }));
  const { data, error } = await supabase.from("keywords").insert(payload).select();
  if (error) { console.error("saveKeywords error:", error.message); return null; }
  return data;
}

export async function getKeywords(niche) {
  const { data, error } = await supabase.from("keywords").select("*").eq("niche", niche);
  if (error) { console.error("getKeywords error:", error.message); return []; }
  return data || [];
}
