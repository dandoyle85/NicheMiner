// static/getSuggestions_noapi.js
async function getSuggestionsNoAPI(q) {
  const base = (q || '').trim();
  const endpoint = base ? `/api/suggest_noapi?q=${encodeURIComponent(base)}` : `/api/suggest_noapi`;
  try {
    const res = await fetch(endpoint, { method: 'GET' });
    if (!res.ok) {
      console.warn('suggest_noapi failed', res.status);
      return [];
    }
    const js = await res.json();
    return js.queries || [];
  } catch (err) {
    console.warn('suggest_noapi error', err);
    return [];
  }
}

// Export for CommonJS if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getSuggestionsNoAPI };
}
