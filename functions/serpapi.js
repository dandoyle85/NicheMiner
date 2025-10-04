export async function onRequestGet(context) {
  const { env } = context;
  const apikey = env.SERP_API_KEY;
  if (!apikey) return new Response(JSON.stringify({ error:'Missing SERP_API_KEY'}), { status:500 });
  const url = `https://serpapi.com/search.json?engine=google_trends_trending_searches&geo=US&api_key=${apikey}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent":"Mozilla/5.0" } });
    const data = await res.json();
    const items = (data.trending_searches || []).map(x => ({ niche: x.title||x.query||'' }));
    return new Response(JSON.stringify({ items }), { headers: { "Content-Type":"application/json" } });
  } catch(e){
    return new Response(JSON.stringify({ error:String(e) }), { status:500 });
  }
}