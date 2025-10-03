import { supabase, mockMode } from '/src/lib/supabase.js';
let chart;
async function getSites(){
  if (mockMode){ return [
    { id:1,name:'Drone Empire',revenue:1500,status:'Active',traffic:[{day:'2025-09-28',visits:320},{day:'2025-09-29',visits:280},{day:'2025-09-30',visits:300}]},
    { id:2,name:'AI Tools Hub',revenue:900,status:'Cooling',traffic:[{day:'2025-09-28',visits:200},{day:'2025-09-29',visits:180},{day:'2025-09-30',visits:190}]},
    { id:3,name:'Smart Home Devices',revenue:600,status:'Scaling',traffic:[{day:'2025-09-28',visits:150},{day:'2025-09-29',visits:160},{day:'2025-09-30',visits:140}]},
  ]; }
  const { data, error } = await supabase.from('sites').select('*'); if (error){ console.error(error); return []; }
  return (data||[]).map(s=>({...s,traffic:Array.isArray(s.traffic)?s.traffic:(s.traffic?JSON.parse(s.traffic):[])}));
}
function renderTable(sites){
  const tbody=document.querySelector('#empireTable tbody'); tbody.innerHTML='';
  sites.sort((a,b)=>(b.revenue||0)-(a.revenue||0)).forEach(s=>{
    const tr=document.createElement('tr'); tr.innerHTML=`<td>${s.name}</td><td>$${s.revenue||0}</td><td>${s.status||'OK'}</td>`; tbody.appendChild(tr);
  });
}
function renderTrafficChart(sites){
  const top=sites[0]||{traffic:[]}; const labels=(top.traffic||[]).map(p=>p.day); const data=(top.traffic||[]).map(p=>p.visits);
  const ctx=document.getElementById('trafficChart'); if (chart) chart.destroy();
  chart=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:top.name||'Traffic',data,tension:.35}]},options:{plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(45,66,99,.25)'}}}}});
}
export async function renderEmpire(){ const sites=await getSites(); renderTable(sites); renderTrafficChart(sites); }
window.addEventListener('DOMContentLoaded', renderEmpire);
