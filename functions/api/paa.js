export async function onRequestGet(context){
  const { request } = context;
  const url = new URL(request.url);
  const q = url.searchParams.get('q')||'';
  if (!q) return json({error:'missing q'},400);
  try{
    const r = await fetch(`https://www.google.com/search?q=${encodeURIComponent(q)}`,{headers:{'user-agent':'Mozilla/5.0'}});
    const html = await r.text();
    const block = html.toLowerCase().indexOf('people also ask');
    let qs=[];
    if (block!==-1){
      const slice = html.slice(block, block+18000);
      const re = />[^<>?]{4,100}\?/g; let m;
      while ((m = re.exec(slice)) !== null){ const s = m[0].slice(1,-1).trim(); if (s.endsWith('?')) qs.push(s); if(qs.length>=20) break; }
    }
    return json({q, questions:[...new Set(qs)]});
  }catch(e){ return json({q, error:e.message},500); }
}
function json(b,s=200){return new Response(JSON.stringify(b),{status:s,headers:{'content-type':'application/json','access-control-allow-origin':'*'}})}
