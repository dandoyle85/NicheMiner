// fetch-keywords.js — Phase 8.1 Clean
import { saveKeywords } from './supabase-client.js';

const API_BASE = "/api";

async function jget(path, params) {
  const url = new URL(API_BASE + path, location.origin);
  Object.entries(params || {}).forEach(([k,v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: { "accept": "application/json" }});
  if (!res.ok) throw new Error(`${path} HTTP ${res.status}`);
  return await res.json();
}

async function getSources(niche) {
  console.groupCollapsed(`🔎 Fetching for niche: ${niche}`);
  const results = await Promise.allSettled([
    jget("/autocomplete", { src:"google", q:niche }),
    jget("/autocomplete", { src:"youtube", q:niche }),
    jget("/autocomplete", { src:"amazon", q:niche }),
    jget("/autocomplete", { src:"walmart", q:niche }),
    jget("/autocomplete", { src:"etsy", q:niche }),
    jget("/autocomplete", { src:"pinterest", q:niche }),
    jget("/paa", { q:niche+" questions" }),
  ]);

  const merged = [];
  results.forEach((r,i) => {
    if (r.status === "fulfilled") {
      const key = i < 6 ? "suggestions" : "questions";
      (r.value[key]||[]).forEach(s => merged.push({ keyword:s, source:Object.keys(r.value)[0]||"src" }));
    } else {
      console.warn("Source failed", r.reason);
    }
  });
  console.debug("Merged raw", merged);

  const seen = new Set();
  const deduped = merged.filter(k => {
    const key = k.keyword.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const enriched = deduped.map((k,i) => ({
    ...k,
    volume: Math.max(500, 8000 - i*60),
    competition: i%3===0?"Low":i%3===1?"Medium":"High"
  }));

  console.debug("Enriched", enriched);
  console.groupEnd();
  return enriched.slice(0,50);
}

function renderKeywords(list){
  const tbody=document.querySelector("#keywordTable tbody");
  tbody.innerHTML="";
  list.forEach(k=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${k.keyword}</td><td>${k.source}</td><td>${k.volume}</td><td>${k.competition}</td>`;
    tbody.appendChild(tr);
  });
}

window.addEventListener("DOMContentLoaded",()=>{
  const niches=["Drones","AI Tools","Home Fitness","Solar Energy","Smart Home Devices"];
  const container=document.getElementById("nicheList");
  niches.forEach(n=>{
    const btn=document.createElement("button");
    btn.textContent=n+" (Drill Keywords)";
    btn.onclick=async()=>{
      const kws=await getSources(n);
      renderKeywords(kws);
      await saveKeywords(kws);
    };
    container.appendChild(btn);
  });
});
