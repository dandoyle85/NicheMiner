// ======= CONFIG =======
const $ = (sel) => document.querySelector(sel);

const SOURCES = [
  { id: "Google", label: "Google Autocomplete", url: "/api/suggest?q=profitable niches", weight: 1.0 },
  { id: "YouTube", label: "YouTube Autocomplete", url: "/api/ytsuggest?q=how to start", weight: 0.95 },
  { id: "Reddit", label: "Reddit Hot (r/Entrepreneur)", url: "/api/reddit?sub=Entrepreneur", weight: 1.0 },
  { id: "Wiki", label: "Wikipedia Top 25", url: "/api/wiki-top", weight: 0.85 },
  { id: "Trends", label: "Google Trends (fallback)", url: "/api/trends?q=side hustle&geo=US", weight: 1.1 },
  { id: "Pinterest", label: "Pinterest Trends", url: "/api/pinterest", weight: 0.9 },
  { id: "Amazon", label: "Amazon Best Sellers", url: "/api/amazon", weight: 0.9 },
  { id: "YTTrend", label: "YouTube Trending", url: "/api/youtube-trending", weight: 1.0 },
  { id: "XTrends", label: "X/Twitter Trends (Trends24)", url: "/api/x-trends", weight: 0.95 },
  { id: "PHunt", label: "ProductHunt Trending", url: "/api/producthunt", weight: 1.05 },
];

// ======= UI Elements =======
const refreshBtn = $("#refreshBtn");
const scanStatus = $("#scanStatus");
const pillsWrap = $("#statusPills");
const nichesTbody = $("#nichesTbody");
const drillPanel = $("#drillPanel");
const drillTitle = $("#drillTitle");
const kwTbody = $("#kwTbody");

const coachToggle = $("#coachToggle");
const coachPanel = $("#coachPanel");
const coachClose = $("#coachClose");
const coachBody = $("#coachBody");

const debugFab = $("#debugFab");
const debugPanel = $("#debugPanel");
const debugClose = $("#debugClose");
const debugBody = $("#debugBody");

const sourcesBtn = $("#sourcesBtn");
const sourcesDrawer = $("#sourcesDrawer");
const drawerClose = $("#drawerClose");
const sourcesList = $("#sourcesList");

// ======= State =======
const keyEnabled = "nm_sources_enabled_v1";
let enabled = loadEnabled();

function loadEnabled(){
  try{
    const raw = localStorage.getItem(keyEnabled);
    if (raw) return JSON.parse(raw);
  } catch(e){}
  // default: all on
  const map = {}; SOURCES.forEach(s=> map[s.id]=true);
  return map;
}
function saveEnabled(){ localStorage.setItem(keyEnabled, JSON.stringify(enabled)); }

// ======= Drawer Build =======
function buildDrawer(){
  sourcesList.innerHTML = SOURCES.map(s => {
    return `<div class="toggle" data-id="${s.id}">
      <div class="name"><span class="badge" id="b_${s.id}">●</span> ${s.label}</div>
      <div class="switch ${enabled[s.id]?'on':''}" data-sw="${s.id}"></div>
    </div>`;
  }).join("");
}

sourcesList.addEventListener("click", (e) => {
  const sw = e.target.closest(".switch"); if (!sw) return;
  const id = sw.getAttribute("data-sw");
  enabled[id] = !enabled[id];
  sw.classList.toggle("on", enabled[id]);
  saveEnabled();
});

// ======= Pills =======
function renderPills(){
  pillsWrap.innerHTML = SOURCES.map(s => `<span class="pill warn" id="p_${s.id}" title="${s.label}">${s.id}</span>`).join("");
}
function setPill(id, state, hint){
  const el = document.getElementById("p_"+id);
  if (!el) return;
  el.classList.remove("ok","warn","err");
  el.classList.add(state);
  if (hint) el.title = `${el.title} • ${hint}`;
  // Sync drawer badge
  const b = document.getElementById("b_"+id);
  if (b){ b.className = "badge " + (state==="ok"?"ok":state==="warn"?"warn":"err"); }
}

// ======= Debug =======
function showDebug(errors){
  if (!errors.length) return;
  debugFab.classList.remove("hidden");
  debugBody.innerHTML = errors.map(e => `<tr><td>${e.source}</td><td>${e.ok?'✅':'❌'}</td><td>${e.message||'-'}</td></tr>`).join("");
}
debugFab.addEventListener("click", () => debugPanel.classList.toggle("hidden"));
debugClose.addEventListener("click", () => debugPanel.classList.add("hidden"));

// ======= Coach =======
coachToggle.addEventListener("click", () => coachPanel.classList.toggle("hidden"));
coachClose.addEventListener("click", () => coachPanel.classList.add("hidden"));

function coachFromNiches(rows){
  if (!rows.length) return "No niches yet. Press Refresh.";
  const top = rows[0];
  return `Today’s hot pick: <b>${top.niche}</b> (Score ${top.score}). Next: drill down and pick 3 low-competition keywords.`;
}

// ======= Helpers =======
function normalizeKey(s){ return (s||"").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
function scoreText(txt, weight=1){
  let score = 50*weight;
  const t = (txt||"").toLowerCase();
  if (/\b(best|how to|ideas|review|price|vs|software|tool|template)\b/.test(t)) score += 8;
  if (/\bfor (beginners|2025|kids|business|side hustle|affiliate)\b/.test(t)) score += 6;
  if (t.length > 35) score -= 3;
  return Math.round(Math.max(10, Math.min(100, score)));
}

async function fetchSource(s){
  if (!enabled[s.id]) { setPill(s.id, "warn", "disabled"); return { ok:true, source:s.id, items:[] }; }
  try{
    const res = await fetch(s.url, { headers: { "x-nm":"1" } });
    const data = await res.json().catch(()=>({}));
    if (!data || data.ok !== true){
      setPill(s.id, "err", data?.message || "error");
      return { ok:false, source:s.id, message:data?.message||"error" };
    }
    const items = (data.items||[]).map(it => it?.niche).filter(Boolean);
    setPill(s.id, items.length?"ok":"warn", `${items.length} items`);
    return { ok:true, source:s.id, items };
  } catch(e){
    setPill(s.id, "err", String(e));
    return { ok:false, source:s.id, message:String(e) };
  }
}

async function discover(){
  scanStatus.textContent = "Scanning…";
  renderPills();
  const errors = [];
  const out = new Map();
  const results = await Promise.all(SOURCES.map(fetchSource));
  results.forEach((r, i) => {
    if (!r.ok) return errors.push(r);
    const w = SOURCES[i].weight;
    r.items.forEach(txt => {
      const key = normalizeKey(txt); if (!key) return;
      const score = scoreText(txt, w);
      const prev = out.get(key);
      if (!prev || score > prev.score) {
        out.set(key, { niche: txt, score, intent: SOURCES[i].id, trend: ["Wiki","Trends","YTTrend","XTrends","PHunt"].includes(SOURCES[i].id) ? "📈":"—" });
      }
    });
  });
  const rows = Array.from(out.values()).sort((a,b)=>b.score-a.score).slice(0,15);
  nichesTbody.innerHTML = rows.length
    ? rows.map((r,i)=>`<tr data-niche="${encodeURIComponent(r.niche)}"><td>${i+1}</td><td class="niche">${r.niche}</td><td>${r.score}</td><td>${r.intent}</td><td>${r.trend}</td></tr>`).join("")
    : `<tr><td colspan="5" class="muted">No niches found. Try enabling more sources.</td></tr>`;

  coachBody.innerHTML = coachFromNiches(rows);
  showDebug(errors);
  scanStatus.textContent = `Done • ${rows.length} niches`;
}

async function drill(niche){
  drillPanel.hidden=false;
  drillTitle.textContent = "🔎 Keyword Drilldown — " + niche;
  kwTbody.innerHTML = `<tr><td colspan="5" class="muted">Fetching…</td></tr>`;
  const [g, y] = await Promise.allSettled([
    fetch("/api/suggest?q="+encodeURIComponent(niche)).then(r=>r.json()),
    fetch("/api/ytsuggest?q="+encodeURIComponent(niche)).then(r=>r.json())
  ]);
  const items = [];
  if (g.status==="fulfilled" && g.value?.ok) (g.value.items||[]).forEach(i=>items.push({kw:i.niche, src:"Google"}));
  if (y.status==="fulfilled" && y.value?.ok) (y.value.items||[]).forEach(i=>items.push({kw:i.niche, src:"YouTube"}));
  // dedupe
  const seen=new Set(), clean=[];
  for (const it of items){ const k=normalizeKey(it.kw); if(k && !seen.has(k)){ seen.add(k); clean.push(it);} }
  kwTbody.innerHTML = clean.slice(0,80).map(it=>`<tr><td>${it.kw}</td><td>${it.src}</td><td></td><td></td><td></td></tr>`).join("");
}

// Events
refreshBtn.addEventListener("click", discover);
nichesTbody.addEventListener("click", (e)=>{
  const tr = e.target.closest("tr[data-niche]"); if(!tr) return;
  drill(decodeURIComponent(tr.getAttribute("data-niche")));
});

// Drawer (gear) behavior
sourcesBtn.addEventListener("click", () => {
  buildDrawer();
  sourcesDrawer.classList.toggle("open");
  sourcesDrawer.classList.toggle("hidden", false);
});
drawerClose.addEventListener("click", () => {
  sourcesDrawer.classList.remove("open");
  setTimeout(()=>sourcesDrawer.classList.add("hidden"), 200);
});

// Init
buildDrawer();
renderPills();
discover();
