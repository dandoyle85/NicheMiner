// worker/worker.js
addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});

const GOOGLE_TARGET = 'https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=';
const DDG_TARGET = 'https://duckduckgo.com/ac/?q=';

async function handle(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const provider = (url.searchParams.get('provider') || 'google').toLowerCase();

  if (!q) return new Response(JSON.stringify([]), { status: 200, headers: { ...corsHeaders(), 'Content-Type': 'application/json' }});

  const target = (provider === 'ddg' || provider === 'duckduckgo') ? DDG_TARGET + encodeURIComponent(q) : GOOGLE_TARGET + encodeURIComponent(q);

  const resp = await fetch(target, { headers: { 'User-Agent': 'NicheMiner-Worker/1.0' }});
  const body = await resp.text();
  const contentType = resp.headers.get('content-type') || 'application/json';

  // cache best-effort
  try {
    const cache = caches.default;
    const cacheKey = new Request(target);
    const toCache = new Response(body, { headers: { 'Content-Type': contentType }});
    event.waitUntil(cache.put(cacheKey, toCache.clone()));
  } catch (e) {}

  return new Response(body, {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': contentType
    }
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
