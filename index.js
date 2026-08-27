const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 9482;
const ROOT = __dirname;
const REPORTS_FILE = path.join(ROOT, 'reports.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

// Scan a folder and return the sorted list of .html filenames.
function listHtmlFiles(dir) {
  try {
    return fs
      .readdirSync(path.join(ROOT, dir))
      .filter((f) => f.endsWith('.html'))
      .sort();
  } catch (err) {
    console.warn(`Could not read ${dir}/:`, err.message);
    return [];
  }
}

// Regenerate games.json / tools.json from the folders on disk.
function regenerateLists() {
  const games = listHtmlFiles('games');
  const tools = listHtmlFiles('tools');
  fs.writeFileSync(
    path.join(ROOT, 'games.json'),
    JSON.stringify(games, null, 2) + '\n'
  );
  fs.writeFileSync(
    path.join(ROOT, 'tools.json'),
    JSON.stringify(tools, null, 2) + '\n'
  );
  console.log(`Auto-loaded ${games.length} games and ${tools.length} tools`);
}

regenerateLists();

function loadReports() {
  try {
    const data = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

function saveReports(list) {
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(list, null, 2) + '\n');
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) request.destroy();
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': MIME['.json'] });
  response.end(JSON.stringify(payload));
}

// Cloak-link helper: accept a raw http(s) URL or a base64-encoded one.
function decodeLinkParam(value) {
  if (!value) return '';
  const s = String(value).trim();
  if (/^https?:\/\//i.test(s)) return s;
  try {
    const decoded = Buffer.from(s, 'base64').toString('utf8').trim();
    if (/^https?:\/\//i.test(decoded)) return decoded;
  } catch (err) {
    /* not valid base64 */
  }
  return '';
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  // Broken-game report endpoints (stored in reports.json).
  if (request.method === 'POST' && pathname === '/api/report') {
    readJsonBody(request)
      .then((data) => {
        const game = String(data.game || '').trim();
        const note = String(data.note || '').trim();
        if (!game) {
          sendJson(response, 400, { ok: false, error: 'missing game' });
          return;
        }
        const reports = loadReports();
        const report = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
          game: game,
          note: note || 'no details',
          date: new Date().toISOString(),
          status: 'open',
        };
        reports.unshift(report);
        saveReports(reports);
        sendJson(response, 200, { ok: true, report: report });
      })
      .catch(() => sendJson(response, 400, { ok: false, error: 'bad json' }));
    return;
  }

  if (request.method === 'GET' && pathname === '/api/reports') {
    sendJson(response, 200, loadReports());
    return;
  }

  if (request.method === 'POST' && pathname === '/api/resolve') {
    readJsonBody(request)
      .then((data) => {
        const id = String(data.id || '');
        const reports = loadReports();
        const report = reports.find((r) => r.id === id);
        if (!report) {
          sendJson(response, 404, { ok: false, error: 'not found' });
          return;
        }
        report.status = report.status === 'open' ? 'resolved' : 'open';
        saveReports(reports);
        sendJson(response, 200, { ok: true, report: report });
      })
      .catch(() => sendJson(response, 400, { ok: false, error: 'bad json' }));
    return;
  }

  // CDN page loader — renders jsDelivr-hosted copies of the core pages.
  // jsDelivr serves .html as text/plain + nosniff for security, so direct
  // CDN links show raw code. Instead we fetch the CDN copy as text and
  // inject it (layer-4 style, like the pizza.com trick) — the page renders
  // on our domain, so relative links, CSS, games.json and the APIs all work.
  //   /cdn?p=index|tools|credits|dashboard|tutorial|bookmart|submit|404
  if (pathname === '/cdn') {
    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/';
    const CDN_PAGES = {
      index: 'index.html',
      tools: 'tools.html',
      credits: 'credits.html',
      dashboard: 'dashboard.html',
      tutorial: 'tutorial.html',
      bookmart: 'bookmart.html',
      submit: 'submit.html',
      '404': '404.html',
    };
    const page = CDN_PAGES[String(url.searchParams.get('p') || 'index')] || 'index.html';
    const cdnUrl = CDN_BASE + page;
    const jsSafe = JSON.stringify(cdnUrl).replace(/<\//g, '<\\/');
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(
      '<!doctype html><html><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<meta name="robots" content="noindex"><title>pizza arcade</title></head>' +
      '<body style="margin:0;background:#0f172a"><script>' +
      'var u=' + jsSafe + ';' +
      'fetch(u).then(function(r){return r.text();}).then(function(t){document.open();document.write(t);document.close();})' +
      ".catch(function(){location.replace('/" + page + "');});" +
      '</script></body></html>'
    );
    return;
  }

  // Cloak link endpoints (the pizza.com trick, but on our own server).
  //   /go?d=<url-or-base64>  -> 302 redirect to the target
  //   /go?c=<url-or-base64>  -> serve a cloak page that loads the target's
  //                             content (e.g. a jsDelivr/GitHub data.html)
  if (pathname === '/go') {
    const target = decodeLinkParam(url.searchParams.get('c') || url.searchParams.get('d'));
    if (!target) {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('bad link');
      return;
    }
    if (url.searchParams.get('c')) {
      const jsSafe = JSON.stringify(target).replace(/<\//g, '<\\/');
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(
        '<!doctype html><html><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<meta name="robots" content="noindex"><title>loading...</title></head>' +
        '<body style="margin:0;background:#0f172a"><script>' +
        'var u=' + jsSafe + ';' +
        "fetch(u).then(function(r){return r.text();}).then(function(t){document.open();document.write(t);document.close();})" +
        '.catch(function(){location.replace(u);});' +
        '</script></body></html>'
      );
      return;
    }
    response.writeHead(302, { Location: target });
    response.end();
    return;
  }

  // Serve the live list so new files are always picked up.
  if (pathname === '/games.json') {
    response.writeHead(200, { 'Content-Type': MIME['.json'] });
    response.end(JSON.stringify(listHtmlFiles('games'), null, 2));
    return;
  }
  if (pathname === '/tools.json') {
    response.writeHead(200, { 'Content-Type': MIME['.json'] });
    response.end(JSON.stringify(listHtmlFiles('tools'), null, 2));
    return;
  }

  // Resolve the requested path inside the repo root.
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(ROOT, pathname);
  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      response.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Length': stats.size,
      });
      fs.createReadStream(filePath).pipe(response);
      return;
    }
    // Unknown route -> custom 404 page.
    response.writeHead(404, { 'Content-Type': MIME['.html'] });
    fs.createReadStream(path.join(ROOT, '404.html')).pipe(response);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Preview server running at http://localhost:${PORT}`);
});
