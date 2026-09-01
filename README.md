# Securly Games

A static HTML5 games site with a home grid, tools, credits, tutorial, and dashboard. The public site uses GitHub + jsDelivr.

## CDN

Repository: https://github.com/onlyyzzz-cmyk/securly-games

Base URL:

```text
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/
```

Main index:

https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/index.html

Catalogs:

- https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games.json
- https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/tools.json

Game files use:

```text
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games/FILENAME.html
```

Tool files use:

```text
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/tools/FILENAME.html
```

URL-encode spaces and special characters in filenames. For example:

```text
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games/adventure%20drivers.html
```

## JavaScript bookmarklet

Copy this exact JavaScript into a bookmark’s URL field. It explicitly fetches the CDN `index.html`, opens `about:blank`, shows a loading screen, and writes the fetched index document into the new window.

```javascript
javascript:(function(){var u="https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/index.html",w=window.open("about:blank","_blank");if(!w){alert("Allow pop-ups first.");return;}w.document.open();w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Loading Securly Games</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#17111d;color:#fff;font:18px Arial}</style></head><body>Loading Securly Games…</body></html>');w.document.close();fetch(u,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("index.html failed: "+r.status);return r.text()}).then(function(html){w.document.open();w.document.write(html);w.document.close()}).catch(function(e){w.document.open();w.document.write('<!doctype html><body style="background:#17111d;color:#fff;font:18px Arial;padding:24px"><h1>CDN load failed</h1><p>'+e.message+'</p></body>');w.document.close()})})();
```

This bookmarklet loads the complete `index.html`, including its game catalog, tools catalog, inline styling, and game/tool links. Use the direct GitHub Pages or another static-host URL if you need browser-native execution of repository HTML; jsDelivr is primarily a file CDN and may return HTML as text.

## Caching

The `@main` URL can be cached. For an exact revision, replace `main` with a commit hash or release tag:

```text
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@6053780/index.html
```

## Files

- `index.html` — self-contained CDN home page
- `index.css` — legacy/shared site stylesheet
- `games.json` / `tools.json` — catalogs
- `games/` / `tools/` — HTML5 games and tools
- `tools.html`, `credits.html`, `tutorial.html`, `dashboard.html`, `submit.html`, `404.html` — supporting pages
- `index.js` — optional local static server

The catalogs currently contain 54 games and 3 tools.
