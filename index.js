import { supabase } from './supabase.js';

const tabs = document.querySelectorAll('nav.tabs button');
const sections = document.querySelectorAll('main .tab');
tabs.forEach(btn=> btn.addEventListener('click', () => {
  tabs.forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  sections.forEach(s=>s.classList.add('hidden'));
  document.getElementById(btn.dataset.tab).classList.remove('hidden');
}));

const siteTbody = document.getElementById('siteTbody');
const siteEmpty = document.getElementById('siteEmpty');
const chartsWrap = document.getElementById('charts');
const refreshBtn = document.getElementById('refreshBtn');
const rangeSel = document.getElementById('rangeSel');
const addSiteBtn = document.getElementById('addSiteBtn');
const siteModal = document.getElementById('siteModal');
const siteForm = document.getElementById('siteForm');
const siteId = document.getElementById('siteId');
const siteName = document.getElementById('siteName');
const siteRevenue = document.getElementById('siteRevenue');
const siteStatus = document.getElementById('siteStatus');
const confirmModal = document.getElementById('confirmModal');
const delName = document.getElementById('delName');
const delCancel = document.getElementById('delCancel');
const delOk = document.getElementById('delOk');

const aiToggle = document.getElementById('aiToggle');
const coach = document.getElementById('coach');
const coachClose = document.getElementById('coachClose');
const coachBody = document.getElementById('coachBody');
const coachPrompt = document.getElementById('coachPrompt');
const copyPrompt = document.getElementById('copyPrompt');

let charts = [];
function destroyCharts(){ charts.forEach(c=>c?.destroy?.()); charts=[]; }

function sortByRevenue(a,b){ return (b.revenue||0)-(a.revenue||0); }

function withinRange(series, days){
  if (!Array.isArray(series) || series.length===0) return [];
  const last = new Date(series[series.length-1]?.day || Date.now());
  const cutoff = new Date(last); cutoff.setDate(last.getDate() - (Number(days)||30) + 1);
  return series.filter(p => new Date(p.day) >= cutoff);
}

async function loadSites(){
  const { data, error } = await supabase.from('sites').select('id,name,revenue,status,traffic').order('revenue',{ascending:false});
  if (error){ console.error(error); return; }

  siteTbody.innerHTML='';
  if (!data || data.length===0){
    siteEmpty.classList.remove('hidden');
  } else {
    siteEmpty.classList.add('hidden');
  }

  data.sort(sortByRevenue).forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.name}</td>
                    <td>$${(s.revenue||0).toLocaleString()}</td>
                    <td>${s.status||''}</td>
                    <td class="btn-row">
                      <button class="ghost small" data-edit="${s.id}">Edit</button>
                      <button class="danger small" data-del="${s.id}" data-name="${s.name}">Delete</button>
                    </td>`;
    siteTbody.appendChild(tr);
  });

  siteTbody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', async e => {
    const id = Number(e.currentTarget.dataset.edit);
    const row = data.find(x=>x.id===id);
    siteId.value = String(row.id);
    siteName.value = row.name || '';
    siteRevenue.value = row.revenue || 0;
    siteStatus.value = row.status || 'Active';
    document.getElementById('siteModalTitle').textContent = 'Edit Site';
    siteModal.showModal();
  }));
  siteTbody.querySelectorAll('[data-del]').forEach(btn => btn.addEventListener('click', e => {
    delOk.dataset.id = e.currentTarget.dataset.del;
    delName.textContent = e.currentTarget.dataset.name;
    confirmModal.showModal();
  }));

  destroyCharts();
  chartsWrap.innerHTML='';
  const days = rangeSel.value;
  data.forEach(site => {
    const card = document.createElement('div');
    card.className = 'chart-card';
    card.innerHTML = `<h3>${site.name}</h3><canvas></canvas>`;
    chartsWrap.appendChild(card);
    const ctx = card.querySelector('canvas').getContext('2d');
    let series = [];
    try { series = typeof site.traffic==='string' ? JSON.parse(site.traffic) : (site.traffic||[]); } catch(_){ series=[]; }
    series.sort((a,b)=> String(a.day).localeCompare(String(b.day)));
    const filtered = withinRange(series, days);
    const labels = filtered.map(p=>p.day);
    const values = filtered.map(p=>Number(p.visits)||0);
    const chart = new Chart(ctx, { type:'line', data:{ labels, datasets:[{ label:'Visits', data: values, borderColor:'#58a6ff', backgroundColor:'rgba(88,166,255,.25)', tension:.3, pointRadius:2 }]}, options:{ plugins:{ legend:{ labels:{ color:'#e6edf3' } } }, scales:{ x:{ ticks:{ color:'#cfe6ff'}}, y:{ ticks:{ color:'#cfe6ff'}} }}});
    charts.push(chart);
  });

  refreshCoach(data);
}

refreshBtn.addEventListener('click', loadSites);
rangeSel.addEventListener('change', loadSites);

addSiteBtn.addEventListener('click', () => {
  siteId.value='';
  siteName.value='';
  siteRevenue.value=0;
  siteStatus.value='Active';
  document.getElementById('siteModalTitle').textContent = 'Add Site';
  siteModal.showModal();
});

siteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    name: siteName.value.trim(),
    revenue: Number(siteRevenue.value||0),
    status: siteStatus.value
  };
  if (!payload.name){ return; }

  if (siteId.value){
    const { error } = await supabase.from('sites').update(payload).eq('id', Number(siteId.value));
    if (error) console.error(error);
  } else {
    const { error } = await supabase.from('sites').insert(payload);
    if (error) console.error(error);
  }
  siteModal.close();
  loadSites();
});

delCancel.addEventListener('click', ()=> confirmModal.close());
delOk.addEventListener('click', async ()=> {
  const id = Number(delOk.dataset.id);
  const { error } = await supabase.from('sites').delete().eq('id', id);
  if (error) console.error(error);
  confirmModal.close();
  loadSites();
});

const nicheList = document.getElementById('nicheList');
const nicheEmpty = document.getElementById('nicheEmpty');
const kwTbody = document.getElementById('kwTbody');
const kwTitle = document.getElementById('kwTitle');

async function loadNiches(){
  const { data, error } = await supabase.from('keyword_metrics').select('niche, keyword, volume, competition');
  if (error){ console.error(error); return; }
  kwTbody.innerHTML='';
  nicheList.innerHTML='';

  if (!data || data.length===0){
    nicheEmpty.classList.remove('hidden');
    return;
  }
  nicheEmpty.classList.add('hidden');

  const byNiche = {};
  data.forEach(r => { (byNiche[r.niche] ||= []).push(r); });

  Object.keys(byNiche).sort().forEach(n => {
    const btn = document.createElement('button');
    btn.textContent = n;
    btn.addEventListener('click', () => renderKeywords(n, byNiche[n]));
    nicheList.appendChild(btn);
  });

  const first = Object.keys(byNiche)[0];
  if (first) renderKeywords(first, byNiche[first]);
}

function renderKeywords(niche, rows){
  kwTitle.textContent = `🔎 Keywords — ${niche}`;
  kwTbody.innerHTML='';
  rows.sort((a,b)=> (b.volume||0)-(a.volume||0)).forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.keyword}</td><td>${r.volume||0}</td><td>${r.competition||''}</td>`;
    kwTbody.appendChild(tr);
  });
}

function refreshCoach(sites){
  const points = [];
  if (!sites || sites.length===0){
    points.push("No sites yet. Add your first site to start receiving recommendations.");
  } else {
    const sorted = [...sites].sort(sortByRevenue);
    const top = sorted[0];
    points.push(`Overview — <b>${top.name}</b> is leading with <b>$${(top.revenue||0).toLocaleString()}</b> in revenue.`);

    const withTraffic = sites.map(s => {
      let series = [];
      try { series = typeof s.traffic==='string'? JSON.parse(s.traffic): (s.traffic||[]); } catch(_) {}
      const last = series.at(-1)?.visits || 0;
      return { name:s.name, last };
    }).sort((a,b)=> a.last-b.last);
    if (withTraffic.length){
      const worst = withTraffic[0];
      points.push(`Risk — <b>${worst.name}</b> has the weakest recent traffic. Consider a 3‑post refresh and stronger internal links.`);
    }

    const lowRev = sorted.at(-1);
    if (lowRev){
      points.push(`Opportunity — Increase cadence on <b>${lowRev.name}</b>. Publish 3 low‑competition posts this week.`);
    }
  }
  coachBody.innerHTML = points.map(p=> `<div class="point info">${p}</div>`).join('');
  coachPrompt.value = `You are my content strategist. Using my site's traffic trends and low-competition keywords, generate a 2-week content plan with 8 blog posts, each with titles, outlines (H2/H3), and internal link suggestions. Prioritize quick wins. Output as a checklist.`;
}

aiToggle.addEventListener('click', () => coach.classList.toggle('hidden'));
coachClose.addEventListener('click', () => coach.classList.add('hidden'));
copyPrompt.addEventListener('click', () => { coachPrompt.select(); document.execCommand('copy'); });

loadSites();
loadNiches();
