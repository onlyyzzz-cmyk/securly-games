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
| `/go.html` | Static cloak/redirect page (works on ANY host) |
| `/404.html` | 404 page |

## Run it

**Node server (recommended):**
```bash
node index.js        # serves on PORT or 9482
```
The server auto-generates `games.json` / `tools.json` from the folders, serves the report API, and the `/go` + `/cdn` routes.

**Pure static host (GitHub Pages / Netlify / Cloudflare Pages):**
Upload the files as-is. `games.json` / `tools.json` are committed for static hosts. The report API and `/go` + `/cdn` routes need the Node server — but `go.html` works everywhere.

## Share / cloak links (like pizza.com, but yours)

Links that show only your domain — the target is hidden in base64.

| Link | What it does | Works on |
|---|---|---|
| `/go.html?d=<base64>` | Redirect to the decoded URL | Any host |
| `/go.html?c=<base64>` | Cloak: fetch the target as text and render it (address bar stays on your domain) | Any host |
| `/go?d=<base64>` | Same as go.html, server-side | Node server |
| `/go?c=<base64>` | Same as go.html, server-side | Node server |
| `/cdn?p=index` | Loads the jsDelivr copy of a page (`p=index\|tools\|credits\|dashboard\|tutorial\|bookmart\|submit\|404`) | Node server |

Raw `https://…` URLs work too — no base64 needed (`/go.html?d=https://example.com`).

**Make your own links** — paste this in any browser's devtools console:
```js
btoa('https://whatever-you-want.com')
```

Example (hides `https://gn-math.dev`):
```
https://<your-domain>/go.html?d=aHR0cHM6Ly9nbi1tYXRoLmRldg==
```

## jsDelivr CDN

The site and its pages are also available through the jsDelivr GitHub CDN:

```
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/<file>
```

⚠️ **jsDelivr serves `.html` files as `text/plain` for security reasons** — a raw CDN link to a page shows code instead of rendering. Never share raw CDN links. Use the cloak links above (`/go.html?c=`, `/go?c=`, `/cdn?p=…`) — they fetch the CDN copy as text and render it on your domain.

CDN copies update after you push to GitHub; jsDelivr caches them for up to ~12 hours (you can purge a file early at jsdelivr.com).

## Report broken / dev dashboard

- Every game card has a ⚠️ **report** button — reports are saved to `reports.json` on the server.
- `/dashboard.html` — sign in with the owner email (`rhonodfletcher@gmail.com` or `rhonodfletcher32@gmail.com`) to see broken games and resolve/reopen reports.
- API: `POST /api/report`, `GET /api/reports`, `POST /api/resolve` (Node server only).
