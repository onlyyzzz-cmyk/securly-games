# Securly Games

A static HTML5 games site. You can play games two ways: through the website, or from any page using the JavaScript bookmarklet.

## Website

Open the site and click any game to play:

https://esm.sh/gh/onlyyzzz-cmyk/securly-games@main/index.html

## JavaScript bookmarklet

Copy this exact JavaScript into a bookmark’s URL field. It opens a launcher window and builds it with `document.write()` right from the bookmark — there is no separate file to load, so you never get a “File Not Found” or a plain-text page. It fetches the game catalog (`games.json`) from **esm.sh** and shows the list with a search box. Clicking a game opens it as a real page in its own tab on esm.sh, which serves the game HTML as actual `text/html` (with CORS enabled), so the game’s scripts run fully.

```javascript
javascript:(function(){try{var G="https://esm.sh/gh/onlyyzzz-cmyk/securly-games@main/",w=window.open("about:blank","_blank");if(!w){w=window.open();}if(!w){alert("Popup blocked — allow pop-ups for this site, then try the bookmark again.");return;}function esc(x){return String(x).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}function page(body,title){return'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>body{margin:0;min-height:100vh;background:#0b1220;color:#eef5ff;font:16px Arial;padding:24px;box-sizing:border-box}a{color:#69d2ff}li{margin:9px 0}input{margin:0 0 10px;padding:9px 12px;width:100%;max-width:340px;border:1px solid #69d2ff;border-radius:8px;background:#111d33;color:#fff;font-size:15px;box-sizing:border-box}.loading{display:grid;place-items:center;min-height:90vh;font-size:18px}.err{color:#ff6b6b}#exit{position:fixed;top:14px;right:14px;z-index:999999;padding:10px 14px;border:1px solid #69d2ff;border-radius:8px;background:#111d33;color:#fff;font-weight:bold;cursor:pointer}#full{position:fixed;top:14px;right:88px;z-index:999999;padding:10px 14px;border:1px solid #69d2ff;border-radius:8px;background:#111d33;color:#fff;font-weight:bold;cursor:pointer}</style></head><body>'+body+'</body></html>'}function write(x){w.document.open();w.document.write(x);w.document.close();var e=w.document.getElementById("exit"),f=w.document.getElementById("full");if(e)e.onclick=function(){w.close()};if(f)f.onclick=function(){var d=w.document.documentElement;(d.requestFullscreen||d.webkitRequestFullscreen||d.msRequestFullscreen).call(d)}}function load(u){return fetch(u,{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("HTTP "+r.status+" for "+u);return r.json()})}function play(name,path){if(!w.open(G+path,"_blank"))write(page('<h1>Popup blocked</h1><p class="err">The game tab was blocked — allow pop-ups for this site, then click the game again.</p>',"Popup blocked"))}function launcher(x){var items=x.map(function(n){return{name:n,path:"games/"+encodeURIComponent(n)}});write(page('<button id="exit">Exit</button><button id="full">Fullscreen</button><input id="q" placeholder="Search games…"><h1>Securly Games</h1><h2 id="count">Games (0 of 0)</h2><ul id="list"></ul>',"Securly Games"));var inp=w.document.getElementById("q"),list=w.document.getElementById("list"),count=w.document.getElementById("count");function draw(q){q=(q||"").toLowerCase();var out=items.filter(function(it){return it.name.toLowerCase().indexOf(q)>-1});if(count)count.textContent="Games ("+out.length+" of "+items.length+")";if(list)list.innerHTML=out.map(function(it){return'<li><a href="'+G+it.path+'" data-file="'+it.path+'">'+esc(it.name.replace(/\.html$/i,""))+'</a></li>'}).join("");Array.prototype.forEach.call(w.document.querySelectorAll("[data-file]"),function(a){a.onclick=function(e){e.preventDefault();play(a.textContent,a.getAttribute("data-file"))}})}if(inp)inp.oninput=function(){draw(inp.value)};draw("")}write(page('<div class="loading">Loading…</div>',"Loading"));load(G+"games.json").then(function(x){if(!Array.isArray(x))throw Error("games.json was not a list");launcher(x)}).catch(function(e){write(page('<button id="exit">Exit</button><h1>Could not load games</h1><p class="err">'+esc(e&&e.message||e)+'</p><p>Tip: some sites block pop-ups or block requests to esm.sh — try running the bookmark from a different page.</p>',"Load failed"))})}catch(err){try{write(page('<h1>Bookmarklet error</h1><p class="err">'+esc(err&&err.message||err)+'</p>',"Error"));}catch(e2){alert("Bookmarklet error: "+(err&&err.message||err));}}})();
```

Notes:

- The launcher is written with `document.write()` straight from the bookmark — there is no file to load, so nothing can show as "File Not Found" or plain text.
- Clicking a game opens it in its own tab on **esm.sh**, which serves the repo’s HTML as real `text/html` (`application/json` for the catalog) with `Access-Control-Allow-Origin: *`, so the catalog fetch works from any page.
- `esm.sh` redirects `@main` to the pinned commit it is serving from, so what you see is exactly what’s committed — byte-for-byte identical.
- Games with their own `<base>` tag (like Google Baseball) keep it; games without one load their asset URLs (all absolute CDN links) directly, so no rewriting is needed.
- The search box filters the game list as you type; the counter shows matches out of the full catalog.

Troubleshooting:

- Nothing happens at all when you click it — the code got mangled while copying. Re-copy it from this page: it must be one single line in the bookmark’s URL field.
- You get a “Popup blocked” alert — allow pop-ups for the site you’re on and retry, or run the bookmark from a different page.
- The launcher opens but says “Could not load games” — the network is blocking `esm.sh`. Try a different page or network.
- A game tab opens but the game is blank — the game’s own CDN assets (hosted outside this repo) may be blocked by the network. Try a different page or network.