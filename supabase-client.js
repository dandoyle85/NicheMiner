// supabase-client.js (Phase 8) — with env fallbacks
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL = (typeof SUPABASE_URL !== "undefined") ? SUPABASE_URL : "https://YOUR-PROJECT.supabase.co";
export const SUPABASE_ANON_KEY = (typeof SUPABASE_ANON_KEY !== "undefined") ? SUPABASE_ANON_KEY : "YOUR-ANON-KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Keywords
export async function saveKeywords(niche, keywords) {
  try {
    const payload = keywords.map(k => ({
      niche,
      keyword: k.keyword,
      source: k.source || null,
      intent: k.intent || null,
      volume: k.volume || null,
      competition: k.competition || null
    }));
    const { data, error } = await supabase.from("keywords").insert(payload).select();
    if (error) { console.error("saveKeywords error:", error.message); return null; }
    return data;
  } catch (e) {
    console.error("saveKeywords exception:", e);
    return null;
  }
}

// Sites (for Empire tab visibility)
export async function getSites() {
  const { data, error } = await supabase.from("sites").select("*").order("name");
  if (error) { console.error("getSites error:", error.message); return []; }
  return data || [];
}
