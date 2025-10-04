import { coachFromNiches, coachFromKeywords } from '/ai-coach.js';

async function j(url){
  try{ const r=await fetch(url,{headers:{'cache-control':'no-cache'}}); return {ok:true,data:await r.json()}; }
  catch(e){ return {ok:false,error:String(e)}; }
}

export function initNiches(onDebug, updateStatusBubble){
  const table = document.getElementById('nicheTable').querySelector('tbody');
  const empty = document.getElementById('nicheEmpty');
  const status = document.getElementById('nicheStatus');
  const drillPanel = document.getElementById('drillPanel');
  const drillTitle = document.getElementById('drillTitle');
  const kwTable = document.getElementById('kwTable').querySelector('tbody');
  const kwEmpty = document.getElementById('kwEmpty');
  const genPrompt = document.getElementById('genPrompt');
  const gptPaste = document.getElementById('gptPaste');
  const importGpt = document.getElementById('importGpt');
  const openCoach = document.getElementById('openCoach');

  function emitStatus(sourceId, status, message){ updateStatusBubble && updateStatusBubble({sourceId, status, message}); }
  function dbg(source, status, message){ onDebug && onDebug({ source, status, message }); }

  async function pull(single){
    const all=[];
    async function call(id, name, path, map){
      const {ok,data,error}=await j(path);
      if(!ok || data?.error){ emitStatus(id,'err',error||data?.error||''); dbg(name,'error',error||data?.error||''); return []; }
      const items=map(data);
      const st=items.length?'ok':'warn';
      emitStatus(id, st, `${items.length} items`);
      dbg(name, st, `${items.length} items`);
      return items;
    }
    const calls=[
      ['serpapi','SerpAPI','/functions/serpapi', d=>(d.items||[]).map(x=>({niche:x.niche||x.keyword, source:'SerpAPI', trend:true}))],
      ['google','Google','/functions/google?q=ideas', d=>(d.items||[]).map(x=>({niche:x.keyword, source:'Google'}))],
      ['amazon','Amazon','/functions/amazon?q=ideas', d=>(d.items||[]).map(x=>({niche:x.keyword, source:'Amazon'}))],
      ['reddit','Reddit','/functions/reddit?sub=Entrepreneur', d=>(d.items||[]).map(x=>({niche:x.keyword||x.title, source:'Reddit'}))],
      ['youtube','YouTube','/functions/youtube?q=ideas', d=>(d.items||[]).map(x=>({niche:x.keyword, source:'YouTube'}))],
      ['wiki','Wiki','/functions/wiki', d=>(d.items||[]).map(x=>({niche:x.keyword, source:'Wiki'}))],
      ['pinterest','Pinterest','/functions/pinterest?q=ideas', d=>(d.items||[]).map(x=>({niche:x.keyword, source:'Pinterest'}))]
    ];
    for (const [id,name,path,map] of calls){
      if (single && single!=='all' && id!==single) continue;
      const items = await call(id,name,path,map);
      items.forEach(i=>all.push(i));
    }
    // dedupe + score
    const m=new Map();
    for(const it of all){
      const k=(it.niche||'').toLowerCase(); if(!k) continue;
      const prev=m.get(k)||{niche:it.niche,sources:new Set(),trend:false};
      prev.sources.add(it.source); prev.trend = prev.trend || !!it.trend;
      m.set(k, prev);
    }
    const rows=[...m.values()].map(x=>{
      const sources=[...x.sources]; const buyer = sources.some(s=>['Amazon','Pinterest'].includes(s))?'High':(sources.includes('Google')?'Medium':'Low');
      const comp = sources.length>=3?'Medium':'Low';
      const score = Math.min(100, Math.round(50 + Math.min(30, sources.length*10) + (x.trend?10:0)));
      return { niche:x.niche, sources, trend:x.trend, buyerIntent:buyer, competition:comp, score };
    }).sort((a,b)=>b.score-a.score).slice(0,15);
    return rows;
  }

  async function load(single){
    status.textContent = 'Scanning…'; table.innerHTML=''; empty.classList.add('hidden');
    const rows = await pull(single);
    if(!rows.length){ empty.classList.remove('hidden'); status.textContent='No results'; return; }
    status.textContent = `Found ${rows.length}`;
    rows.forEach((n,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${i===0?'<span class="badge top">Top Pick</span> ':''}${n.niche}</td><td>${n.score}</td><td>${n.buyerIntent}</td><td>${n.competition}</td><td>${n.trend?'📈':'—'}</td><td><button class="cta small" data-drill="${encodeURIComponent(n.niche)}">Drilldown</button></td>`;
      table.appendChild(tr);
    });
    // coach
    const pts = coachFromNiches(rows);
    const coachEl = document.getElementById('coachContent'); if (coachEl) coachEl.innerHTML = pts.map(p=>`<div class="point">${p}</div>`).join('');
  }

  async function drill(niche){
    drillPanel.hidden=false; drillTitle.textContent=`🔎 Keyword Drilldown — ${decodeURIComponent(niche)}`;
    kwTable.innerHTML=''; kwEmpty.classList.add('hidden');
    const res = await Promise.allSettled([
      fetch('/functions/google?q='+encodeURIComponent(decodeURIComponent(niche))).then(r=>r.json()),
      fetch('/functions/youtube?q='+encodeURIComponent(decodeURIComponent(niche))).then(r=>r.json()),
      fetch('/functions/reddit?sub=Entrepreneur').then(r=>r.json())
    ]);
    let items=[];
    res.forEach((r,i)=>{
      if(r.status==='fulfilled'){
        const list=r.value?.items||[]; const s=i===0?'Google':(i===1?'YouTube':'Reddit');
        list.forEach(x=>items.push({keyword:x.keyword||x.title, source:s}));
      }
    });
    // dedupe
    const seen=new Set(); const clean=[];
    for(const it of items){ const k=(it.keyword||'').toLowerCase(); if(k && !seen.has(k)){ seen.add(k); clean.push(it);}}
    if(!clean.length){ kwEmpty.classList.remove('hidden'); }
    clean.slice(0,120).forEach(it=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${it.keyword}</td><td><span class="badge live">${it.source}</span></td><td></td><td></td><td></td><td><button class="ghost small">Save</button></td>`;
      kwTable.appendChild(tr);
    });
    const pts = coachFromKeywords(clean);
    const coachEl = document.getElementById('coachContent'); if (coachEl) coachEl.innerHTML = pts.map(p=>`<div class="point">${p}</div>`).join('');
  }

  document.getElementById('nicheTable').addEventListener('click', (e)=>{
    const b=e.target.closest('[data-drill]'); if(!b) return; drill(b.dataset.drill);
  });

  genPrompt.onclick=()=>{
    const current=(document.getElementById('drillTitle').textContent||'').replace('🔎 Keyword Drilldown — ','')||'YOUR NICHE';
    gptPaste.value=`Give me 25 low-competition keywords for the niche "${current}". For each, estimate monthly search volume (low/med/high), CPC ($), and difficulty (low/med/high). Return as a Markdown table with headers: Keyword | Volume | CPC | Competition.`;
  };
  importGpt.onclick=()=>{
    const txt=gptPaste.value||''; const lines=txt.split('\n').filter(l=>/(\|,)/.test(l)&&!/---/.test(l));
    const tb=document.getElementById('kwTable').querySelector('tbody');
    for(let i=1;i<lines.length;i++){ const cols=lines[i].split('|').map(c=>c.trim()); if(cols.length<4) continue;
      const tr=document.createElement('tr'); tr.innerHTML=`<td>${cols[0]}</td><td><span class="badge gpt">GPT</span></td><td>${cols[1]}</td><td>${cols[3]}</td><td></td><td></td>`; tb.appendChild(tr); }
  };
  openCoach.addEventListener('click',()=>document.querySelector('[data-tab="coach"]').click());

  window.addEventListener('refresh-source',(ev)=>{ const which=ev.detail?.source||'all'; load(which); });

  load('all');
}
