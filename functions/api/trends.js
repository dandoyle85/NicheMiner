export async function onRequestGet(context){
  const { request } = context;
  const url = new URL(request.url);
  const q = url.searchParams.get('q')||'';
  if(!q) return json({error:'missing q'},400);
  try{
    const r = await fetch(`https://www.google.com/search?q=${encodeURIComponent(q)}+trends`,{headers:{'user-agent':'Mozilla/5.0'}});
    const html = await r.text();
    const quoted = html.match(/"([^"]{3,60})"/g)||[];
    const suggestions = quoted.map(x=>x.replace(/^"|"$/g,''));
    return json({q, suggestions:[...new Set(suggestions.slice(0,25))]});
  }catch(e){ return json({q, error:e.message},500); }
}
function json(b,s=200){return new Response(JSON.stringify(b),{status:s,headers:{'content-type':'application/json','access-control-allow-origin':'*'}})}
