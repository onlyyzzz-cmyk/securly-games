# 🍕 Pizza Arcade

Unblocked games site. Games auto-load from the `games/` folder, tools from `tools/`.

## Pages

| Page | What it is |
|---|---|
| `/` (`index.html`) | Games library |
| `/tools.html` | Tools |
| `/credits.html` | Credits |
| `/dashboard.html` | Owner dashboard (broken-game reports) |
| `/tutorial.html` | How to play |
| `/bookmart.html` | Blooket hacks |
| `/submit.html` | Community links |
| `/404.html` | 404 page |

## Run it

**Node server (recommended):**
```bash
node index.js        # serves on PORT or 9482
```
The server auto-generates `games.json` / `tools.json` from the folders, serves the report API, and the `/cdn` route.

**Pure static host (GitHub Pages / Netlify / Cloudflare Pages):**
Upload the files as-is. `games.json` / `tools.json` are committed for static hosts. The report API and `/cdn` route need the Node server.

## Add games / tools

Drop a `.html` file into the `games/` (or `tools/`) folder — the list updates automatically (the server regenerates `games.json` / `tools.json` on startup, and pages fetch the live list). The game name is derived from the filename (`escape road 3.html` → "escape road 3").

## Features

- **Built-in player** — games and tools open in a full-screen player with an **exit** button and a **fullscreen** button.
- **Keyboard shortcuts** (desktop): `E` toggles fullscreen, `Q` exits the player (ignored while typing in inputs).
- **Mobile controls** — one tap exits, two quick taps toggles fullscreen.
- **Theme gallery** — pick from hand-picked background themes (Classic default, Pizza Kitchen, Midnight, Forest, Ocean) in Settings → Backgrounds.
- **Cloak** — Settings → Cloak: change the tab title and favicon (pizza 🍕 or a site like Classroom).
- **Panic mode** — Settings → Panic: a key that instantly hides the site.
- **Favorites / Recents / Most played** — sidebar views, stored locally.
- **Report broken** — every game card has a ⚠️ button; reports go to the dev dashboard.

## CDN page loader (`/cdn`)

jsDelivr serves `.html` files as `text/plain` for security reasons, so a raw `cdn.jsdelivr.net/gh/…/*.html` link shows code instead of rendering. The `/cdn` route fixes that — it fetches the jsDelivr copy of a page as text and renders it on your domain:

```
/cdn?p=index       -> https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/index.html
/cdn?p=tools       -> tools.html
/cdn?p=credits     -> credits.html
/cdn?p=dashboard   -> dashboard.html
/cdn?p=tutorial    -> tutorial.html
/cdn?p=bookmart    -> bookmart.html
/cdn?p=submit      -> submit.html
/cdn?p=404         -> 404.html
```

Unknown page names fall back to `index.html`. If the CDN fetch fails, it redirects to the real page.

CDN copies update after you push to GitHub; jsDelivr caches them for up to ~12 hours (you can purge a file early at jsdelivr.com).

## Report broken / dev dashboard

- Every game card has a ⚠️ **report** button — reports are saved to `reports.json` on the server.
- `/dashboard.html` — sign in with the owner email (`rhonodfletcher@gmail.com` or `rhonodfletcher32@gmail.com`) to see broken games and resolve/reopen reports.
- API: `POST /api/report`, `GET /api/reports`, `POST /api/resolve` (Node server only).
