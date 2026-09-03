# Securly Games

A static HTML5 games site. You can play games two ways: through the website, or from any page using the JavaScript bookmarklet.

## Website

Open the site and click any game to play:

https://esm.sh/gh/onlyyzzz-cmyk/securly-games@main/index.html

## JavaScript bookmarklet

Copy this exact JavaScript into a bookmark’s URL field. It opens the launcher from **esm.sh** in a new tab (a plain navigation, so restrictive pages can’t block it). The launcher then streams each game into an `about:blank` window with `document.write()` — no game code is ever rewritten and the game window’s address bar stays clean.

```javascript
javascript:(function(){var u="https://esm.sh/gh/onlyyzzz-cmyk/securly-games@main/launcher.html";var w=window.open(u,"_blank");if(!w){w=window.open();}if(!w){alert("Popup blocked — allow pop-ups for this site, then try the bookmark again.");}})();
```

Notes:

- The launcher tries **jsDelivr** first, then **esm.sh**, then **githack**, for the catalog and game files (esm.sh rewrites `.js` files into ES-module stubs; githack is the big-file fallback — CORS enabled, no 20 MB cap).
- Big games live in `big-games.json` (tiny manifest, unlimited entries, mirror URLs supported). Any game listed there appears in the same game list even though it is not in this repo — the launcher and the site both merge it in and stream it from storage.
- Games are fetched as text and re-served through `document.write()` into an `about:blank` popup — the game renders normally and its scripts/assets still load from the CDN.
- Games with their own `<base>` tag (like Google Baseball) keep it; games without one get a `<base>` injected pointing at their CDN folder so relative scripts/styles/assets resolve.
- The toolbar has **Credits** (the team — Acearooni10 · @24k_onlyy — and partners) and **Exit**.
- The search box filters the game cards as you type; the chip shows matches out of the full catalog.

## Big games — hosting options

jsDelivr and esm.sh both cap files around 20 MB, so very large games (full ports with big asset folders) can’t ride the main CDN chain. Big games are **never removed from the catalog** — they stream from a bigger host instead, listed in `big-games.json`.

`big-games.json` holds **any number of games**, one entry each, and every entry supports **mirror URLs**: the loader tries the main URL first, then each mirror in order, then falls back to the normal CDN chain. So a game never fails just because one host is down.

### Option A — githack (no setup, files up to ~100 MB)

Just commit the game to the repo like any other game. The launcher/site fall back to **raw.githack.com**, which serves GitHub files with `Access-Control-Allow-Origin: *` and no 20 MB cap (GitHub allows files up to 100 MB). Nothing else to configure — no account, no storage, no manifest entry.

### Option B — big-game storage (Cloudflare R2 or any big file host)

Very large games (above ~100 MB, or big folders of assets) live on **Cloudflare R2** (free tier: 10 GB storage, zero egress fees) — or any host that serves files over HTTPS with CORS (`Access-Control-Allow-Origin: *`). R2 public access needs a domain connected to the bucket (a subdomain of a domain you own).

How it works:

1. The launcher/site load `games.json` (the repo catalog) **plus** `big-games.json` — the manifest of `{"file": …, "url": …, "mirrors": […]}` entries. Games that only exist in the manifest still show up in the list.
2. When a game is played, every listed host is tried in order (main URL first, then mirrors), each with a long timeout for big files.
3. A `<base>` is injected pointing at the winning host’s folder, so the game’s own assets (a full port’s folder of scripts/sprites/sounds) resolve from the same place. Game code is never rewritten.
4. If every storage host fails, the loader falls back to the normal CDN chain (githack included).
5. `index.js` (dev server) and the dashboard merge the same manifest, so big games show up everywhere.

### Adding a big game

1. Upload the game to the bucket, e.g. `games/`. Multi-file ports go in their own folder, e.g. `games/portal/` — then `url` points at that folder’s HTML file and everything else in the folder loads automatically.
2. Set the bucket CORS policy so the bookmarklet can fetch it from any page:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

3. Add one entry per game to `big-games.json`. `url` is the main host; `mirrors` are optional extra copies tried if the main host is down:

```json
[
  {
    "file": "minecraft 1.8.8.html",
    "url": "https://games.example.com/games/minecraft 1.8.8.html"
  },
  {
    "file": "portal.html",
    "url": "https://games.example.com/games/portal/index.html",
    "mirrors": [
      "https://pub-xxxx.r2.dev/games/portal/index.html",
      "https://backup.example.com/games/portal/index.html"
    ]
  }
]
```

4. Commit and push — the launcher and website pick it up automatically. No game is ever removed from the catalog.

Quick upload with Cloudflare’s CLI (run locally where the game files are):

```bash
npx wrangler r2 object put securly-games/games/portal/index.html --file=index.html --content-type=text/html
```

## Troubleshooting

- Nothing happens at all when you click the bookmark — the code got mangled while copying. Re-copy it from this page: it must be one single line in the bookmark’s URL field.
- You get a “Popup blocked” alert — allow pop-ups for the site you’re on and retry, or run the bookmark from a different page.
- The launcher opens but says it can’t load the catalog — the network is blocking the CDNs. Try a different page or network.
- A game shows “Couldn’t load …” — the fetch was blocked. Try a different page or network.
- A big game fails while the same file opens fine in a browser tab — the host’s CORS policy is missing (paste the policy above), the domain isn’t connected, or every mirror is also down. For games under 100 MB, the simplest fix is Option A: commit the game to the repo and let githack serve it.
- A big game appears in the list but “Couldn’t load”s instantly — double-check the `file` name in `big-games.json` matches the card exactly (including spaces and `.html`).
- A game loads but stays blank — the game’s own assets may be hosted outside this repo/CDN and blocked by the network.