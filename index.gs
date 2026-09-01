/**
 * Securly Games — Google Apps Script web host.
 * Core pages are stored in this Apps Script project. Games and tools stay in
 * GitHub and are loaded through jsDelivr so Apps Script's file limit is not a
 * problem.
 */

var ALLOWED_PAGES = [
  'index', 'tools', 'credits', 'dashboard', 'bookmart', 'submit', 'tutorial', '404'
];
var REPORTS_SHEET_NAME = 'Reports';
var SPREADSHEET_KEY = 'SECURLY_GAMES_SPREADSHEET_ID';
var CDN_BASE = 'https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/';

function doGet(e) {
  var requested = e && e.parameter && String(e.parameter.p || 'index').trim();
  if (requested.indexOf('games/') === 0) {
    return serveFromCdn_('games', requested.substring(6), 'game');
  }
  if (requested.indexOf('tools/') === 0) {
    return serveFromCdn_('tools', requested.substring(6), 'tool');
  }
  var page = requested.toLowerCase();
  if (ALLOWED_PAGES.indexOf(page) === -1) page = 'index';
  return serveLocalPage_(page);
}

function decodePathPart_(value) {
  try { return decodeURIComponent(String(value || '').replace(/\+/g, ' ')); }
  catch (err) { return String(value || ''); }
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeScriptString_(value) {
  return JSON.stringify(String(value || ''))
    .replace(/<\/script/gi, '<\\/script');
}

function serveFromCdn_(folder, encodedName, label) {
  var name = decodePathPart_(encodedName).replace(/^\/+|\/+$/g, '');
  if (!name || name.indexOf('/') !== -1 || name.indexOf('..') !== -1) {
    return serveError_('invalid ' + label + ' name');
  }

  var url = CDN_BASE + folder + '/' + encodeURIComponent(name) + '.html';
  try {
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
    if (response.getResponseCode() !== 200) return serveError_(label + ' not found: ' + name);

    var source = response.getContentText('UTF-8');
    var headMatch = source.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    var bodyMatch = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    var head = headMatch ? headMatch[1] : '';
    var body = bodyMatch ? bodyMatch[1] : source;
    var reportButton =
      '<button id="sg-report-broken" type="button" style="position:fixed;right:12px;bottom:12px;z-index:2147483647;padding:10px 14px;border:1px solid #ff3b5c;border-radius:8px;background:#17111d;color:#fff;font:700 13px Arial,sans-serif;cursor:pointer;box-shadow:0 4px 18px #0008">⚠ Report broken</button>' +
      '<script>(function(){var b=document.getElementById("sg-report-broken");if(!b)return;b.addEventListener("click",function(){var note=window.prompt("What is broken?")||"no details";var game=' + escapeScriptString_(name) + ';if(window.google&&google.script&&google.script.run){google.script.run.withSuccessHandler(function(){b.textContent="✓ Report sent";setTimeout(function(){b.textContent="⚠ Report broken"},1800)}).withFailureHandler(function(){window.location.href="?p=submit"}).appReport(game,note)}else{window.location.href="?p=submit"}})})();<\\/script>';

    var html = '<!doctype html><html><head>' + head +
      '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + escapeHtml_(name) + ' — Securly Games</title></head><body>' +
      body + reportButton + '</body></html>';

    return HtmlService.createHtmlOutput(html)
      .setTitle(name + ' — Securly Games')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return serveError_('could not load ' + label);
  }
}

function serveLocalPage_(page) {
  try {
    return HtmlService.createHtmlOutputFromFile(page)
      .setTitle('Securly Games')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return serveError_('page not found: ' + page);
  }
}

function serveError_(message) {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body style="font-family:sans-serif;padding:40px;text-align:center">' +
    '<h2>Unable to load</h2><p>' + escapeHtml_(message) + '</p>' +
    '<a href="?p=index">← Back home</a></body></html>'
  ).setTitle('Error — Securly Games');
}

function getGames() {
  return JSON.parse('[]');
}

function getTools() {
  return JSON.parse('[]');
}

function getStore_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(SPREADSHEET_KEY);
  var ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (err) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create('Securly Games Reports');
    props.setProperty(SPREADSHEET_KEY, ss.getId());
  }
  var sheet = ss.getSheetByName(REPORTS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(REPORTS_SHEET_NAME);
  return sheet;
}

function loadReports_() {
  var values = getStore_().getDataRange().getValues();
  var reports = [];
  for (var i = 1; i < values.length; i++) {
    if (!values[i][0]) continue;
    reports.push({ id: String(values[i][0]), game: String(values[i][1] || ''), note: String(values[i][2] || ''), date: String(values[i][3] || ''), status: String(values[i][4] || 'open') });
  }
  return reports;
}

function saveReports_(reports) {
  var rows = [['id', 'game', 'note', 'date', 'status']];
  reports.forEach(function (report) { rows.push([report.id, report.game, report.note, report.date, report.status]); });
  var sheet = getStore_();
  sheet.clear();
  sheet.getRange(1, 1, rows.length, 5).setValues(rows);
}

function appReport(game, note) {
  game = String(game || '').trim();
  if (!game) throw new Error('missing game');
  var report = { id: Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36), game: game, note: String(note || '').trim() || 'no details', date: new Date().toISOString(), status: 'open' };
  var reports = loadReports_();
  reports.unshift(report);
  saveReports_(reports);
  return report;
}

function appResolve(id) {
  var reports = loadReports_();
  var found = null;
  for (var i = 0; i < reports.length; i++) if (reports[i].id === String(id || '')) { found = reports[i]; break; }
  if (!found) throw new Error('not found');
  found.status = found.status === 'open' ? 'resolved' : 'open';
  saveReports_(reports);
  return found;
}

function appGetReports() {
  var reports = loadReports_();
  reports.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  return reports;
}
