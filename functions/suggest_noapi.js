// functions/suggest_noapi.js
// Cloudflare Pages Function — produces keyword suggestions WITHOUT calling any external API.
// Place this file at /functions/suggest_noapi.js in your Pages repo.

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // change to your origin for production
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function uniqKeepOrder(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    if (!v) {
      continue;
    }
    const s = ('' + v).trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}

function combine(base, additions, suffixFirst = false) {
  const out = [];
  for (const a of additions) {
    if (suffixFirst) {
      out.push(`${a} ${base}`.trim());
    } else {
      out.push(`${base} ${a}`.trim());
    }
  }
  return out;
}

function yearVariants() {
  const now = new Date().getFullYear();
  return [String(now), String(now + 1)];
}

export async function onRequest(context) {
  const { request, env } = context;

  // allow CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const url = new URL(request.url);
  const qRaw = (url.searchParams.get('q') || '').trim();
  const q = qRaw;
  const prefer = (url.searchParams.get('prefer') || 'local').toLowerCase();

  // Optional seeds you can configure in Cloudflare Pages environment variables:
  // - SITE_KEYWORDS: JSON array string, e.g. '["drone mapping","drone jobs","drone tutorial"]'
  // - LOCATIONS: JSON array string, e.g. '["Michigan","Lansing","Grand Rapids"]'
  // - BRANDS: JSON array string, e.g. '["DJI","Autel","Skydio"]'

  let siteKeywords = [];
  try {
    if (env.SITE_KEYWORDS) siteKeywords = JSON.parse(env.SITE_KEYWORDS);
  } catch (e) {
    siteKeywords = [];
  }

  let locations = [];
  try {
    if (env.LOCATIONS) locations = JSON.parse(env.LOCATIONS);
  } catch (e) { locations = []; }

  let brands = [];
  try {
    if (env.BRANDS) brands = JSON.parse(env.BRANDS);
  } catch (e) { brands = []; }

  // sensible defaults if none provided:
  if (!locations.length) locations = ['near me', 'USA', 'Lansing', 'Grand Rapids'];
  if (!brands.length) brands = ['DJI', 'Autel', 'Skydio', 'Parrot'];

  // modifiers that often form useful long-tail queries:
  const modifiers = [
    'best', 'buy', 'cheap', 'reviews', 'review', '2025', '2024', 'price', 'vs',
    'vs.', 'top', 'comparison', 'how to', 'tutorial', 'best cheap', 'best budget',
    'near me', 'for sale', 'specs', 'features', 'accessories', 'manual', 'setup'
  ];

  // small quality-of-life sanitizers:
  const base = q.replace(/\s+/g, ' ').trim();

  // caching key & edge cache (best-effort)
  const cache = caches.default;
  const cacheKey = `/noapi_suggest?q=${encodeURIComponent(base)}&site=${encodeURIComponent(JSON.stringify(siteKeywords))}`;
  try {
    const cached = await cache.match(cacheKey);
    if (cached) {
      const cachedBody = await cached.text();
      return new Response(cachedBody, {
        status: 200,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      });
    }
  } catch (e) {
    // ignore cache access errors
  }

  let suggestions = [];

  // 1) If there's no query but site keywords exist -> return seeded site keywords (good for "discover")
  if (!base && siteKeywords && siteKeywords.length) {
    suggestions = uniqKeepOrder(siteKeywords).slice(0, 50);
    const body = JSON.stringify({ source: 'site-seed', queries: suggestions });
    try { await cache.put(cacheKey, new Response(body, { headers: {'Content-Type': 'application/json'} })); } catch(e){}
    return new Response(body, { status: 200, headers: { ...corsHeaders(), 'Content-Type': 'application/json' }});
  }

  // 2) If user provided a query, produce algorithmic suggestions from multiple strategies
  if (base) {
    // a) the raw query itself
    suggestions.push(base);

    // b) common modifiers appended and prefixed
    suggestions.push(...combine(base, ['best','reviews','review','price','buy','cheap','top','vs']));
    suggestions.push(...combine(base, ['how to','tutorial','setup','manual'], false));
    suggestions.push(...combine(base, ['for sale','for beginners','beginner guide'], false));
    suggestions.push(...combine(base, yearVariants(), false));

    // c) location variants
    suggestions.push(...combine(base, locations, false));
    suggestions.push(...combine(base, locations.map(l => `near ${l}`), false));

    // d) brand + product combos
    suggestions.push(...combine(base, brands, false));
    suggestions.push(...combine(base, brands, true)); // brand + base

    // e) split multi-word queries into useful sub-phrases
    const tokens = base.split(/\s+/).filter(Boolean);
    for (let i = 0; i < tokens.length; i++) {
      const prefix = tokens.slice(0, i+1).join(' ');
      suggestions.push(prefix);
      suggestions.push(`${prefix} ${tokens.slice(i+1).join(' ')}`.trim());
      suggestions.push(...combine(prefix, ['best','reviews','price']));
    }

    // f) add synonyms / small static map (no external API)
    const synonymMap = {
      'buy': ['purchase', 'order'],
      'cheap': ['budget', 'affordable'],
      'review': ['opinion','rating','test'],
      'drone': ['quadcopter','uav']
    };
    for (const [k, vals] of Object.entries(synonymMap)) {
      if (base.toLowerCase().includes(k)) {
        for (const v of vals) suggestions.push(base.toLowerCase().replace(k, v));
      }
    }

    // g) join with site keywords for long-tail blends if available
    for (const sk of siteKeywords.slice(0, 25)) {
      suggestions.push(`${base} ${sk}`);
      suggestions.push(`${sk} ${base}`);
    }

    // h) add small permutations and clean up
    // add plural/singular basic forms
    if (!base.endsWith('s')) suggestions.push(base + 's');

    // dedupe & sanitize order-preserving
    suggestions = uniqKeepOrder(suggestions).slice(0, 200); // limit
  }

  const result = { source: 'local', queries: suggestions };

  // cache result (short TTL)
  try {
    await cache.put(cacheKey, new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } }));
  } catch (e) {}

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
  });
}
