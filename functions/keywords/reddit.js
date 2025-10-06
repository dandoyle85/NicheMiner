export const onRequest = async ({ request }) => {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return new Response('<rss/>', { headers: xml() });
  const api = 'https://www.reddit.com/search.rss?' + new URLSearchParams({
    q, sort:'relevance', t:'year', restrict_sr: 'off'
  }).toString();
  const r = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0 NicheMiner' } });
  const txt = await r.text();
  return new Response(txt, { headers: xml() });
};
function xml(){ return { 'content-type':'application/xml; charset=utf-8', 'Cache-Control':'no-store' }; }