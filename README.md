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

Reports are stored in a **Google Sheet**. `index.gs` creates a spreadsheet
automatically on first use and saves report data through the server
functions `appReport`, `appResolve`, and `appGetReports`:

- When the site runs on **Google Apps Script**, the →report broken← button and
the dashboard call those functions via `google.script.run` — no backend needed.
- When run locally with the **Node server** (`node index.js`), the same
features fall back to the `/api/report`, `/api/resolve`, and `/api/reports`
routes.

So the frontend works on either host without changes.

Deploy note: the games/tools lists are embedded into the Apps Script build
(`getGames()` / `getTools()` server functions), so the home grid, tools page
and dashboard all populate on Apps Script too.

## Auto-deploy with GitHub Actions

A workflow in `.github/workflows/clasp-push.yml` pushes the project to Apps
Script whenever you push to `main`. It builds the Apps Script output
(`node scripts/build-gas.mjs` — inlines `index.css` and embeds the
games/tools lists, because Apps Script can't serve static assets) and then
runs `clasp push` headlessly on GitHub runners.

### One-time setup

1. **Enable the Apps Script API for your account** (one click):
   https://script.google.com/home/usersettings — make sure **Google Apps
   Script API** is ON.
2. **Log in once from your own terminal** (this produces the refresh token
   CI reuses):
   ```bash
   npm install -g @google/clasp   # if not already installed
   clasp login --no-localhost
   ```
   Copy the URL it prints, open it in a browser, allow clasp, then paste the
   authorization code back into the terminal. This writes `~/.clasprc.json`.
3. **Put those credentials into a GitHub secret** (Settings → Secrets and
   variables → Actions, or your `securly` Environment):
   - Name: `CLASPRC_JSON`
   - Value: the entire contents of `~/.clasprc.json` — a single-line JSON;
     run `cat ~/.clasprc.json` to copy it

`.clasp.json` already contains your script id, and your account owns the
project (it was created with `clasp create`), so no extra sharing is needed.

From then on every push/merge to `main` runs the workflow and your Apps
Script app updates automatically.

### Why not a service account?

The first version of this workflow used a GCP service account, but Google
blocks service-account *pushes* to Apps Script ("User has not enabled the
Apps Script API" — the toggle at script.google.com/home/usersettings only
exists for real accounts). It's a known, still-open limitation
(google/clasp#1051). The refresh-token approach above is the supported path.

`.claspignore` keeps the heavy `games/` and `tools/` folders (and repo
dotfiles/docs) out of the push — Apps Script projects are flat and large
game HTMLs often fail to import. The core pages + `index.gs` + `appsscript.json`
go up on every deploy; games can be pushed manually when they import cleanly.