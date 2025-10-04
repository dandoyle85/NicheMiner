export async function onRequestGet(){
  const now = new Date();
  const d = new Date(now.getTime() - 24*60*60*1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth()+1).padStart(2,'0');
  const dd = String(d.getUTCDate()).padStart(2,'0');
  const ep = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${yyyy}/${mm}/${dd}`;
  try{
    const r = await fetch(ep, { headers: { "User-Agent":"Mozilla/5.0" }});
    const j = await r.json();
    const items = (j?.items?.[0]?.articles||[]).slice(0,50).map(a => ({ keyword:a.article, views:a.views }));
    return new Response(JSON.stringify({ items }), { headers: { "Content-Type":"application/json" } });
  }catch(e){
    return new Response(JSON.stringify({ error:String(e) }), { status:500 });
  }
}