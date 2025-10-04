import { initNiches } from '/niches.js';
import { initCoach } from '/ai-coach.js';

const tabs = document.querySelectorAll('.nav button');
const sections = document.querySelectorAll('main .tab');
tabs.forEach(btn => btn.addEventListener('click', () => {
  tabs.forEach(b => b.classList.remove('active')); btn.classList.add('active');
  sections.forEach(s => s.classList.add('hidden'));
  document.getElementById(btn.dataset.tab).classList.remove('hidden');
  if (btn.dataset.tab === 'niches') initNiches(onDebug, updateStatusBubble);
  if (btn.dataset.tab === 'coach') initCoach();
}));

const statusMap = {
  serpapi: document.querySelector('[data-source="serpapi"]'),
  google:  document.querySelector('[data-source="google"]'),
  amazon:  document.querySelector('[data-source="amazon"]'),
  reddit:  document.querySelector('[data-source="reddit"]'),
  youtube: document.querySelector('[data-source="youtube"]'),
  wiki:    document.querySelector('[data-source="wiki"]'),
  pinterest:document.querySelector('[data-source="pinterest"]')
};

function setStatus(el, state, msg){
  if (!el) return;
  el.classList.remove('ok','warn','err');
  el.classList.add(state==='ok'?'ok':(state==='warn'?'warn':'err'));
  if (msg) el.title = (el.title||'') + ' • ' + msg;
  if (state==='err'){
    document.getElementById('debugToggle').classList.remove('hidden');
    document.getElementById('debugPanel').classList.remove('hidden');
  }
}

export function updateStatusBubble({sourceId, status, message}){
  const el = statusMap[sourceId];
  setStatus(el, status, message||'');
}

Object.entries(statusMap).forEach(([k,el]) => {
  el?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('refresh-source', { detail:{ source:k } }));
  });
});

document.getElementById('refreshAll').addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('refresh-source', { detail:{ source:'all' } }));
});

const debugToggle = document.getElementById('debugToggle');
const debugPanel = document.getElementById('debugPanel');
const debugBody = document.getElementById('debugBody');
const debugClose = document.getElementById('debugClose');
debugToggle.addEventListener('click', () => debugPanel.classList.toggle('hidden'));
debugClose.addEventListener('click', () => debugPanel.classList.add('hidden'));

function onDebug(entry){
  console.log('[DEBUG]', entry);
  const tr = document.createElement('tr');
  const statusEmoji = entry.status === 'ok' ? '✅' : (entry.status === 'warn' ? '⚠️' : '❌');
  tr.innerHTML = `<td>${entry.source}</td><td>${statusEmoji}</td><td>${entry.message||''}</td>`;
  debugBody.appendChild(tr);
}

document.querySelector('.nav button.active').click();
