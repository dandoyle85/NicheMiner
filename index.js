import { initNiches } from './niches.js';
import { initCoach } from './ai-coach.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = (window.ENV && window.ENV.SUPABASE_URL) || '';
const SUPABASE_ANON_KEY = (window.ENV && window.ENV.SUPABASE_ANON_KEY) || '';
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const tabs = document.querySelectorAll('.nav button');
const sections = document.querySelectorAll('main .tab');

tabs.forEach(btn => btn.addEventListener('click', () => {
  tabs.forEach(b => b.classList.remove('active')); btn.classList.add('active');
  sections.forEach(s => s.classList.add('hidden'));
  document.getElementById(btn.dataset.tab).classList.remove('hidden');
  if (btn.dataset.tab === 'niches') initNiches({ supabase, onCoachUpdate: renderCoach, onDebug });
  if (btn.dataset.tab === 'coach') initCoach();
}));

function renderCoach(points){
  const el = document.getElementById('coachContent'); if (!el) return;
  el.innerHTML = (points||[]).map(p => `<div class="point">${p}</div>`).join('');
}

// Debug console
const debugToggle = document.getElementById('debugToggle');
const debugPanel = document.getElementById('debugPanel');
const debugBody = document.getElementById('debugBody');
const debugClose = document.getElementById('debugClose');

debugToggle.addEventListener('click', () => debugPanel.classList.toggle('hidden'));
debugClose.addEventListener('click', () => debugPanel.classList.add('hidden'));

function onDebug(entry){
  console.log('[DEBUG]', entry);
  if (!entry) return;
  const tr = document.createElement('tr');
  const statusEmoji = entry.status === 'ok' ? '✅' : (entry.status === 'warn' ? '⚠️' : '❌');
  tr.innerHTML = `<td>${entry.source}</td><td>${statusEmoji}</td><td>${entry.message || ''}</td>`;
  debugBody.appendChild(tr);
  if (entry.status !== 'ok'){ debugToggle.classList.remove('hidden'); }
}

// Initialize default tab
document.querySelector('.nav button.active').click();
