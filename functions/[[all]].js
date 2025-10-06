export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  const json = (data, status = 200, headers = {}) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "content-type": "application/json; charset=utf-8", ...headers },
    });

  async function grab(u, asJson = false) {
    const res = await fetch(u, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
        "accept-language": "en-US,en;q=0.9",
        "accept": "*/*",
      },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return asJson ? res.json() : res.text();
  }

  const ok = (items, source) => ({ ok: true, source, items });
  const fail = (message, source) => ({ ok: false, source, message });

  try {
    // Google Autocomplete
    if (path === "/api/suggest") {
      const q = url.searchParams.get("q") ?? "profitable niches";
      const ep =
        "https://suggestqueries.google.com/complete/search?client=firefox&q=" +
        encodeURIComponent(q);
      const data = await grab(ep, true);
      const items = (data?.[1] ?? [])
        .slice(0, 25)
        .map((s) => ({ niche: s, signals: { source: "google_suggest" } }));
      return json(ok(items, "Google Suggest"));
    }

    // YouTube Autocomplete
    if (path === "/api/ytsuggest") {
      const q = url.searchParams.get("q") ?? "how to start";
      const ep =
        "https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=" +
        encodeURIComponent(q);
      const data = await grab(ep, true);
      const items = (data?.[1] ?? [])
        .slice(0, 25)
        .map((s) => ({ niche: s, signals: { source: "yt_suggest" } }));
      return json(ok(items, "YouTube Suggest"));
    }

    // Wikipedia Top 25 (scrape)
    if (path === "/api/wiki-top") {
      const html = await grab(
        "https://en.wikipedia.org/wiki/Wikipedia:Top_25_Report"
      );
      const matches = Array.from(
        html.matchAll(/<a href="\/wiki\/[^"]+"[^>]*>([^<]{3,80})<\/a>/g)
      )
        .map((m) => m[1])
        .filter((t) => !t.includes(":") && !t.includes("Wikipedia"))
        .slice(0, 40);
      const items = matches.map((t) => ({
        niche: t,
        signals: { source: "wikipedia_top" },
      }));
      return json(ok(items, "Wikipedia Top 25"));
    }

    // Reddit Hot feed (JSON)
    if (path === "/api/reddit") {
      const sub = url.searchParams.get("sub") ?? "Entrepreneur";
      const data = await grab(
        `https://www.reddit.com/r/${encodeURIComponent(sub)}/hot.json?limit=30`,
        true
      );
      const items =
        data?.data?.children
          ?.map((p) => p?.data?.title)
          ?.filter(Boolean)
          .slice(0, 30)
          .map((title) => ({
            niche: title,
            signals: { source: `reddit:r/${sub}` },
          })) ?? [];
      return json(ok(items, `Reddit r/${sub}`));
    }

    // Pinterest Trends (best-effort)
    if (path === "/api/pinterest") {
      const html = await grab("https://www.pinterest.com/trends/");
      const tags = Array.from(html.matchAll(/#[a-z0-9][a-z0-9_-]{2,32}/gi))
        .map((m) => m[0].slice(1))
        .slice(0, 25);
      const items = tags.map((t) => ({
        niche: t.replace(/[-_]/g, " "),
        signals: { source: "pinterest" },
      }));
      return json(ok(items, "Pinterest Trends"));
    }

    // Trends fallback
    if (path === "/api/trends") {
      const q = url.searchParams.get("q") ?? "side hustle";
      const geo = url.searchParams.get("geo") ?? "US";
      const ep =
        "https://suggestqueries.google.com/complete/search?client=firefox&q=" +
        encodeURIComponent(q);
      const data = await grab(ep, true);
      const items = (data?.[1] ?? [])
        .slice(0, 25)
        .map((s) => ({
          niche: s,
          signals: { source: "trends_like", geo, trendBoost: 1 },
        }));
      return json(ok(items, "Trends (fallback)"));
    }

    // Amazon Best Sellers
    if (path === "/api/amazon") {
      try {
        const html = await grab("https://www.amazon.com/Best-Sellers/zgbs");
        const titles = Array.from(
          html.matchAll(/<div class="p13n-sc-truncate[^\>]*>([^<]+)<\/div>/g)
        )
          .map((m) => m[1].trim())
          .filter((t) => t.length > 5)
          .slice(0, 25);
        const items = titles.map((t) => ({
          niche: t,
          signals: { source: "amazon_bestsellers" },
        }));
        return json(ok(items, "Amazon Best Sellers"));
      } catch (e) {
        return json(ok([], "Amazon Best Sellers (skipped)"));
      }
    }

    // YouTube Trending (simple scrape of titles)
    if (path === "/api/youtube-trending") {
      const html = await grab("https://www.youtube.com/feed/trending");
      const titles = Array.from(html.matchAll(/title="([^"]{5,100})"/g))
        .map((m) => m[1])
        .slice(0, 25);
      const items = titles.map((t) => ({
        niche: t,
        signals: { source: "youtube_trending" },
      }));
      return json(ok(items, "YouTube Trending"));
    }

    // X/Twitter Trends via Trends24 (scrape)
    if (path === "/api/x-trends") {
      const html = await grab("https://trends24.in/united-states/");
      const tags = Array.from(html.matchAll(/>#?([\w][\w_-]{2,40})<\/a>/g))
        .map((m) => m[1])
        .slice(0, 25);
      const items = tags.map((t) => ({
        niche: t.replace(/[_-]/g, " "),
        signals: { source: "x_trends" },
      }));
      return json(ok(items, "X/Twitter Trends (Trends24)"));
    }

    // ProductHunt Trending (scrape)
    if (path === "/api/producthunt") {
      const html = await grab("https://www.producthunt.com/");
      const names = Array.from(html.matchAll(/data-test="post-name"[^>]*>([^<]+)<\/a>/g))
        .map((m) => m[1].trim())
        .slice(0, 25);
      const items = names.map((t) => ({
        niche: t,
        signals: { source: "producthunt" },
      }));
      return json(ok(items, "ProductHunt Trending"));
    }

    // Default
    if (path.startsWith("/api/"))
      return json(fail("Unknown endpoint: " + path, "router"), 404);

    return new Response("NicheMiner Functions OK", { status: 200 });
  } catch (err) {
    return json({ ok: false, message: String(err) }, 500);
  }
}
