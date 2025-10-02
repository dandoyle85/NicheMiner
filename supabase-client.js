
// supabase-client.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Expect Cloudflare Pages env vars
const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ------- Sites -------
export async function getSites() {
  const { data, error } = await supabase.from("sites").select("*").order("name");
  if (error) { console.error("getSites error:", error.message); return []; }
  return data || [];
}
export async function upsertSite(site) {
  const payload = { id: site.id, name: site.name, revenue: site.revenue, traffic: site.traffic, status: site.status };
  const { data, error } = await supabase.from("sites").upsert(payload).select().single();
  if (error) { console.error("upsertSite error:", error.message); }
  return data;
}

// ------- Settings -------
export async function getSettings(siteId) {
  const { data, error } = await supabase.from("settings").select("*").eq("site_id", siteId).maybeSingle();
  if (error) { console.error("getSettings error:", error.message); return null; }
  return data;
}
export async function updateSettings(siteId, values) {
  const cur = await supabase.from("settings").select("*").eq("site_id", siteId).maybeSingle();
  let res;
  if (cur.data && cur.data.id) {
    res = await supabase.from("settings").update(values).eq("id", cur.data.id).select().single();
  } else {
    res = await supabase.from("settings").insert({ site_id: siteId, ...values }).select().single();
  }
  if (res.error) { console.error("updateSettings error:", res.error.message); }
  return res.data;
}

// ------- Affiliate Links -------
export async function getAffiliateLinks(niche) {
  const { data, error } = await supabase.from("affiliate_links").select("*").eq("niche", niche).order("id", {ascending:false});
  if (error) { console.error("getAffiliateLinks error:", error.message); return []; }
  return data || [];
}
export async function addAffiliateLink(niche, url) {
  const { data, error } = await supabase.from("affiliate_links").insert({ niche, url }).select().single();
  if (error) { console.error("addAffiliateLink error:", error.message); return null; }
  return data;
}

// ------- Keywords -------
export async function saveKeywords(niche, keywords) {
  try{
    const payload = keywords.map(k => ({ niche, keyword: k.keyword, volume: k.volume, competition: k.competition }));
    const { data, error } = await supabase.from("keywords").insert(payload).select();
    if (error) { console.error("saveKeywords error:", error.message); return null; }
    return data;
  } catch(e){
    console.error("saveKeywords exception:", e);
    return null;
  }
}
export async function getKeywords(niche) {
  const { data, error } = await supabase.from("keywords").select("*").eq("niche", niche);
  if (error) { console.error("getKeywords error:", error.message); return []; }
  return data || [];
}
