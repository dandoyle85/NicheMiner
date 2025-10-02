// supabase-client.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase URL & Key will be injected via Cloudflare environment variables
const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all sites
export async function getSites() {
  const { data, error } = await supabase.from("sites").select("*");
  if (error) console.error("Error fetching sites:", error.message);
  return data || [];
}

// Add or update site
export async function upsertSite(site) {
  const { data, error } = await supabase.from("sites").upsert(site);
  if (error) console.error("Error upserting site:", error.message);
  return data;
}
