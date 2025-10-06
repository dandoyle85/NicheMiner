function intentFromKeyword(k){
  const s = k.toLowerCase();
  if (/(buy|best|vs|review|price|pricing|software|tool|deal|coupon)/.test(s)) return 'High';
  if (/(how to|tutorial|guide|ideas|tips|examples)/.test(s)) return 'Medium';
  return 'Low';
}
function scoreKeyword(k, source){
  let score = 40 + Math.min(40, Math.floor(k.length/2));
  if (/best|buy|vs|review|software|tool/.test(k.toLowerCase())) score += 15;
  if (source === 'Google') score += 5;
  if (source === 'YouTube') score += 3;
  if (source === 'Reddit') score += 2;
  return Math.max(10, Math.min(99, score));
}

async function fetchJSON(url){
  const r = await fetch(url, { cache:'no-store' });
  if (!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}
async function fetchText(url){
  const r = await fetch(url, { cache:'no-store' });
  if (!r.ok) throw new Error('HTTP '+r.status);
  return r.text();
}

async function googleSuggest(q){
  const j = await fetchJSON('/keywords/google?q='+encodeURIComponent(q));
  return (j.suggestions||[]).map(s=>({ keyword:s, source:'Google', intent:intentFromKeyword(s), trend:'↑', score:scoreKeyword(s,'Google') }));
}
async function youtubeSuggest(q){
  const j = await fetchJSON('/keywords/youtube?q='+encodeURIComponent(q));
  return (j.suggestions||[]).map(s=>({ keyword:s, source:'YouTube', intent:intentFromKeyword(s), trend:'→', score:scoreKeyword(s,'YouTube') }));
}
async function redditTitles(q){
  const txt = await fetchText('/keywords/reddit?q='+encodeURIComponent(q));
  const doc = new DOMParser().parseFromString(txt, 'text/xml');
  const items = [...doc.querySelectorAll('entry > title, item > title')].map(el=>el.textContent.trim()).slice(0,30);
  return items.map(s=>({ keyword:s, source:'Reddit', intent:intentFromKeyword(s), trend:'→', score:scoreKeyword(s,'Reddit') }));
}

export async function fetchKeywordsForNiche(niche, { includeReddit=false, log=()=>{} }={}){
  const out = [];
  try { const g = await googleSuggest(niche); out.push(...g); log('Google', true, '+'+g.length); } catch(e){ log('Google', false, e.message); }
  try { const y = await youtubeSuggest(niche); out.push(...y); log('YouTube', true, '+'+y.length); } catch(e){ log('YouTube', false, e.message); }
  if (includeReddit){
    try { const r = await redditTitles(niche); out.push(...r); log('Reddit', true, '+'+r.length); } catch(e){ log('Reddit', false, e.message); }
  }
  const seen = new Set();
  return out.filter(x => { const k=x.keyword.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
            .sort((a,b)=> b.score - a.score);
}