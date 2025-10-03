import { supabase, mockMode } from '/src/lib/supabase.js';

async function renderEmpire(){
  const tbody = document.querySelector('#empireTable tbody');
  tbody.innerHTML = '';

  if (mockMode){
    const rows = [
      { name:'DroneBlog.com', daily_rev:'$45', status:'🔥 Hot' },
      { name:'FitnessTips.net', daily_rev:'$20', status:'🟢 Stable' },
      { name:'SmartHomeHQ.io', daily_rev:'$5', status:'🟡 Cold' },
    ];
    rows.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${s.name}</td><td>${s.daily_rev}</td><td>${s.status}</td>`;
      tbody.appendChild(tr);
    });
    return;
  }

  try {
    const { data, error } = await supabase.from('sites').select('*');
    if (error) throw error;
    (data || []).forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${s.name}</td><td>${s.daily_rev ?? 0}</td><td>${s.status ?? 'OK'}</td>`;
      tbody.appendChild(tr);
    });
  } catch (e){
    console.error('Supabase sites error', e);
  }
}

window.addEventListener('DOMContentLoaded', renderEmpire);
