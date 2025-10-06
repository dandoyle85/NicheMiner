
// main.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || window.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || window.env?.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', async () => {
  const app = document.getElementById('app');
  app.innerHTML = '<h1>🔥 Top 15 Profitable Niches (Live)</h1><p>Loading niches...</p>';

  try {
    const { data, error } = await supabase.from('niches').select('*').limit(15);
    if (error) throw error;
    if (!data || data.length === 0) {
      app.innerHTML += '<p>No data found in Supabase.</p>';
      return;
    }

    const list = data.map(n => `<li>${n.name} — Score: ${n.score || 0}</li>`).join('');
    app.innerHTML = `<h1>🔥 Top 15 Profitable Niches (Live)</h1><ul>${list}</ul>`;
  } catch (err) {
    console.error('Fetch Error:', err);
    app.innerHTML += `<p style="color:red;">Error: ${err.message}</p>`;
  }
});
