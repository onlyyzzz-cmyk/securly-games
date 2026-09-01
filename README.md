# Securly Games

A static HTML5 games site with a home grid, tools, credits, tutorial, bookmark page, and dashboard. The primary hosting path is **GitHub + jsDelivr**; no Google Apps Script deployment is required for the public site.

## GitHub and jsDelivr

Repository: <https://github.com/onlyyzzz-cmyk/securly-games>

Branch: `main`

Base CDN URL:

```text
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/
```

Every public static file keeps its repository path and can be addressed by appending that path:

| GitHub file | jsDelivr URL |
|---|---|
| `index.html` | `https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/index.html` |
| `index.css` | `https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/index.css` |
| `games.json` | `https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games.json` |
| `tools.json` | `https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/tools.json` |
| `tools.html` | `https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/tools.html` |
| `games/<filename>.html` | `https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games/<filename>.html` |
| `tools/<filename>.html` | `https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/tools/<filename>.html` |

For example, the exact URL for `games/adventure drivers.html` is:

```text
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games/adventure%20drivers.html
```

Spaces should be URL-encoded as `%20`. Paths, filenames, capitalization, and extensions must match GitHub exactly.

## How the site loads

`index.html` loads the shared stylesheet and catalogs from jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/index.css">
<script>
  fetch('https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games.json')
    .then(response => response.json());
</script>
```

Game cards open the corresponding file in `games/` directly on jsDelivr. Tools use the same pattern under `tools/`. Supporting pages are regular static HTML files and link to one another with `.html` paths, so they work on GitHub Pages, another static host, or directly through jsDelivr.

## Test the CDN

Open these URLs in a browser:

- Home: <https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/index.html>
- CSS: <https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/index.css>
- Games catalog: <https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games.json>
- Tools catalog: <https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/tools.json>
- Tools page: <https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/tools.html>

The current catalogs contain 54 games and 3 tools.

## Caching and updates

The `@main` URL is convenient but cached by jsDelivr. After pushing changes, allow a short time for the cache to refresh. For an immutable version, use a release tag or commit hash:

```text
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@v1.0.0/index.css
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@aaacc21/index.css
```

Use a commit hash when you need a URL that always points to one exact revision. Use a tag when you want a named version that can be updated intentionally.

## GitHub Pages

For a normal website URL instead of individual CDN file URLs, enable GitHub Pages for the `main` branch and root folder in the repository settings. GitHub Pages serves the complete site, while jsDelivr is ideal for shared CSS, JSON, images, SVG files, JavaScript, and individual games.

## Files

- `index.html` — home game grid and CDN loader
- `index.css` — shared stylesheet
- `games.json` / `tools.json` — game and tool catalogs
- `games/` / `tools/` — HTML5 games and tools
- `tools.html`, `credits.html`, `tutorial.html`, `dashboard.html`, `submit.html`, `404.html` — supporting pages
- `index.js` — optional local static server

## Local preview

No build step is required for the static site. Use any static server, or the included Node server:

```bash
node index.js
```

The server uses the injected `PORT` when available and regenerates the catalogs from `games/` and `tools/`.

## Google Apps Script

Google Apps Script files remain in the repository only as a legacy/manual export. The public static site does not depend on Apps Script, `google.script.run`, or an Apps Script URL. Do not use the old Apps Script deployment URLs for the CDN version.
