// fetch-keywords.js — Phase 8 LIVE (stable sources + verbose debug)
//
// Sources (no signups):
// - Google Autocomplete (search): https://suggestqueries.google.com/complete/search?client=firefox&q=QUERY
// - YouTube Autocomplete: https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=QUERY
// - Google Trends seeds (best-effort): we fall back to preloaded niches due to CORS.
// - Google People Also Ask: best-effort (CORS often blocks) — handled with try/catch.
//
// Notes:
// - We log EVERYTHING to console for live debugging.
// - If a source fails, we continue with the others.

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export async function getPreloadedNiches(){
  // Quick preload to avoid empty UI
  return ["Drones","AI Tools","Home Fitness","Solar Energy","Smart Home Devices"];
}

export async function getGoogleAutocomplete(topic){
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(topic)}`;
  console.debug("[GoogleAutocomplete] GET", url);
  try{
    const res = await fetch(url, { mode: "cors" });
    const data = await res.json(); // [query, [suggestions...]]
    console.debug("[GoogleAutocomplete] RAW", data);
    const suggestions = (data && data[1]) ? data[1] : [];
    return suggestions.map(s => ({ keyword: s, source: "Google", intent: "info" }));
  }catch(e){
    console.warn("[GoogleAutocomplete] failed", e);
    return [];
  }
}

export async function getYouTubeAutocomplete(topic){
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(topic)}`;
  console.debug("[YouTubeAutocomplete] GET", url);
  try{
    const res = await fetch(url, { mode: "cors" });
    const data = await res.json(); // [query, [suggestions...]]
    console.debug("[YouTubeAutocomplete] RAW", data);
    const suggestions = (data && data[1]) ? data[1] : [];
    return suggestions.map(s => ({ keyword: s, source: "YouTube", intent: "video" }));
  }catch(e){
    console.warn("[YouTubeAutocomplete] failed", e);
    return [];
  }
}

// Best-effort PAA: will likely fail in browser due to CORS. We keep it optional.
export async function getPeopleAlsoAsk(topic){
  const url = `https://www.google.com/search?q=${encodeURIComponent(topic)}`;
  console.debug("[PAA] Attempting GET", url);
  try{
    const res = await fetch(url, { mode: "no-cors" }); // no-cors yields opaque response; we can't parse here.
//  const html = await res.text();
//  // Parsing PAA would go here if CORS allowed; skipping.
//  return []; 
    console.warn("[PAA] Skipped parsing due to CORS (expected).");
    return [];
  }catch(e){
    console.warn("[PAA] failed", e);
    return [];
  }
}

// Orchestrator: run all sources and normalize
export async function fetchKeywordsForNiche(niche){
  console.groupCollapsed(`🔎 Phase8 fetch for niche: ${niche}`);
  const out = [];

  const [g, yt, paa] = await Promise.all([
    getGoogleAutocomplete(niche),
    getYouTubeAutocomplete(niche),
    getPeopleAlsoAsk(`${niche} questions`)
  ]);

  out.push(...g, ...yt, ...paa);

  console.debug("[Phase8] Combined before de-dupe", out);

  // De-dupe by keyword (case-insensitive)
  const seen = new Set();
  const deduped = out.filter(item => {
    const key = item.keyword.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Add naive volume/competition placeholders for now
  const enriched = deduped.map((k, i) => ({
    ...k,
    volume: Math.max(500, 5000 - i * 50),      // descending placeholder volume
    competition: i % 3 === 0 ? "Low" : (i % 3 === 1 ? "Medium" : "High")
  }));

  console.debug("[Phase8] Enriched", enriched);
  console.groupEnd();
  return enriched.slice(0, 50);
}
