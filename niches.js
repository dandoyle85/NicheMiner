import { supabase, mockMode } from '/src/lib/supabase.js';
let kwChart;
async function fetchKeywords(niche){
  if (mockMode){
    const all=[
      { niche:'Drones', keyword:'best drone for beginners', volume:5400, competition:'medium' },
      { niche:'Drones', keyword:'cheap drones with camera', volume:7200, competition:'high' },
      { niche:'AI Tools', keyword:'free ai logo generator', volume:8900, competition:'medium' },
      { niche:'AI Tools', keyword:'ai video editor free', volume:12000, competition:'high' },
      { niche:'Smart Home Devices', keyword:'best smart thermostat 2025', volume:3500, competition:'low' },
      { niche:'Smart Home Devices', keyword:'wifi smart plugs', volume:7800, competition:'medium' },
    ];
    return niche? all.filter(k=>k.niche===niche): all;
  }
  let q = supabase.from('keyword_metrics').select('*'); if (niche) q = q.eq('niche', niche);
  const { data, error } = await q; if (error){ console.error(error); return []; } return data||[];
}
function renderKeywords(rows){
  const tbody=document.querySelector('#keywordTable tbody'); tbody.innerHTML='';
  rows.sort((a,b)=>(b.volume||0)-(a.volume||0)).forEach(k=>{
    const tr=document.createElement('tr'); tr.innerHTML=`<td>${k.keyword}</td><td>${k.niche}</td><td>${k.volume||0}</td><td>${k.competition||'unknown'}</td>`; tbody.appendChild(tr);
  });
}
function renderKwChart(rows){
  const top=rows.slice(0,5); const labels=top.map(r=>r.keyword); const data=top.map(r=>r.volume||0);
  const ctx=document.getElementById('kwChart'); if (kwChart) kwChart.destroy();
  kwChart=new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'Volume',data}]},options:{plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(45,66,99,.25)'}}}}});
}
function renderFilters(rows){
  const wrap=document.getElementById('nicheFilters'); wrap.innerHTML=''; const niches=[...new Set(rows.map(r=>r.niche))];
  niches.forEach(n=>{ const b=document.createElement('button'); b.textContent=n; b.onclick=async()=>{ const filtered=await fetchKeywords(n); renderKeywords(filtered); renderKwChart(filtered); }; wrap.appendChild(b); });
}
export async function renderNiches(){ const rows=await fetchKeywords(); renderFilters(rows); renderKeywords(rows); renderKwChart(rows); }
window.addEventListener('DOMContentLoaded', renderNiches);
