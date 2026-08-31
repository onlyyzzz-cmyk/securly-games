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

Deploy note: the dashboard also reads `games.json` to show the game list; on
Apps Script that file is served like any other page, so add `games.json` to
the script project as an HTML file named `games` if you want the games panel
to populate.

## Auto-deploy with GitHub Actions

A workflow in `.github/workflows/clasp-push.yml` pushes the project to Apps
Script whenever you push to `main`. It runs `clasp push` headlessly on GitHub
runners using a **GCP service account** stored as GitHub Secrets (a regular
interactive `clasp login` token can't be shared into CI).

### One-time setup

1. **GCP project** (console.cloud.google.com) → enable the **Apps Script API**
   and **Drive API**.
2. Create a **Service Account**, download its JSON key, and *do not commit it*.
3. Create the Apps Script project (script.google.com or `clasp create`).
4. **Share the Apps Script project with the service account's email as Editor**
   (Project Settings → Share).
5. Put the service-account JSON (as a single-line string) into a GitHub secret
   named `CLASP_SERVICE_ACCOUNT`, and the script id into `CLASP_SCRIPT_ID`
   (Settings → Secrets and variables → Actions).
6. `.clasp.json` already contains your script id; the workflow also injects it
   from the `CLASP_SCRIPT_ID` secret so keep that secret up to date too.

From then on every push/merge to `main` runs the workflow and your Apps
Script app updates automatically.

`.claspignore` keeps the heavy `games/` and `tools/` folders (and repo
dotfiles/docs) out of the push — Apps Script projects are flat and large
game HTMLs often fail to import. The core pages + `index.gs` + `appsscript.json`
go up on every deploy; games can be pushed manually when they import cleanly.