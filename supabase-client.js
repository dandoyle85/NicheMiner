import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
export function getClient(){
  const url = window.SUPABASE_URL || "";
  const key = window.SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  try { return createClient(url, key, { auth: { persistSession: false } }); }
  catch(e){ console.warn('Supabase init failed:', e); return null; }
}
