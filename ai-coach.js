import { supabase, mockMode } from '/src/lib/supabase.js';
function el(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }
async function getEmpireData(){
  if (mockMode){ return [
    { name:'Drone Empire', revenue:1500, status:'Active', traffic:[{day:'2025-09-28',visits:320},{day:'2025-09-29',visits:280},{day:'2025-09-30',visits:300}]},
    { name:'AI Tools Hub', revenue:900, status:'Cooling', traffic:[{day:'2025-09-28',visits:200},{day:'2025-09-29',visits:180},{day:'2025-09-30',visits:190}]},
    { name:'Smart Home Devices', revenue:600, status:'Scaling', traffic:[{day:'2025-09-28',visits:150},{day:'2025-09-29',visits:160},{day:'2025-09-30',visits:140}]},
  ]; }
  const { data, error } = await supabase.from('sites').select('*'); if (error){ console.error(error); return []; }
  return (data||[]).map(s=>({...s,traffic:Array.isArray(s.traffic)?s.traffic:(s.traffic?JSON.parse(s.traffic):[])}));
}
async function getNicheData(){
  if (mockMode){ return [
    { niche:'Drones', keyword:'best drone for beginners', volume:5400, competition:'medium' },
    { niche:'Drones', keyword:'cheap drones with camera', volume:7200, competition:'high' },
    { niche:'AI Tools', keyword:'free ai logo generator', volume:8900, competition:'medium' },
    { niche:'Smart Home Devices', keyword:'wifi smart plugs', volume:7800, competition:'medium' },
  ]; }
  const { data, error } = await supabase.from('keyword_metrics').select('*'); if (error){ console.error(error); return []; } return data||[];
}
function pick(arr, fn, fallback={}){ if(!arr.length) return fallback; return arr.reduce((best,cur)=> fn(best,cur)?cur:best, arr[0]); }
function buildPoints(points){ const wrap=document.getElementById('coachBody'); wrap.innerHTML=''; points.forEach(p=>{ wrap.appendChild(el(`<div class="point ${p.class}"><div class="badge">${p.badge}</div><div>${p.text}</div></div>`)); }); }
async function analyze(){
  const tab = window.ACTIVE_TAB || 'empire';
  if (tab==='empire'){
    const sites = await getEmpireData();
    if (!sites.length){ return buildPoints([
      { class:'p-overview', badge:'Overview', text:'No sites yet. Add your first site to start tracking revenue.'},
      { class:'p-risk', badge:'Risk', text:'Without data, we cannot model churn or seasonality.'},
      { class:'p-opp', badge:'Opportunity', text:'Seed one site and enable auto‑blog for quick wins.'}
    ]); }
    const topRev = pick(sites,(a,b)=>(b.revenue||0)>(a.revenue||0));
    const lowTraffic = pick(sites,(a,b)=>{const av=(a.traffic?.at(-1)?.visits)||0; const bv=(b.traffic?.at(-1)?.visits)||0; return bv<av;});
    const opportunity = pick(sites,(a,b)=> (a.revenue||0)>(b.revenue||0));
    return buildPoints([
      { class:'p-overview', badge:'Overview', text:`Your top site <b>${topRev.name}</b> is leading with <b>$${topRev.revenue||0}</b> revenue.`},
      { class:'p-risk', badge:'Risk', text:`<b>${lowTraffic.name}</b> shows the weakest recent traffic — consider content refresh and internal links.`},
      { class:'p-opp', badge:'Opportunity', text:`Increase posting cadence on <b>${opportunity.name}</b> — add 3 low‑comp posts this week.`}
    ]);
  }
  if (tab==='niches'){
    const kws = await getNicheData();
    if (!kws.length){ return buildPoints([
      { class:'p-overview', badge:'Overview', text:'No keywords stored yet. Use the drill to collect 50 keywords.'},
      { class:'p-risk', badge:'Risk', text:'Relying on a single niche increases volatility.'},
      { class:'p-opp', badge:'Opportunity', text:'Target 3 long‑tail queries with “how/why/near me” intents.'}
    ]); }
    const topVol = pick(kws,(a,b)=>(b.volume||0)>(a.volume||0));
    const risky = kws.find(k=>String(k.competition).toLowerCase()==='high') || topVol;
    const opp = kws.find(k=>String(k.competition).toLowerCase()==='low') || topVol;
    return buildPoints([
      { class:'p-overview', badge:'Overview', text:`Top keyword: <b>${topVol.keyword}</b> in <b>${topVol.niche}</b> (~${topVol.volume||0}/mo).`},
      { class:'p-risk', badge:'Risk', text:`<b>${risky.keyword}</b> is high competition — expect slower time‑to‑rank.`},
      { class:'p-opp', badge:'Opportunity', text:`Prioritize <b>${opp.keyword}</b> — lower competition with solid volume.`}
    ]);
  }
  buildPoints([
    { class:'p-overview', badge:'Overview', text:'Empire initialized. Use Empire/Niches tabs for focused advice.'},
    { class:'p-risk', badge:'Risk', text:'No context selected — insights limited.'},
    { class:'p-opp', badge:'Opportunity', text:'Open Niches and collect 50 keywords in a hot category.'}
  ]);
}
export function toggleCoach(open){ const box=document.getElementById('aiCoach'); if (open){ box.classList.remove('hidden'); analyze(); } else { box.classList.add('hidden'); } }
console.log('[AI Coach Ready] Click 💡 for live analysis');
