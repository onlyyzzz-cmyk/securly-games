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
javascript:(function(){var C="https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/",w=window.open("about:blank","_blank");if(!w){alert("Allow pop-ups first.");return;}function write(x){w.document.open();w.document.write(x);w.document.close()}function esc(x){return String(x).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}function load(u){return fetch(u,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error(r.status);return r.json()})}var css='<style>body{margin:0;background:#0b1220;color:#eef5ff;font:16px Arial;padding:24px}a{color:#69d2ff}li{margin:9px 0}.loading{display:grid;place-items:center;min-height:90vh;font-size:18px}</style>';write('<!doctype html><html><head><meta charset="utf-8"><title>Loading Securly Games</title>'+css+'</head><body><div class="loading">Loading CDN catalogs…</div></body></html>');Promise.all([load(C+"games.json"),load(C+"tools.json")]).then(function(x){var links=function(a,f){return a.map(function(n){return'<li><a href="'+C+f+'/'+encodeURIComponent(n)+'" data-file="'+f+'/'+encodeURIComponent(n)+'">'+esc(n)+'</a></li>'}).join('')};write('<!doctype html><html><head><meta charset="utf-8"><title>Securly Games</title>'+css+'</head><body><h1>Securly Games</h1><h2>Games ('+x[0].length+')</h2><ul>'+links(x[0],"games")+'</ul><h2>Tools ('+x[1].length+')</h2><ul>'+links(x[1],"tools")+'</ul></body></html>');Array.prototype.forEach.call(w.document.querySelectorAll("[data-file]"),function(a){a.onclick=function(e){e.preventDefault();write('<!doctype html><html><head><title>Loading</title>'+css+'</head><body><div class="loading">Loading '+esc(a.textContent)+'…</div></body></html>');fetch(C+a.getAttribute("data-file"),{cache:"no-store"}).then(function(r){if(!r.ok)throw Error(r.status);return r.text()}).then(function(html){write(html)}).catch(function(e){write('<!doctype html><head>'+css+'</head><body><h1>Could not load file</h1><p>'+esc(e.message)+'</p></body></html>')})}})}).catch(function(e){write('<!doctype html><head>'+css+'</head><body><h1>CDN load failed</h1><p>'+esc(e.message)+'</p></body></html>')})})();
```

This bookmarklet loads the complete the CDN catalogs and game/tool links, without injecting the legacy startup overlay from `index.html`. Use the direct GitHub Pages or another static-host URL if you need browser-native execution of repository HTML; jsDelivr is primarily a file CDN and may return HTML as text.

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
