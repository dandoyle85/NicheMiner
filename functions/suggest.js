// functions/suggest.js
// Cloudflare Pages Function - proxies Google and DuckDuckGo suggestions
export async function onRequest(context) {
  const { request } = context;
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';
  const provider = (url.searchParams.get('provider') || 'google').toLowerCase();

  if (!q || q.trim() === '') {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }

  // remote targets
  const GOOGLE_TARGET = 'https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=';
  const DDG_TARGET = 'https://duckduckgo.com/ac/?q=';

  const target = (provider === 'ddg' || provider === 'duckduckgo')
    ? DDG_TARGET + encodeURIComponent(q)
    : GOOGLE_TARGET + encodeURIComponent(q);

  try {
    // server-to-server fetch (no CORS issue)
    const resp = await fetch(target, {
      method: 'GET',
      headers: {
        'User-Agent': 'NicheMiner-Suggest-Proxy/1.0'
      }
    });

    const body = await resp.text();
    const contentType = resp.headers.get('content-type') || 'application/json';

    // cache result in Cloudflare edge cache (best-effort)
    try {
      const cache = caches.default;
      const cacheKey = new Request(target);
      const toCache = new Response(body, { headers: { 'Content-Type': contentType }});
      context.waitUntil(cache.put(cacheKey, toCache.clone()));
    } catch (e) {
      // ignore cache errors
    }

    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': contentType,
        'Vary': 'Origin'
      }
    });
  } catch (err) {
    console.error('proxy error', err);
    return new Response(JSON.stringify({ error: 'proxy_failed' }), {
      status: 502,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }
}

function corsHeaders() {
  // For production change '*' to your exact origin, e.g. 'https://nicheminer.pages.dev'
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
