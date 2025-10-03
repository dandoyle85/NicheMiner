export async function onRequestGet(context){
  const { request } = context;
  const url = new URL(request.url);
  const src = (url.searchParams.get('src')||'').toLowerCase();
  const q = url.searchParams.get('q')||'';
  if (!src || !q) return json({error:'missing src or q'},400);
  const endpoints = {
    google:`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`,
    youtube:`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`,
    amazon:`https://completion.amazon.com/api/2017/suggestions?limit=10&prefix=${encodeURIComponent(q)}`
  };
  const target = endpoints[src];
  if(!target) return json({error:'unknown src'},400);
  try{
    const r = await fetch(target, { headers:{'user-agent':'Mozilla/5.0'} });
    let suggestions=[];
    if (src==='google' || src==='youtube'){ const d = await r.json(); suggestions = d[1]||[]; }
    if (src==='amazon'){ const d = await r.json(); suggestions=(d.suggestions||[]).map(x=>x.value); }
    return json({src, q, suggestions});
  }catch(e){ return json({src,q,error:e.message},500); }
}
function json(b,s=200){return new Response(JSON.stringify(b),{status:s,headers:{'content-type':'application/json','access-control-allow-origin':'*'}})}
