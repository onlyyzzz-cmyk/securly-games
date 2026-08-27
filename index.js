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
