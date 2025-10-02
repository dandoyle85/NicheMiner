
// supabase-client.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getAffiliateLinks(niche) {
  const { data, error } = await supabase.from("affiliate_links").select("*").eq("niche", niche).order("id", { ascending: false });
  if (error) { console.error("getAffiliateLinks error:", error.message); return []; }
  return data || [];
}

export async function addAffiliateLink(niche, url) {
  const { data, error } = await supabase.from("affiliate_links").insert({ niche, url }).select().single();
  if (error) { console.error("addAffiliateLink error:", error.message); return null; }
  return data;
}

export async function getSites() {
  const { data, error } = await supabase.from("sites").select("*").order("name");
  if (error) { console.error("getSites error:", error.message); return []; }
  return data || [];
}
