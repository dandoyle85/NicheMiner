export const onRequest = async ({ request }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  if (!q) return new Response(JSON.stringify({ suggestions: [] }), { headers: json() });
  const api = 'https://suggestqueries.google.com/complete/search?' + new URLSearchParams({
    client: 'firefox', q, hl: 'en', gl: 'us'
  }).toString();
  const r = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0 NicheMiner' } });
  const j = await r.json();
  const suggestions = Array.isArray(j) ? (j[1] || []) : [];
  return new Response(JSON.stringify({ suggestions }), { headers: json() });
};
function json(){ return { 'content-type':'application/json; charset=utf-8', 'Cache-Control':'no-store' }; }