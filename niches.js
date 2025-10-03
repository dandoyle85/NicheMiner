import { collectTopNiches, drilldownKeywords } from './live-sources.js';
import { coachFromNiches, coachFromKeywords } from './ai-coach.js';

export function initNiches({ supabase, onCoachUpdate, onDebug }){
  const table = document.getElementById('nicheTable').querySelector('tbody');
  const empty = document.getElementById('nicheEmpty');
  const status = document.getElementById('nicheStatus');
  const refreshBtn = document.getElementById('refreshNiches');
  const drillPanel = document.getElementById('drillPanel');
  const drillTitle = document.getElementById('drillTitle');
  const kwTable = document.getElementById('kwTable').querySelector('tbody');
  const kwEmpty = document.getElementById('kwEmpty');
  const genPrompt = document.getElementById('genPrompt');
  const gptPaste = document.getElementById('gptPaste');
  const importGpt = document.getElementById('importGpt');

  async function loadNiches(){
    status.textContent = 'Scanning…';
    table.innerHTML = ''; empty.classList.add('hidden');
    const { top, debug } = await collectTopNiches('ideas');
    debug.forEach(d => onDebug && onDebug(d));
    if (!top.length){ empty.classList.remove('hidden'); status.textContent='No results'; return; }
    status.textContent = `Found ${top.length}`;
    table.innerHTML = '';
    top.forEach((n, i) => {
      const tr = document.createElement('tr');
      if (i===0) tr.innerHTML = `<td>${i+1}</td><td><span class="badge top">Top Pick</span> ${n.niche}</td>`;
      else tr.innerHTML = `<td>${i+1}</td><td>${n.niche}</td>`;
      tr.innerHTML += `<td>${n.score}</td><td>${n.buyerIntent}</td><td>${n.competition}</td><td>${n.trend ? '📈' : '—'}</td><td><button class="cta small" data-drill="${encodeURIComponent(n.niche)}">Drilldown</button></td>`;
      table.appendChild(tr);
    });
    onCoachUpdate && onCoachUpdate(coachFromNiches(top));
  }

  async function runDrill(niche){
    drillPanel.hidden = false;
    drillTitle.textContent = `🔎 Keyword Drilldown — ${decodeURIComponent(niche)}`;
    kwTable.innerHTML = ''; kwEmpty.classList.add('hidden');

    const { items, debug } = await drilldownKeywords(decodeURIComponent(niche));
    debug.forEach(d => onDebug && onDebug(d));

    if (!items.length){ kwEmpty.classList.remove('hidden'); return; }
    items.slice(0,150).forEach(it => {
      const tr = document.createElement('tr');
      const sourceBadge = `<span class="badge live">${it.source||'Live'}</span>`;
      tr.innerHTML = `<td>${it.keyword}</td><td>${sourceBadge}</td><td>${it.volume||''}</td><td>${it.competition||''}</td><td>${(it.trendHistory&&it.trendHistory.length)?'📈':''}</td><td><button class="ghost small" data-save="${it.keyword}">Save</button></td>`;
      kwTable.appendChild(tr);
    });
    onCoachUpdate && onCoachUpdate(coachFromKeywords(items));

    if (supabase){
      kwTable.querySelectorAll('[data-save]').forEach(btn => btn.addEventListener('click', async () => {
        const kw = btn.dataset.save;
        try{
          await supabase.from('keyword_metrics').insert({ niche: decodeURIComponent(niche), keyword: kw, volume: null, competition: null });
          btn.textContent = 'Saved'; btn.disabled = true;
        }catch(e){ console.log('Save failed', e); }
      }));
    }
  }

  document.getElementById('nicheTable').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-drill]'); if (!btn) return;
    runDrill(btn.dataset.drill);
  });
  refreshBtn.onclick = loadNiches;

  // GPT Assist
  genPrompt.onclick = () => {
    const current = drillTitle.textContent.replace('🔎 Keyword Drilldown — ','') || 'YOUR NICHE';
    const prompt = `Give me 25 low-competition keywords for the niche "${current}". For each, estimate monthly search volume (low/med/high), CPC ($), and difficulty (low/med/high). Return as a Markdown table with headers: Keyword | Volume | CPC | Competition.`;
    gptPaste.value = prompt;
    gptPaste.focus();
  };
  importGpt.onclick = () => {
    const txt = gptPaste.value||'';
    const lines = txt.split('\n').filter(l => /(\||,)/.test(l) && !/---/.test(l));
    for (let i=1;i<lines.length;i++){
      const parts = lines[i].split('|'); // prefer Markdown columns
      if (parts.length < 4) continue;
      const cols = parts.map(c => c.trim());
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${cols[0]}</td><td><span class="badge gpt">GPT</span></td><td>${cols[1]}</td><td>${cols[3]}</td><td></td><td></td>`;
      document.getElementById('kwTable').querySelector('tbody').appendChild(tr);
    }
  };

  loadNiches();
}
