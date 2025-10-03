import supabase from './supabase.js';

const tableBody = document.querySelector('#leaderboard-body');
const refreshBtn = document.querySelector('#refreshBtn');
const emptyState = document.querySelector('#emptyState');
const chartsContainer = document.querySelector('#charts-container');

let charts = []; // keep refs to destroy on refresh

function destroyCharts(){
  charts.forEach(c => c?.destroy?.());
  charts = [];
}

function renderTable(sites){
  tableBody.innerHTML = '';
  if (!sites || !sites.length){
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  for (const site of sites){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${site.name}</td>
                    <td>$${(site.revenue ?? 0).toLocaleString()}</td>
                    <td>${site.status ?? ''}</td>`;
    tableBody.appendChild(tr);
  }
}

function renderCharts(sites){
  chartsContainer.innerHTML = '';
  for (const site of sites){
    const wrap = document.createElement('div');
    wrap.className = 'chart-card';
    const title = document.createElement('h3');
    title.textContent = site.name;
    const canvas = document.createElement('canvas');
    wrap.appendChild(title);
    wrap.appendChild(canvas);
    chartsContainer.appendChild(wrap);

    let series = [];
    try{
      series = typeof site.traffic === 'string' ? JSON.parse(site.traffic) : (site.traffic ?? []);
    }catch(_){ series = []; }

    // sort by day ascending if present
    if (Array.isArray(series)){
      series.sort((a,b)=> (a.day||'').localeCompare(b.day||''));
    }

    const labels = series.map(d => d.day);
    const visits = series.map(d => Number(d.visits)||0);

    const chart = new Chart(canvas.getContext('2d'), {
      type:'line',
      data:{
        labels,
        datasets:[{
          label: 'Visits',
          data: visits,
          borderColor: '#58a6ff',
          backgroundColor: 'rgba(88,166,255,0.25)',
          pointRadius: 2,
          tension: 0.3
        }]
      },
      options:{
        responsive:true,
        plugins:{
          legend:{ labels:{ color:'#e6edf3' } },
          tooltip:{ mode:'index', intersect:false }
        },
        scales:{
          x:{ ticks:{ color:'#c7d5ea' }, grid:{ color:'#1f2630' } },
          y:{ ticks:{ color:'#c7d5ea' }, grid:{ color:'#1f2630' } }
        }
      }
    });
    charts.push(chart);
  }
}

async function load(){
  console.log('[ANM] Loading sites…');
  const { data, error } = await supabase.from('sites').select('id,name,revenue,status,traffic').order('revenue',{ascending:false});
  if (error){
    console.error('Fetch error:', error);
    return;
  }
  renderTable(data);
  destroyCharts();
  renderCharts(data);
}

refreshBtn.addEventListener('click', load);

// initial load
load();
