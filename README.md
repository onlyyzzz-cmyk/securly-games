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

Copy this exact JavaScript into a bookmark’s URL field. It opens `about:blank`, shows a loading screen, fetches the games catalog, and writes the game list into the new window. A search box at the top filters the list as you type, so any game (including Google Baseball) is easy to find. When you click a game it fetches that HTML file, injects a `<base>` tag pointing at the game’s CDN folder (skipped if the game already defines its own `<base>`), and writes it with `document.write()` so the game’s JavaScript and relative assets (like `Build/UnityLoader.js` or `themes/.../home.css`) resolve correctly.

```javascript
javascript:(function(){try{var C="https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/",w=window.open("about:blank","_blank");if(!w){w=window.open();}if(!w){alert("Popup blocked — allow pop-ups for this site, then try the bookmark again.");return;}function esc(x){return String(x).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}function page(body,title){return'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>body{margin:0;min-height:100vh;background:#0b1220;color:#eef5ff;font:16px Arial;padding:24px;box-sizing:border-box}a{color:#69d2ff}li{margin:9px 0}input{margin:0 0 10px;padding:9px 12px;width:100%;max-width:340px;border:1px solid #69d2ff;border-radius:8px;background:#111d33;color:#fff;font-size:15px;box-sizing:border-box}.loading{display:grid;place-items:center;min-height:90vh;font-size:18px}.err{color:#ff6b6b}#exit{position:fixed;top:14px;right:14px;z-index:999999;padding:10px 14px;border:1px solid #69d2ff;border-radius:8px;background:#111d33;color:#fff;font-weight:bold;cursor:pointer}#full{position:fixed;top:14px;right:88px;z-index:999999;padding:10px 14px;border:1px solid #69d2ff;border-radius:8px;background:#111d33;color:#fff;font-weight:bold;cursor:pointer}</style></head><body>'+body+'</body></html>'}function write(x){w.document.open();w.document.write(x);w.document.close();var e=w.document.getElementById("exit"),f=w.document.getElementById("full");if(e)e.onclick=function(){w.close()};if(f)f.onclick=function(){var d=w.document.documentElement;(d.requestFullscreen||d.webkitRequestFullscreen||d.msRequestFullscreen).call(d)}}function load(u,text){return fetch(u,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("HTTP "+r.status+" for "+u);return text?r.text():r.json()})}function play(html,dir){if(!/<base\s/i.test(html)){var base='<base href="'+C+dir+'/">';if(/<head[^>]*>/i.test(html))html=html.replace(/<head([^>]*)>/i,function(m,a){return'<head'+a+'>'+base});else if(/<html[^>]*>/i.test(html))html=html.replace(/<html([^>]*)>/i,function(m,a){return'<html'+a+'>'+base});else html=base+html;}write(html)}function launcher(x){var items=x.map(function(n){return{name:n,path:"games/"+encodeURIComponent(n)}});write(page('<button id="exit">Exit</button><button id="full">Fullscreen</button><input id="q" placeholder="Search games…"><h1>Securly Games</h1><h2 id="count">Games (0 of 0)</h2><ul id="list"></ul>',"Securly Games"));var inp=w.document.getElementById("q"),list=w.document.getElementById("list"),count=w.document.getElementById("count");function draw(q){q=(q||"").toLowerCase();var out=items.filter(function(it){return it.name.toLowerCase().indexOf(q)>-1});if(count)count.textContent="Games ("+out.length+" of "+items.length+")";if(list)list.innerHTML=out.map(function(it){return'<li><a href="'+C+it.path+'" data-file="'+it.path+'">'+esc(it.name)+'</a></li>'}).join("");Array.prototype.forEach.call(w.document.querySelectorAll("[data-file]"),function(a){a.onclick=function(e){e.preventDefault();var p=a.getAttribute("data-file");write(page('<div class="loading">Loading '+esc(a.textContent)+'…</div>',"Loading"));load(C+p,true).then(function(html){play(html,p.split("/")[0])}).catch(function(e){write(page('<h1>Could not load file</h1><p class="err">'+esc(e&&e.message||e)+'</p>',"Load failed"))})}})}if(inp)inp.oninput=function(){draw(inp.value)};draw("")}write(page('<div class="loading">Loading…</div>',"Loading"));load(C+"games.json").then(function(x){if(!Array.isArray(x))throw Error("games.json was not a list");launcher(x)}).catch(function(e){write(page('<button id="exit">Exit</button><h1>CDN load failed</h1><p class="err">'+esc(e&&e.message||e)+'</p><p>Tip: some sites block pop-ups or block requests to the CDN — try running the bookmark from a different page.</p>',"Load failed"))})}catch(err){try{write(page('<h1>Bookmarklet error</h1><p class="err">'+esc(err&&err.message||err)+'</p>',"Error"));}catch(e2){alert("Bookmarklet error: "+(err&&err.message||err));}}})();
```

Notes:

- jsDelivr serves repository HTML files as `text/plain`, so the loader fetches the file and writes it into `about:blank` instead of linking directly. This is why the game JavaScript runs from the loader.
- The injected `<base>` tag makes every relative script/style/image reference in a game resolve against its CDN folder.
- Exit and Fullscreen appear only on the launcher screen, not on game pages.
- The search box filters the game list as you type; the counter shows matches out of the full catalog.
- Games with their own `<base>` tag (like Google Baseball) are left untouched, while games without one get the CDN `<base>` injected.
- Use a commit-hash URL (below) for an exact cached revision instead of `@main`.

Troubleshooting:

- Nothing happens at all when you click it — the code got mangled while copying. Re-copy it from this page: it must be one single line in the bookmark’s URL field.
- You get a “Popup blocked” alert — allow pop-ups for the site you’re on and retry, or run the bookmark from a different page.
- A tab opens but shows “CDN load failed” — the page you ran it from blocks the request to the CDN. Run the bookmark from a different page.

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
