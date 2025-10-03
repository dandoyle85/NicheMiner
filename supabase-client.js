import { supabase, mockMode } from '/src/lib/supabase.js';

export async function saveKeywords(list){
  if (!list || !list.length) return;
  if (mockMode){ console.log('Mock mode: skip saving keywords'); return; }
  try{
    const { data, error } = await supabase.from('keywords').insert(list);
    if (error) throw error;
    console.log('Saved keywords:', data?.length ?? 0);
  }catch(e){ console.error('Save keywords error', e); }
}
