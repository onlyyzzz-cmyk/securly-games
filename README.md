# Securly Games

A static HTML games site — home grid, tools, credits, tutorial, bookmark
pages, and a dev dashboard — designed to be hosted from GitHub and served as
a Google Apps Script web app.

## Host on Google Apps Script

The Web App entry point is `index.gs`. It runs `doGet()` and serves each page
as HTML.

1. In [script.google.com](https://script.google.com), create a **New project**.
2. Paste `index.gs` into the editor's `Code.gs` file (or paste it into a file
   named `index.gs`).
3. For each page you want to serve, add the matching `.html` file to the
   project (Files → Add file → HTML). You need at least `index.html`
   (the home grid), plus `tools.html`, `credits.html`, `tutorial.html`,
   `dashboard.html`, `bookmart.html`, `submit.html`, `404.html` as desired.
   Games live in `games/`; add any game `.html` file you want playable.
4. Deploy → **New deployment** → type **Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Your site is live at the Web App URL it gives you.

### Routing

The doGet reads a `?p=` query parameter:

```
https://script.google.com/macros/s/<APP_ID>/exec            -> index.html
https://script.google.com/macros/s/<APP_ID>/exec?p=tools    -> tools.html
https://script.google.com/macros/s/<APP_ID>/exec?p=credits  -> credits.html
https://script.google.com/macros/s/<APP_ID>/exec?p=games/NAME -> games/NAME.html
```

Unknown pages fall back to `index.html`.

## Local preview (dev only)

No build step needed — just serve this folder:

```bash
node index.js   # serves the site on PORT (default 9482), regenerates games.json/tools.json
```

`index.js` is a simple static server that also auto-lists the `games/` and
`tools/` folders into `games.json` and `tools.json`. On Google Apps Script the
server is not used; each page is served directly as HTML.

## Files

- `index.html` — home game grid
- `index.css` — shared stylesheet (used by every page)
- `games.json` / `tools.json` — auto-generated game/tool lists (kept up to date)
- `games/`, `tools/` — the HTML5 games and tools (add a file, and the grid picks it up)
- `tools.html`, `credits.html`, `tutorial.html`, `dashboard.html`, `bookmart.html`, `submit.html`, `404.html`
- `reports.json` — report-broken storage (used by the Node server)
- `index.gs` — Google Apps Script web app entry point

## Report-broken & dashboard

The →report broken← button submits to `/api/report`. That endpoint lives in
`index.js` (the Node server). On Google Apps Script there's no server, so the
report and dashboard need either [Google Sheets](https://developers.google.com/apps-script/reference/spreadsheet)
storage in `index.gs`, or wiring to another backend. Ask if you want that wired up.