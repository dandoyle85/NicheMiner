export async function onRequestGet(context){
  const url = new URL(context.request.url);
  const q = url.searchParams.get('q') || 'ideas';
  const ep = `https://www.pinterest.com/resource/TypeaheadResource/get/?data=%7B%22options%22:%7B%22query%22:%22${encodeURIComponent(q)}%22%7D%7D`;
  try{
    const r = await fetch(ep, { headers: { "User-Agent":"Mozilla/5.0" }});
    const j = await r.json();
    const items = (j?.resource_response?.data?.matches||[]).map(m => ({ keyword:m.term }));
    return new Response(JSON.stringify({ items }), { headers: { "Content-Type":"application/json" } });
  }catch(e){
    return new Response(JSON.stringify({ error:String(e) }), { status:500 });
  }
}