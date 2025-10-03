import { mockMode } from '/src/lib/supabase.js';
import { saveKeywords } from '/supabase-client.js';

const API_BASE = '/api';

async function jget(path, params) {
  const url = new URL(API_BASE + path, location.origin);
  Object.entries(params || {}).forEach(([k,v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: { 'accept': 'application/json' }});
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
  return await res.json();
}

async function getSources(niche){
  if (mockMode){
    return [
      { keyword:'best budget drones 2025', source:'Google', volume: 1400, competition:'Low' },
      { keyword:'fpv drone kit for beginners', source:'YouTube', volume: 900, competition:'Medium' },
      { keyword:'mini 4 pro accessories', source:'Amazon', volume: 1200, competition:'High' },
    ];
  }
  const results = await Promise.allSettled([
    jget('/autocomplete', { src:'google', q:niche }),
    jget('/autocomplete', { src:'youtube', q:niche }),
    jget('/autocomplete', { src:'amazon', q:niche }),
    jget('/paa', { q:niche + ' questions' }),
    jget('/trends', { q:niche })
  ]);
  const merged = [];
  results.forEach(r => {
    if (r.status === 'fulfilled'){
      const key = r.value.suggestions ? 'suggestions' : (r.value.questions ? 'questions' : null);
      const arr = key ? r.value[key] : [];
      arr.forEach(k => merged.push({ keyword:k, source:r.value.src || 'src' }));
    }
  });
  const seen = new Set();
  const dedup = merged.filter(x => { const k=x.keyword.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  const enriched = dedup.map((k,i) => ({...k, volume: 6000 - i*70, competition: (i%3===0?'Low': i%3===1?'Medium':'High')}));
  return enriched.slice(0,50);
}

function renderKeywords(rows){
  const tbody = document.querySelector('#keywordTable tbody');
  tbody.innerHTML='';
  rows.forEach(k => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${k.keyword}</td><td>${k.source}</td><td>${k.volume}</td><td>${k.competition}</td>`;
    tbody.appendChild(tr);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const niches = ['Drones', 'AI Tools', 'Home Fitness', 'Solar Energy', 'Smart Home Devices'];
  const wrap = document.getElementById('nicheList');
  niches.forEach(n => {
    const b = document.createElement('button');
    b.textContent = `${n} (Drill Keywords)`;
    b.onclick = async () => {
      const list = await getSources(n);
      renderKeywords(list);
      await saveKeywords(list);
    };
    wrap.appendChild(b);
  });
});
