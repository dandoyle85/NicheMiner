# NicheMiner Suggest Proxy (Cloudflare Pages Function)

What you get:
- `functions/suggest.js` — Cloudflare Pages Function that proxies suggestion requests to Google and DuckDuckGo.
- `static/getSuggestions.js` — Client-side helper to call `/api/suggest`.
- `worker/` — Optional Cloudflare Worker + `wrangler.toml` if you prefer Worker deployment.

## Recommended (free + works)
Use the **Cloudflare Pages Function**. It's free for typical usage, runs at Cloudflare's edge, and integrates directly into Pages deployments.

## How to install (Pages Function)
1. Copy `functions/suggest.js` into your Pages repo at `functions/suggest.js` (root of repo).
2. Copy `static/getSuggestions.js` into your site (e.g., `static/` or import into `app.js`).
3. Replace any direct fetch calls to Google/DuckDuckGo suggestion endpoints with calls to `getSuggestions(q, provider)`.
   - Example: `getSuggestions(q, 'google')` or `getSuggestions(q, 'ddg')`
4. Commit & push to GitHub. Cloudflare Pages will auto-deploy.
5. Test in browser: `fetch('/api/suggest?q=drone&provider=google')` should return suggestions without CORS errors.

## Do I need to delete anything?
No. You **do not** need to delete existing files. Just add `functions/suggest.js` and the client helper, then update your front-end fetches to call `/api/suggest`. If you currently have code that calls the remote endpoints directly, simply replace those calls with `getSuggestions(...)`.

## Production notes
- The function currently returns `Access-Control-Allow-Origin: *`. For production, change this to your exact origin:
  ```js
  // corsHeaders()
  'Access-Control-Allow-Origin': 'https://nicheminer.pages.dev'
  ```
  This is more secure than `*`.
- Google suggestion endpoints are unofficial and can change or rate-limit. Consider switching to official APIs for mission-critical features.
- The function caches responses in `caches.default` (best-effort). Tune TTL or implement additional caching logic if needed.
- Consider adding rate-limiting or abuse protection in the function if you expect heavy traffic.

## Optional: Cloudflare Worker
If you prefer a Worker (deploy with Wrangler), see `worker/worker.js` and `worker/wrangler.toml`.

## Local dev
Use `wrangler pages dev` (or `wrangler dev` for Workers) to test functions locally:
```
# install wrangler
npm i -g wrangler
# from repo root
wrangler pages dev --project-name=<your-pages-project>
```

## Questions / Next steps
- Want me to also prepare a PR patch that updates your specific `app.js` lines? If you paste the relevant snippets from your repo I can provide the exact replacements.
- Want the Worker + GitHub Actions workflow instead of Pages Function? The `worker/` folder includes an example.
