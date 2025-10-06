import { fetchKeywordsForNiche } from './modules/keywordFetcher.js';

const $ = s => document.querySelector(s);

const dbg = $('#debugDrawer');
$('#openDebug')?.addEventListener('click', () => dbg.classList.add('open'));
$('#closeDebug')?.addEventListener('click', () => dbg.classList.remove('open'));
function log(step, ok, msg){
  const el = document.createElement('div');
  el.className = 'debug-item';
  el.innerHTML = `<div>${step}</div><div>${ok?'<span class="pill" style="color:#2ecb70;border-color:#214c38">OK</span>':'<span class="pill" style="color:#ff6464;border-color:#4c2130">ERR</span>'}</div><div class="muted">${msg||''}</div>`;
  $('#debugList').appendChild(el);
}

let niches = [
  { title: 'drone mapping' },
  { title: 'portable power stations' },
  { title: 'ai side hustles' }
];

function renderNiches(){
  const list = $('#nicheList');
  list.innerHTML = '';
  niches.forEach((n) => {
    const wrap = document.createElement('div');
    wrap.className = 'niche-item';

    const head = document.createElement('div');
    head.className = 'niche-head';
    head.innerHTML = `<div class="niche-title">${n.title}</div><div class="niche-meta muted">(click to drill keywords)</div>`;
    wrap.appendChild(head);

    const slot = document.createElement('div');
    slot.className = 'kwd-slot';
    wrap.appendChild(slot);

    head.addEventListener('click', async () => {
      if (slot.dataset.open === '1') { slot.innerHTML=''; slot.dataset.open='0'; return; }
      slot.dataset.open = '1';
      slot.innerHTML = `<div class="pill">Loading keywords…</div>`;

      const includeReddit = $('#redditToggle').checked;
      try {
        const rows = await fetchKeywordsForNiche(n.title, { includeReddit, log });
        if (!rows.length) {
          slot.innerHTML = `<div class="pill" style="color:#ffd166;border-color:#55421e">No keywords found</div>`;
          return;
        }
        const table = document.createElement('div');
        table.className = 'kwd-table';
        table.innerHTML = `
          <div class="kwd-head"><div>Keyword</div><div>Score</div><div>Intent</div><div>Trend</div><div>Source</div></div>
          <div class="kwd-body"></div>
        `;
        const body = table.querySelector('.kwd-body');
        rows.slice(0, 30).forEach(r => {
          const row = document.createElement('div');
          row.className = 'kwd-row';
          row.innerHTML = `
            <div>${r.keyword}</div>
            <div><span class="pill">${r.score}</span></div>
            <div>${r.intent}</div>
            <div>${r.trend}</div>
            <div>${r.source}</div>
          `;
          body.appendChild(row);
        });
        slot.innerHTML='';
        slot.appendChild(table);
      } catch (e) {
        log('DrillDown', false, e.message);
        slot.innerHTML = `<div class="pill" style="color:#ff6464;border-color:#4c2130">Error: ${e.message}</div>`;
      }
    });

    list.appendChild(wrap);
  });
}

$('#addNiche')?.addEventListener('click', () => {
  const v = document.getElementById('nicheInput').value.trim();
  if (!v) return;
  niches.unshift({ title: v });
  document.getElementById('nicheInput').value = '';
  renderNiches();
});

window.__addGPTNiches = (rows)=>{
  rows.forEach(r => niches.unshift({ title: r.niche }));
  renderNiches();
};

renderNiches();