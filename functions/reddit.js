export async function onRequestGet(context){
  const url = new URL(context.request.url);
  const sub = url.searchParams.get('sub') || 'Entrepreneur';
  const ep = `https://www.reddit.com/r/${encodeURIComponent(sub)}/hot.json?limit=25`;
  try{
    const r = await fetch(ep, { headers: { "User-Agent":"Mozilla/5.0" }});
    const j = await r.json();
    const items = (j?.data?.children||[]).map(p => ({ title:p.data.title }));
    return new Response(JSON.stringify({ items }), { headers: { "Content-Type":"application/json" } });
  }catch(e){
    return new Response(JSON.stringify({ error:String(e) }), { status:500 });
  }
}