# Securly Games

A static HTML5 games site with a home grid, credits, tutorial, and dashboard. The public site uses GitHub + jsDelivr.

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

Game files use:

```text
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games/FILENAME.html
```

URL-encode spaces and special characters in filenames. For example:

```text
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/games/adventure%20drivers.html
```

## JavaScript bookmarklet

Copy this exact JavaScript into a bookmark’s URL field. It opens `about:blank`, shows a loading screen, fetches the games catalog, and writes the game list into the new window. When you click a game it fetches that HTML file, injects a `<base>` tag pointing at the game’s CDN folder, and writes it with `document.write()` so the game’s JavaScript and relative assets (like `Build/UnityLoader.js` or `themes/.../home.css`) resolve correctly.

```javascript
javascript:(function(){var C="https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/",w=window.open("about:blank","_blank");if(!w){alert("Allow pop-ups first.");return;}function esc(x){return String(x).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}function page(body,title){return'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>body{margin:0;min-height:100vh;background:#0b1220;color:#eef5ff;font:16px Arial;padding:24px;box-sizing:border-box}a{color:#69d2ff}li{margin:9px 0}.loading{display:grid;place-items:center;min-height:90vh;font-size:18px}#exit{position:fixed;top:14px;right:14px;z-index:999999;padding:10px 14px;border:1px solid #69d2ff;border-radius:8px;background:#111d33;color:#fff;font-weight:bold;cursor:pointer}#full{position:fixed;top:14px;right:88px;z-index:999999;padding:10px 14px;border:1px solid #69d2ff;border-radius:8px;background:#111d33;color:#fff;font-weight:bold;cursor:pointer}</style></head><body>'+body+'</body></html>'}function write(x){w.document.open();w.document.write(x);w.document.close();var e=w.document.getElementById("exit"),f=w.document.getElementById("full");if(e)e.onclick=function(){w.close()};if(f)f.onclick=function(){var d=w.document.documentElement;(d.requestFullscreen||d.webkitRequestFullscreen||d.msRequestFullscreen).call(d)}}function load(u,text){return fetch(u,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error(r.status);return text?r.text():r.json()})}function play(html,dir){var base='<base href="'+C+dir+'/">';if(/<head[^>]*>/i.test(html))html=html.replace(/<head([^>]*)>/i,function(m,a){return'<head'+a+'>'+base});else if(/<html[^>]*>/i.test(html))html=html.replace(/<html([^>]*)>/i,function(m,a){return'<html'+a+'>'+base});write(html)}write(page('<div class="loading">Loading CDN catalog…</div>',"Loading"));load(C+"games.json").then(function(x){var links=function(a){return a.map(function(n){var p='games/'+encodeURIComponent(n);return'<li><a href="'+C+p+'" data-file="'+p+'">'+esc(n)+'</a></li>'}).join('')};write(page('<button id="exit">Exit</button><button id="full">Fullscreen</button><h1>Securly Games</h1><h2>Games ('+x.length+')</h2><ul>'+links(x)+'</ul>',"Securly Games"));Array.prototype.forEach.call(w.document.querySelectorAll("[data-file]"),function(a){a.onclick=function(e){e.preventDefault();var p=a.getAttribute("data-file");write(page('<div class="loading">Loading '+esc(a.textContent)+'…</div>',"Loading"));load(C+p,true).then(function(html){play(html,p.split("/")[0])}).catch(function(e){write(page('<h1>Could not load file</h1><p>'+esc(e.message)+'</p>',"Load failed"))})}})}).catch(function(e){write(page('<button id="exit">Exit</button><h1>CDN load failed</h1><p>'+esc(e.message)+'</p>',"Load failed"))})})();
```

Notes:

- jsDelivr serves repository HTML files as `text/plain`, so the loader fetches the file and writes it into `about:blank` instead of linking directly. This is why the game JavaScript runs from the loader.
- The injected `<base>` tag makes every relative script/style/image reference in a game resolve against its CDN folder.
- Exit and Fullscreen appear only on the launcher screen, not on game pages.
- Use a commit-hash URL (below) for an exact cached revision instead of `@main`.

## Caching

The `@main` URL can be cached. For an exact revision, replace `main` with a commit hash or release tag:

```text
https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@6053780/index.html
```

## Files

- `index.html` — self-contained CDN home page
- `index.css` — legacy/shared site stylesheet
- `games.json` — game catalog
- `games/` — HTML5 games
- `credits.html`, `tutorial.html`, `dashboard.html`, `submit.html`, `404.html` — supporting pages
- `index.js` — optional local static server

The catalog currently contains 54 games.
