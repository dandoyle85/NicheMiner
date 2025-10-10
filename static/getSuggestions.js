// static/getSuggestions.js
// Client-side helper for calling the Cloudflare Pages Function at /api/suggest
// Drop this file into your site (e.g., /static/) and include it in your build or import into app.js.

async function getSuggestions(q, provider = 'google') {
  if (!q || q.trim() === '') return [];

  const url = `/api/suggest?q=${encodeURIComponent(q)}&provider=${encodeURIComponent(provider)}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      console.warn('suggest proxy failed', res.status);
      return [];
    }
    const text = await res.text();

    // parse results by provider
    if (provider === 'ddg' || provider === 'duckduckgo') {
      // DuckDuckGo returns JSON array of objects: [{phrase: "..."}, ...]
      try {
        const arr = JSON.parse(text);
        return arr.map(o => (o.phrase || o.value || o.text || '').trim()).filter(Boolean);
      } catch (err) {
        console.warn('DDG parse error', err);
        return [];
      }
    } else {
      // Google client=firefox typically returns: ["query", ["sugg1","sugg2"], ...]
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && Array.isArray(parsed[1])) {
          return parsed[1].map(s => (typeof s === 'string' ? s.trim() : '')).filter(Boolean);
        }
      } catch (e) {
        // handle JSONP-like responses by stripping non-array prefix
        try {
          const maybeJson = text.replace(/^[^\[]*/, '').replace(/;?$/, '');
          const parsed2 = JSON.parse(maybeJson);
          if (Array.isArray(parsed2) && Array.isArray(parsed2[1])) return parsed2[1];
        } catch (err) {
          console.warn('Google parse error', err);
        }
      }
    }
  } catch (err) {
    console.warn('suggest fetch error', err);
    return [];
  }
  return [];
}

// Example usage:
// getSuggestions('drone', 'google').then(list => console.log(list));
// getSuggestions('drone', 'ddg').then(list => console.log(list));

// Export for modules if needed:
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getSuggestions };
}
