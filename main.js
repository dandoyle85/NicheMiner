import { getClient } from './supabase-client.js';
const supa = getClient();
const LS_KEY='nm_cache_wp_v1';
const DEFAULT_STATE={niches:['drone mapping','portable power stations','ai side hustles'],keywords:{},current:null,offsets:{}};
const state = loadCache();
const $=(q,el=document)=>el.querySelector(q);
const nicheList=$('#nicheList'), kwTbody=$('#kwTbody'), nicheInput=$('#nicheInput');
$('#addNicheBtn').addEventListener('click', onAddNiche);
$('#refreshBtn').addEventListener('click', bootstrap);
$('#clearBtn').addEventListener('click', clearCache);
$('#loadMoreBtn').addEventListener('click', ()=>{ if(state.currentNiche) loadKeywords(state.currentNiche, true) });
const drawer=$('#drawer'), overlay=$('#drawerOverlay');
const closeDrawer=()=>{drawer.classList.remove('open');overlay.classList.remove('open')};
$('#drawerClose').addEventListener('click', closeDrawer); overlay.addEventListener('click', closeDrawer);
$('#genBlogBtn').addEventListener('click',()=>{if(!state.current)return;setOut('AdSense-Ready Blog', makeAdsenseBlog(state.current))});
$('#genShortsBtn').addEventListener('click',()=>{if(!state.current)return;setOut('Shorts Script', makeShorts(state.current))});
$('#genPinsBtn').addEventListener('click',()=>{if(!state.current)return;setOut('Pinterest Pins', makePins(state.current))});
$('#genEbookBtn').addEventListener('click',()=>{if(!state.current)return;setOut('eBook Outline (KDP-Ready)', makeEbook(state.current))});
$('#addAffBtn').addEventListener('click',()=>{if(!state.current)return;setOut('Affiliate Ideas', makeAff(state.current))});
$('#copyOutBtn').addEventListener('click',()=>{const v=$('#outputBox').value; if(v) navigator.clipboard.writeText(v);});
$('#exportMdBtn').addEventListener('click',()=>{
  const v=$('#outputBox').value||''; if(!v) return;
  const blob = new Blob([v], {type:'text/markdown'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = (state.current?.keyword||'export') + '.md'; a.click(); URL.revokeObjectURL(a.href);
});
document.querySelector('#saveToTrackerBtn').addEventListener('click', saveToTracker);
document.querySelector('#saveToWordPressBtn').addEventListener('click', saveToWordPress);
document.querySelector('#kwTbody').addEventListener('click', e=>{
  const open=e.target.closest('.kw-open'); if(open){
    const niche=decodeURIComponent(open.dataset.n);
    const data=JSON.parse(decodeURIComponent(open.dataset.k));
    return openDrawer({ niche, ...data });
  }
  const drill=e.target.closest('.drill .chip'); if(drill){
    const k=drill.dataset.keyword; const n=drill.dataset.niche;
    return openDrawer({ niche:n, keyword:k, score:rand(60,95), intent:'Informational', trend:trend() });
  }
});
async function onAddNiche(){
  const v=(nicheInput.value||'').trim();
  if(!v) return;
  if(!state.niches.includes(v)) state.niches.unshift(v);
  nicheInput.value='';
  saveCache(); renderNiches();
  if(supa){ try{ await supa.from('niches').insert({ title: v }); }catch(e){ console.warn('supa insert niche:', e.message) } }
  state.currentNiche=v; loadKeywords(v, false, true);
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
  if(state.niches[0]){ state.currentNiche=state.niches[0]; loadKeywords(state.niches[0], false, true); }
}
function renderNiches(){
  nicheList.innerHTML='';
  if(state.niches.length===0){ nicheList.innerHTML='<li>No niches yet. Add one above.</li>'; return; }
  state.niches.forEach(n=>{
    const li=document.createElement('li');
    li.innerHTML=`<span>${esc(n)}</span><button class="btn open-btn">Load keywords</button>`;
    li.addEventListener('click',()=>{ state.currentNiche=n; state.offsets[n]=0; loadKeywords(n, false, true) });
    nicheList.appendChild(li);
  });
}
async function loadKeywords(niche, more=false, resetOffset=false){
  const limit=20;
  if(resetOffset || state.offsets[niche]==null) state.offsets[niche]=0;
  const offset = more ? (state.offsets[niche]||0) + limit : (state.offsets[niche]||0);
  state.offsets[niche]=offset;
  let rows=[];
  if(supa){
    try{
      const { data: used } = await supa.from('content_tracker').select('keyword').eq('niche', niche);
      const usedSet = new Set((used||[]).map(r=> (r.keyword||'').toLowerCase()));
      const { data, error } = await supa.from('keywords')
        .select('keyword, score, intent, trend')
        .eq('niche', niche).range(offset, offset+limit-1);
      if(!error && data && data.length){
        rows = data
          .map(r=>({ keyword:r.keyword, score:r.score??70, intent:r.intent||'Informational', trend:parseTrend(r.trend) }))
          .filter(r=> !usedSet.has((r.keyword||'').toLowerCase()));
      }
    }catch(e){ console.warn('supa load keywords:', e.message) }
  }
  if(!rows.length){
    rows = genKeywords(niche, limit);
    if(supa){
      try{ await supa.from('keywords').insert(rows.map(r=>({ niche, keyword:r.keyword, score:r.score, intent:r.intent, trend:r.trend.cls }))); }
      catch(e){ console.warn('supa seed keywords:', e.message) }
    }
  }
  if(!more || !state.keywords[niche]) state.keywords[niche]=[];
  state.keywords[niche] = more ? (state.keywords[niche].concat(rows)) : rows;
  saveCache(); renderKeywords(niche);
}
function renderKeywords(niche){
  const rows=state.keywords[niche]||[];
  kwTbody.innerHTML=rows.map(r=>{
    const drill = genLongTail(r.keyword).map(k=>`<span class="chip" data-niche="${enc(niche)}" data-keyword="${enc(k)}">${esc(k)}</span>`).join('');
    return `
    <tr class="kw-row">
      <td>
        <button class="link-btn kw-open" data-k="${enc(JSON.stringify(r))}" data-n="${enc(niche)}">${esc(r.keyword)}</button>
        <div class="drill"><h4>Related long-tails</h4>${drill}</div>
      </td>
      <td><span class="pill"><span class="score">${r.score}</span></span></td>
      <td>${r.intent}</td>
      <td><span class="pill"><span class="trend ${r.trend.cls}">${r.trend.icon}</span></span></td>
      <td><button class="btn open-btn kw-open" data-k="${enc(JSON.stringify(r))}" data-n="${enc(niche)}">Open ➜</button></td>
    </tr>`
  }).join('');
}
function openDrawer({ niche, keyword, score, intent, trend }){
  state.current={ niche, keyword, score, intent, trend };
  document.querySelector('#drawerNiche').textContent=niche;
  document.querySelector('#drawerKeyword').textContent=keyword;
  document.querySelector('#drawerMeta').textContent=`${score} • ${intent} • ${trend.icon}`;
  setOut('Output',''); document.querySelector('#drawerOverlay').classList.add('open'); document.querySelector('#drawer').classList.add('open');
}
function setOut(title, text){ document.querySelector('#outputTitle').textContent=title; document.querySelector('#outputBox').value=text; }
/* Save to Supabase Tracker */
async function saveToTracker(){
  if(!state.current) return alert('Pick a keyword first');
  if(!supa) return alert('Supabase not connected');
  const { niche, keyword } = state.current;
  try{
    await supa.from('content_tracker').insert({ niche, keyword, status: 'idea' });
    alert(`Saved "${keyword}" under ${niche}`);
  }catch(e){ alert('Error saving to tracker: '+e.message); }
}
/* Save to WordPress (and tracker) */
async function saveToWordPress(){
  if(!state.current) return alert('Pick a keyword first');
  const { niche, keyword } = state.current;
  const content = document.querySelector('#outputBox').value || makeAdsenseBlog(state.current);
  const WP_URL = (window.WP_URL||'').replace(/\/$/,''); // trim trailing slash
  const WP_USER = window.WP_USER||'';
  const WP_APP_PASSWORD = window.WP_APP_PASSWORD||'';
  if(!WP_URL || !WP_USER || !WP_APP_PASSWORD){
    return alert('Missing WordPress config (WP_URL, WP_USER, WP_APP_PASSWORD)');
  }
  try{
    if(supa){
      await supa.from('content_tracker').insert({ niche, keyword, status: 'draft' });
    }
    const auth = btoa(`${WP_USER}:${WP_APP_PASSWORD}`);
    const res = await fetch(`${WP_URL}/posts`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: keyword, content, status: "draft" })
    });
    if(!res.ok) throw new Error(await res.text());
    const data = await res.json();
    alert(`✅ Draft created on WordPress: ${data.link}`);
    if(supa){
      await supa.from('content_tracker').update({ status:'draft', url:data.link }).eq('keyword', keyword).eq('niche', niche);
    }
  }catch(e){ alert('WordPress error: '+e.message); }
}
/* Generators */
function makeAdsenseBlog({ niche, keyword }){
  const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const metaTitle = `${keyword} (${new Date().getFullYear()})`;
  const metaDesc = `Actionable guide to ${keyword} in ${niche} — tools, steps, and mistakes to avoid.`;
  return `<!-- SEO -->
<title>${metaTitle}</title>
<meta name="description" content="${metaDesc}" />

<!-- Schema -->
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"Article",
  "headline":"${metaTitle}",
  "about":"${niche}",
  "keywords":"${keyword}, ${niche}",
  "author":{"@type":"Organization","name":"NicheMiner"},
  "datePublished":"${new Date().toISOString()}"
}
</script>

<!-- AdSense placeholders -->
<div class="adsense-slot" data-ad-slot="slot-1"></div>

<article id="${slug}">
  <h1>${keyword}</h1>
  <p><em>Updated ${new Date().toLocaleDateString()}</em></p>

  <p><strong>TL;DR:</strong> Quick wins and pitfalls for ${keyword} in ${niche}.</p>

  <h2>Why ${keyword} matters</h2>
  <p>Explain the outcome, who benefits, and expected ROI.</p>

  <!-- AdSense -->
  <div class="adsense-slot" data-ad-slot="slot-2"></div>

  <h2>Step-by-step</h2>
  <ol>
    <li>Preparation</li>
    <li>Core process</li>
    <li>Optimization</li>
  </ol>

  <h2>Tools & templates</h2>
  <ul>
    <li>Tool A — quick note</li>
    <li>Tool B — quick note</li>
  </ul>

  <!-- Image placeholders (royalty-free) -->
  <figure><img alt="Example related to ${keyword}" src="https://source.unsplash.com/800x450/?${encodeURIComponent(niche)}" /><figcaption>${keyword} – illustrative image</figcaption></figure>

  <!-- AdSense -->
  <div class="adsense-slot" data-ad-slot="slot-3"></div>

  <h2>Common mistakes</h2>
  <ul>
    <li>Mistake 1 + fix</li>
    <li>Mistake 2 + fix</li>
  </ul>

  <h2>FAQs</h2>
  <details><summary>Question 1?</summary><p>Short answer.</p></details>
  <details><summary>Question 2?</summary><p>Short answer.</p></details>

  <h2>Next steps</h2>
  <p>Internal links and affiliate CTAs (replace tokens like {{AFFILIATE:Offer}}).</p>
</article>`;
}
function makeShorts({ keyword }){
  return `// YouTube Shorts Script – ${keyword}
[0–1s] Pattern interrupt + promise
[1–3s] Show the core tip
[3–6s] Mini demo on screen
[6–10s] Add contrast (before/after)
[10–14s] Bonus tip or caution
[14–17s] CTA: 'Follow for more ${keyword} tips'`;
}
function makePins({ keyword }){
  return `Pinterest Pin Ideas – ${keyword}
1) Checklist vertical pin
2) Before / After split
3) '3 Mistakes' carousel
4) Minimal text with big image
5) Template bundle preview`;
}
function makeEbook({ niche, keyword }){
  const year=new Date().getFullYear();
  const title = `The ${keyword.replace(/\b[a-z]/g, m=>m.toUpperCase())} Playbook (${year} Edition)`;
  const subtitle = `A practical guide to winning in ${niche}`;
  const kdpCats = ['Business & Money / Industries / eCommerce','Computers & Technology / Graphics & Design','Reference / Guides'];
  return `# ${title}
## ${subtitle}

**KDP Metadata**
- Primary category: ${kdpCats[0]}
- Alternate categories: ${kdpCats.slice(1).join('; ')}
- Keywords: ${keyword}, ${niche}, guide, checklist, templates
- Trim size: 6x9 in (recommended)
- Estimated length: 15,000–25,000 words
- Cover brief: Clean, bold title; ${niche} imagery; high-contrast subtitle

## Title Page
- Title, Subtitle, Author, Copyright

## Introduction
- Who this book is for
- Outcomes readers can expect
- How to use the playbook

## Chapter 1 — Foundations
- Core concepts, definitions, success metrics

## Chapter 2 — Tools & Stack
- Essential tools for ${keyword}
- Setup checklists

## Chapter 3 — Step-by-Step System
- The repeatable process from A to Z
- Worksheets / templates callouts

## Chapter 4 — Monetization & Scaling
- Where the profit is
- Pricing, funnels, ads, affiliate

## Chapter 5 — Case Studies
- 2–3 short success breakdowns

## Chapter 6 — Pitfalls & Compliance
- AdSense, platform policies, common mistakes

## Resources
- Templates, checklists, further reading

## About the Author
- 3–5 sentence bio

---
**Prompt to expand in ChatGPT:**  
"Turn this outline into a 20,000-word eBook in a friendly expert tone. Use Markdown headings, callouts, and checklists. Add examples and mini case studies."`;
}
function makeAff({ niche, keyword }){
  return `Affiliate Ideas — ${niche} / ${keyword}
- Discovery: comparison / roundup
- Consideration: buyer's guide
- Decision: review + coupon
- Post-conversion: setup guide (reduces refunds)`;
}
/* Data helpers */
function genKeywords(niche, n=20){
  const base=['best {N} 2025','{N} for beginners','{N} guide','how to start {N}','{N} tips and tricks','{N} tools','is {N} worth it','{N} cost','{N} vs alternatives','{N} mistakes to avoid'];
  const out=[]; for(let i=0;i<n;i++){ const s=base[i%base.length]; const k=s.replaceAll('{N}', niche.replace(/s$/,''));
    out.push({ keyword:k+(i>=base.length? ' ' + (i-base.length+1):''), score:rand(60,95), intent:pick(['Informational','Commercial'],[0.7,0.3]), trend:trend() }); }
  return out;
}
function genLongTail(keyword){
  const seeds=['best','cheap','near me','software','template','checklist','vs','for beginners','2025','examples'];
  return seeds.map(s=> (keyword+' '+s).toLowerCase());
}
/* Cache & utils */
function loadCache(){ try{ const raw=localStorage.getItem(LS_KEY); if(!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE)); const o=JSON.parse(raw); return Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), o);}catch(e){ return JSON.parse(JSON.stringify(DEFAULT_STATE)); } }
function saveCache(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function pick(arr,weights){if(!weights)return arr[rand(0,arr.length-1)];const t=weights.reduce((s,x)=>s+x,0);let r=Math.random()*t;for(let i=0;i<arr.length;i++){r-=weights[i];if(r<=0)return arr[i]}return arr[arr.length-1]}
function trend(){const t=pick(['up','flat','down'],[0.55,0.25,0.20]);return { cls:t, icon: t==='up'?'↗':t==='down'?'↘':'→' } }
function esc(s){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}
function enc(s){return encodeURIComponent(s)}
