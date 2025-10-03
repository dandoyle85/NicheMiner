async function safeFetch(url, opts){
  try{
    const res = await fetch(url, opts);
    const text = await res.text();
    return { ok: res.ok, text, status: res.status };
  }catch(e){
    return { ok:false, text:String(e), status:0 };
  }
}

export async function sourceGoogleTrends(seed){
  const url = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=en-US&tz=0&req=${encodeURIComponent(JSON.stringify({restriction:{geo:{}},keyword:seed,time:"today 1-m"}))}`;
  const res = await safeFetch(url);
  if (!res.ok) return { items:[], debug:{status:'error', message:`${res.status} ${res.text.slice(0,120)}`} };
  try{
    const json = JSON.parse(res.text.replace(/^\)\]\}',\s?/,''));
    const list = json?.default?.rankedList?.[0]?.rankedKeyword || [];
    const items = list.map(k => ({ keyword:k.query, source:'GoogleTrends', trendHistory:k.value || [], score:(k.value||[])[0]||0 }));
    return { items, debug:{status:'ok', message:`${items.length} results`} };
  }catch(e){
    return { items:[], debug:{status:'error', message:String(e)} };
  }
}

export async function sourceGoogleSuggest(seed){
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`;
  const res = await safeFetch(url);
  if (!res.ok) return { items:[], debug:{status:'error', message:`${res.status}`} };
  try{
    const arr = JSON.parse(res.text);
    const items = (arr?.[1]||[]).map(q => ({ keyword:q, source:'GoogleSuggest' }));
    return { items, debug:{status:'ok', message:`${items.length} suggestions`} };
  }catch(e){ return { items:[], debug:{status:'error', message:String(e)} }; }
}

export async function sourceYouTubeSuggest(seed){
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(seed)}`;
  const res = await safeFetch(url);
  if (!res.ok) return { items:[], debug:{status:'error', message:`${res.status}`} };
  try{
    const arr = JSON.parse(res.text);
    const items = (arr?.[1]||[]).map(q => ({ keyword:q, source:'YouTube' }));
    return { items, debug:{status:'ok', message:`${items.length} suggestions`} };
  }catch(e){ return { items:[], debug:{status:'error', message:String(e)} }; }
}

export async function sourceAmazon(seed){
  const url = `https://completion.amazon.com/api/2017/suggestions?limit=15&prefix=${encodeURIComponent(seed)}`;
  const res = await safeFetch(url);
  if (!res.ok) return { items:[], debug:{status:'warn', message:`${res.status}`} };
  try{
    const json = JSON.parse(res.text);
    const items = (json?.suggestions||[]).map(o => ({ keyword:o.value, source:'Amazon' }));
    return { items, debug:{status:'ok', message:`${items.length} suggestions`} };
  }catch(e){ return { items:[], debug:{status:'warn', message:String(e)} }; }
}

export async function sourceEtsy(seed){
  const url = `https://www.etsy.com/suggestions?q=${encodeURIComponent(seed)}`;
  const res = await safeFetch(url);
  if (!res.ok) return { items:[], debug:{status:'warn', message:`${res.status}`} };
  try{
    const json = JSON.parse(res.text);
    const items = (json?.results||[]).map(o => ({ keyword:o.query, source:'Etsy' }));
    return { items, debug:{status:'ok', message:`${items.length} suggestions`} };
  }catch(e){ return { items:[], debug:{status:'warn', message:'Parse fail/format changed'} }; }
}

export async function sourceWalmart(seed){
  const url = `https://www.walmart.com/typeahead/v3/complete?term=${encodeURIComponent(seed)}`;
  const res = await safeFetch(url);
  if (!res.ok) return { items:[], debug:{status:'warn', message:`${res.status}`} };
  try{
    const json = JSON.parse(res.text);
    const items = (json?.queries||[]).map(o => ({ keyword:o, source:'Walmart' }));
    return { items, debug:{status:'ok', message:`${items.length} suggestions`} };
  }catch(e){ return { items:[], debug:{status:'warn', message:String(e)} }; }
}

export async function sourcePinterest(seed){
  const url = `https://www.pinterest.com/resource/TypeaheadResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(seed)}&data=%7B%22options%22:%7B%22query%22:%22${encodeURIComponent(seed)}%22%7D%7D`;
  const res = await safeFetch(url);
  if (!res.ok) return { items:[], debug:{status:'warn', message:`${res.status}`} };
  try{
    const json = JSON.parse(res.text);
    const items = (json?.resource_response?.data?.matches||[]).map(o => ({ keyword:o.term, source:'Pinterest' }));
    return { items, debug:{status:'ok', message:`${items.length} suggestions`} };
  }catch(e){ return { items:[], debug:{status:'warn', message:String(e)} }; }
}

export async function sourceUbersuggest(seed){
  const url = `https://app.neilpatel.com/en/ubersuggest/overview?keyword=${encodeURIComponent(seed)}`;
  const res = await safeFetch(url);
  if (!res.ok) return { items:[], debug:{status:'warn', message:`${res.status}`} };
  const text = res.text;
  const rx = />([^<]{3,40})</g;
  const seen = new Set(); const items = [];
  let m; let count=0;
  while((m = rx.exec(text)) && count<40){
    const t = m[1].trim();
    if (t && /[a-zA-Z]/.test(t) && t.length<40 && !seen.has(t)){
      seen.add(t); items.push({ keyword:t, source:'Ubersuggest' }); count++;
    }
  }
  return { items, debug:{status:'ok', message:`${items.length} tokens`} };
}

export async function collectTopNiches(seed){
  const base = seed && seed.trim() ? seed.trim() : 'ideas';
  const calls = await Promise.allSettled([
    sourceGoogleTrends(base),
    sourceGoogleSuggest(base),
    sourceYouTubeSuggest(base),
    sourceAmazon(base),
    sourceEtsy(base),
    sourceWalmart(base),
    sourcePinterest(base)
  ]);
  const debug = [];
  const all = [];
  for (const c of calls){
    if (c.status === 'fulfilled'){
      const { items, debug: d } = c.value || { items:[], debug:{status:'warn', message:'empty'} };
      debug.push({ source: (items[0]?.source)||'Source', status: d?.status||'warn', message: d?.message||'' });
      all.push(...items);
    } else {
      debug.push({ source:'Unknown', status:'error', message:String(c.reason) });
    }
  }
  const map = new Map();
  for (const it of all){
    const key = it.keyword.toLowerCase();
    const prev = map.get(key) || { niche: it.keyword, sources:new Set(), trend:0 };
    prev.sources.add(it.source);
    prev.trend = Math.max(prev.trend || 0, it.score || 0);
    map.set(key, prev);
  }
  const niches = Array.from(map.values()).map(x => ({
    niche: x.niche,
    sources: Array.from(x.sources),
    trend: x.trend,
    buyerIntent: x.sources.some(s=>['Amazon','Etsy','Walmart'].includes(s)) ? 'High' : (x.sources.includes('GoogleSuggest') ? 'Medium' : 'Low'),
    competition: x.sources.length >= 3 ? 'Medium' : 'Low',
    score: Math.round( Math.min(100, (x.trend/100*50) + (x.sources.length*15) + (x.sources.includes('YouTube')?10:0) + (['Amazon','Etsy','Walmart'].some(s=>x.sources.includes(s))?10:0) ) )
  }));
  niches.sort((a,b)=> b.score - a.score);
  const top = niches.slice(0,15);
  return { top, debug };
}

export async function drilldownKeywords(niche){
  const calls = await Promise.allSettled([
    sourceGoogleTrends(niche),
    sourceGoogleSuggest(niche),
    sourceYouTubeSuggest(niche),
    sourceAmazon(niche),
    sourceEtsy(niche),
    sourceWalmart(niche),
    sourcePinterest(niche),
    sourceUbersuggest(niche)
  ]);
  const debug = [];
  let items = [];
  for (const c of calls){
    if (c.status === 'fulfilled'){
      const { items: arr, debug: d } = c.value || { items:[], debug:{status:'warn', message:'empty'} };
      debug.push({ source: (arr[0]?.source)||'Source', status: d?.status||'warn', message: d?.message||'' });
      items = items.concat(arr);
    } else {
      debug.push({ source:'Unknown', status:'error', message:String(c.reason) });
    }
  }
  const seen = new Set();
  const dedup = [];
  for (const it of items){
    const k = it.keyword.toLowerCase();
    if (!seen.has(k)){ seen.add(k); dedup.push(it); }
  }
  return { items: dedup, debug };
}
