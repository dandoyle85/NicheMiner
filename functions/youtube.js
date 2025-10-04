export async function onRequestGet(context){
  const url = new URL(context.request.url);
  const q = url.searchParams.get('q') || 'ideas';
  const ep = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`;
  try{
    const r = await fetch(ep, { headers: { "User-Agent":"Mozilla/5.0" }});
    const j = await r.json();
    const items = (j?.[1]||[]).map(s => ({ keyword:s }));
    return new Response(JSON.stringify({ items }), { headers: { "Content-Type":"application/json" } });
  }catch(e){
    return new Response(JSON.stringify({ error:String(e) }), { status:500 });
  }
}