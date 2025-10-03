// src/lib/live-sources.js
// Fetch live keyword + trend data from free sources

// --- Google Trends ---
export async function fetchTrends(niche) {
  try {
    const res = await fetch(
      `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=en-US&tz=-480&req={"restriction":{"geo":{}},"keyword":"${encodeURIComponent(
        niche
      )}","time":"today 1-m"}`
    );

    const text = await res.text();
    const json = JSON.parse(text.replace(")]}',", ""));
    return json.default.rankedList[0].rankedKeyword.map((k) => ({
      keyword: k.query,
      trend: k.value[0],
      trendHistory: k.value, // array for sparkline
    }));
  } catch (err) {
    console.error("Google Trends error:", err);
    return [];
  }
}

// --- Keyword API ---
export async function fetchKeywordMetrics(keyword) {
  try {
    const res = await fetch(
      `https://api.keywordseverywhere.com/v1/get_keyword_data?keyword=${encodeURIComponent(
        keyword
      )}`
    );
    const data = await res.json();
    return {
      keyword,
      volume: data.volume || 0,
      competition: data.competition || "n/a",
    };
  } catch (err) {
    console.error("Keyword API error:", err);
    return { keyword, volume: 0, competition: "n/a" };
  }
}

// --- Combined Drilldown ---
export async function drilldownNiche(niche) {
  const trends = await fetchTrends(niche);
  const enriched = await Promise.all(
    trends.map(async (t) => {
      const metrics = await fetchKeywordMetrics(t.keyword);
      return { ...t, ...metrics };
    })
  );
  return enriched;
}