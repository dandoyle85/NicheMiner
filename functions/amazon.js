export async function onRequestGet(context){
  const url = new URL(context.request.url);
  const q = url.searchParams.get('q') || 'ideas';
  const ep = `https://completion.amazon.com/api/2017/suggestions?limit=15&prefix=${encodeURIComponent(q)}`;
  try{
    const r = await fetch(ep, { headers: { "User-Agent":"Mozilla/5.0" }});
    const j = await r.json();
    const items = (j?.suggestions||[]).map(o => ({ keyword:o.value }));
    return new Response(JSON.stringify({ items }), { headers: { "Content-Type":"application/json" } });
  }catch(e){
    return new Response(JSON.stringify({ error:String(e) }), { status:500 });
  }
}