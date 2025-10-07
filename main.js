import { getClient } from './supabase-client.js';
const supa = getClient();
const LS_KEY='nm_cache_v1';
const DEFAULT_STATE={niches:['drone mapping','portable power stations','ai side hustles'],keywords:{},current:null};
const state = loadCache();
const $=(q,el=document)=>el.querySelector(q);
const nicheList=$('#nicheList'), kwTbody=$('#kwTbody'), nicheInput=$('#nicheInput');
$('#addNicheBtn').addEventListener('click', onAddNiche);
$('#refreshBtn').addEventListener('click', bootstrap);
$('#clearBtn').addEventListener('click', clearCache);
const drawer=$('#drawer'), overlay=$('#drawerOverlay');
const closeDrawer=()=>{drawer.classList.remove('open');overlay.classList.remove('open')};
$('#drawerClose').addEventListener('click', closeDrawer); overlay.addEventListener('click', closeDrawer);
$('#genBlogBtn').addEventListener('click',()=>{if(!state.current)return;setOut('Blog Outline', makeBlogOutline(state.current))});
$('#genShortsBtn').addEventListener('click',()=>{if(!state.current)return;setOut('Shorts Script', makeShorts(state.current))});
$('#genPinsBtn').addEventListener('click',()=>{if(!state.current)return;setOut('Pinterest Pins', makePins(state.current))});
$('#addAffBtn').addEventListener('click',()=>{if(!state.current)return;setOut('Affiliate Ideas', makeAff(state.current))});
$('#copyOutBtn').addEventListener('click',()=>{const v=$('#outputBox').value; if(v) navigator.clipboard.writeText(v);});
async function onAddNiche(){
  const v=(nicheInput.value||'').trim();
  if(!v) return;
  if(!state.niches.includes(v)) state.niches.unshift(v);
  nicheInput.value='';
  saveCache(); renderNiches();
  if(supa){ try{ await supa.from('niches').insert({ title: v }); }catch(e){ console.warn('supa insert niche:', e.message) } }
  loadKeywords(v);
}
function clearCache(){
  if(!confirm('Clear cached niches & keywords (offline cache only)?')) return;
  localStorage.removeItem(LS_KEY);
  Object.assign(state, JSON.parse(JSON.stringify(DEFAULT_STATE)));
  renderNiches(); kwTbody.innerHTML='';
}
bootstrap();
async function bootstrap(){
  if(supa){
    const { data, error } = await supa.from('niches').select('title').order('title',{ascending:true});
    if(!error && Array.isArray(data) && data.length){
      state.niches = [...new Set(data.map(r=>r.title))];
      saveCache();
    }
  }
  renderNiches();
  if(state.niches[0]) loadKeywords(state.niches[0]);
}
function renderNiches(){
  nicheList.innerHTML='';
  if(state.niches.length===0){ nicheList.innerHTML='<li>No niches yet. Add one above.</li>'; return; }
  state.niches.forEach(n=>{
    const li=document.createElement('li');
    li.innerHTML=`<span>${esc(n)}</span><button class="btn open-btn">Load keywords</button>`;
    li.addEventListener('click',()=>loadKeywords(n));
    nicheList.appendChild(li);
  });
}
async function loadKeywords(niche){
  if(supa){
    try{
      const { data, error } = await supa.from('keywords').select('keyword, score, intent, trend').eq('niche', niche).limit(50);
      if(!error && data && data.length){
        state.keywords[niche] = data.map(r=>({ keyword:r.keyword, score:r.score??70, intent:r.intent||'Informational', trend:parseTrend(r.trend) }));
        saveCache(); return renderKeywords(niche);
      }
    }catch(e){ console.warn('supa load keywords:', e.message) }
  }
  const rows = genKeywords(niche);
  state.keywords[niche]=rows; saveCache(); renderKeywords(niche);
  if(supa){
    try{ await supa.from('keywords').insert(rows.map(r=>({ niche, keyword:r.keyword, score:r.score, intent:r.intent, trend:r.trend.cls }))); }
    catch(e){ console.warn('supa seed keywords:', e.message) }
  }
}
function renderKeywords(niche){
  const rows=state.keywords[niche]||[];
  kwTbody.innerHTML=rows.map(r=>`
    <tr class="kw-row">
      <td><button class="link-btn kw-open" data-k="${encodeURIComponent(JSON.stringify(r))}" data-n="${encodeURIComponent(niche)}">${esc(r.keyword)}</button></td>
      <td><span class="pill"><span class="score">${r.score}</span></span></td>
      <td>${r.intent}</td>
      <td><span class="pill"><span class="trend ${r.trend.cls}">${r.trend.icon}</span></span></td>
      <td><button class="btn open-btn kw-open" data-k="${encodeURIComponent(JSON.stringify(r))}" data-n="${encodeURIComponent(niche)}">Open ➜</button></td>
    </tr>
  `).join('');
}
document.querySelector('#kwTbody').addEventListener('click', e=>{
  const b=e.target.closest('.kw-open'); if(!b) return;
  const niche=decodeURIComponent(b.dataset.n);
  const data=JSON.parse(decodeURIComponent(b.dataset.k));
  openDrawer({ niche, ...data });
});
function openDrawer({ niche, keyword, score, intent, trend }){
  state.current={ niche, keyword, score, intent, trend };
  document.querySelector('#drawerNiche').textContent=niche;
  document.querySelector('#drawerKeyword').textContent=keyword;
  document.querySelector('#drawerMeta').textContent=`${score} • ${intent} • ${trend.icon}`;
  setOut('Output',''); document.querySelector('#drawerOverlay').classList.add('open'); document.querySelector('#drawer').classList.add('open');
}
function setOut(title, text){ document.querySelector('#outputTitle').textContent=title; document.querySelector('#outputBox').value=text; }
function makeBlogOutline({ niche, keyword }){return `# Blog Outline – ${keyword}

## 1) Intro (why ${niche})
- Hook with a current stat or problem
- Who this post is for
- What readers will learn

## 2) Quick Answer / TL;DR
- 3–5 bullets with practical tips

## 3) Step-by-step
- Step 1: …
- Step 2: …
- Step 3: …

## 4) Tools & Examples
- Tool A – when to use it
- Tool B – when to use it
- Real example or mini-case study

## 5) FAQs
- Question 1, short answer
- Question 2, short answer

## 6) Call to Action
- Internal links to related posts
- Optional affiliate suggestions
`}
function makeShorts({ keyword }){return `// YouTube Shorts Script – ${keyword}
[0–1s] Pattern interrupt + promise
[1–3s] Show the core tip
[3–6s] Mini demo on screen
[6–10s] Add contrast (before/after)
[10–14s] Bonus tip or caution
[14–17s] CTA: 'Follow for more ${keyword} tips'`}
function makePins({ keyword }){return `Pinterest Pin Ideas – ${keyword}
1) Checklist vertical pin
2) Before / After split
3) '3 Mistakes' carousel
4) Minimal text with big image
5) Template bundle preview`}
function makeAff({ niche, keyword }){return `Affiliate Ideas – ${niche} / ${keyword}
- Discovery: comparison / roundup
- Consideration: buyer's guide
- Decision: review + coupon
- Post-conversion: how-to setup guide (reduces refunds)`}
function genKeywords(niche){
  const base=['best {N} 2025','{N} for beginners','{N} guide','how to start {N}','{N} tips and tricks','{N} tools','is {N} worth it','{N} cost','{N} vs alternatives','{N} mistakes to avoid'];
  return base.map(s=>{const k=s.replaceAll('{N}', niche.replace(/s$/,''));return { keyword:k, score:rand(60,95), intent:pick(['Informational','Commercial'],[0.7,0.3]), trend:trend() }});
}
function parseTrend(t){const cls=(t==='up'||t==='down'||t==='flat')?t:'flat';return {cls, icon: cls==='up'?'↗':cls==='down'?'↘':'→'}}
function loadCache(){try{const raw=localStorage.getItem(LS_KEY);if(!raw)return JSON.parse(JSON.stringify(DEFAULT_STATE));const o=JSON.parse(raw);return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)),o)}catch(e){return JSON.parse(JSON.stringify(DEFAULT_STATE))}}
function saveCache(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function pick(arr,weights){if(!weights)return arr[rand(0,arr.length-1)];const t=weights.reduce((s,x)=>s+x,0);let r=Math.random()*t;for(let i=0;i<arr.length;i++){r-=weights[i];if(r<=0)return arr[i]}return arr[arr.length-1]}
function trend(){const t=pick(['up','flat','down'],[0.55,0.25,0.20]);return { cls:t, icon: t==='up'?'↗':t==='down'?'↘':'→' } }
function esc(s){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}
