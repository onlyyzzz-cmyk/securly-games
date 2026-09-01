# Securly Games

A static HTML5 games site with a home grid, tools, credits, tutorial, and dashboard. The primary hosting path is **GitHub + jsDelivr**; no Google Apps Script deployment is required for the public site.

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

The current catalogs contain 54 games and 3 tools. Because jsDelivr may serve repository HTML as source text, use the bookmarklet loader below when a game or tool must execute inside a new `about:blank` document.

## JavaScript loader bookmarklet

Copy this JavaScript into a bookmark’s URL field. It fetches the CDN catalogs, shows a loading screen immediately, then fetches each selected HTML document and writes it into a real `about:blank` page so the game or tool can execute instead of displaying source code:

```javascript
javascript:(function(){var C="https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/",w=window.open("about:blank","_blank");if(!w){alert("Allow pop-ups first.");return;}w.document.write('<!doctype html><title>Loading Securly Games…</title><style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#17111d;color:#fff;font:18px Arial}</style><p>Loading CDN catalogs…</p>');function load(url){return fetch(url,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error(r.status);return r.text()})}Promise.all([load(C+"games.json"),load(C+"tools.json")]).then(function(a){var g=JSON.parse(a[0]),t=JSON.parse(a[1]),h='<h1>Securly Games</h1><h2>Games</h2><ul>'+g.map(function(f){return '<li><a href="'+C+'games/'+encodeURIComponent(f)+'" data-cdn="games/'+encodeURIComponent(f)+'">'+f+'</a></li>'}).join('')+'</ul><h2>Tools</h2><ul>'+t.map(function(f){return '<li><a href="'+C+'tools/'+encodeURIComponent(f)+'" data-cdn="tools/'+encodeURIComponent(f)+'">'+f+'</a></li>'}).join('')+'</ul>';w.document.open();w.document.write('<!doctype html><title>Securly Games</title><style>body{font:16px Arial;background:#17111d;color:#fff;padding:24px}a{color:#7dd3fc}li{margin:8px 0}</style>'+h);w.document.close();Array.prototype.forEach.call(w.document.querySelectorAll("a[data-cdn]"),function(a){a.onclick=function(e){e.preventDefault();load(C+a.getAttribute("data-cdn")).then(function(html){w.document.open();w.document.write(html);w.document.close()}).catch(function(){w.document.body.innerHTML="<h1>Could not load this file</h1>"})}})}).catch(function(e){w.document.open();w.document.write("<h1>CDN load failed</h1><p>"+e.message+"</p>");w.document.close()})})();
```

The direct jsDelivr URL can still be used for assets such as SVG, CSS, JSON, JavaScript, and images. The loader is needed for HTML files when the CDN response is displayed as source text.

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

## Legacy hosting

The public static site uses GitHub and jsDelivr only. Legacy Apps Script files, if present in the repository, are not required by the public pages.
