// supabase-client.js — Phase 8.2.1
import { supabase, mockMode } from './src/lib/supabase.js';

export async function saveKeywords(list){
  if (!list || !list.length) return;
  if(mockMode){
    console.log("⚠️ Mock mode — keywords not saved to Supabase.");
    return;
  }
  try {
    const { data, error } = await supabase.from("keywords").insert(list);
    if (error) throw error;
    console.log("Saved to Supabase", data);
  } catch (e){ console.error("Supabase error", e); }
}
