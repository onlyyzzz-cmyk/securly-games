/**
 * Securly Games — Google Apps Script web host
 * -----------------------------------------
 * Deploy as a Web App (Execute as: Me, Access: Anyone) and every page is
 * served as HTML through this single doGet. The static files stay in the
 * repo; each is added to the Apps Script project as an .html file.
 *
 * URL routing (query param `p`):
 *   ?p=            -> serves index.html       (default)
 *   ?p=tools       -> tools.html
 *   ?p=credits     -> credits.html
 *   ?p=dashboard   -> dashboard.html
 *   ?p=bookmart    -> bookmart.html
 *   ?p=submit      -> submit.html
 *   ?p=tutorial    -> tutorial.html
 *   ?p=404         -> 404.html
 *   ?p=games/NAME  -> games/NAME.html          (any game in /games)
 *
 * Broken-game reports are stored in a Google Sheet (created automatically on
 * first use). The report button and dashboard call the server functions
 * below via google.script.run — no extra backend needed.
 *
 *   appReport(game, note)      -> creates an 'open' report, returns it
 *   appResolve(id)             -> toggles a report open <-> resolved
 *   appGetReports()            -> returns all reports (for the dashboard)
 */

var ALLOWED_PAGES = [
  'index',
  'tools',
  'credits',
  'dashboard',
  'bookmart',
  'submit',
  'tutorial',
  '404',
];

var REPORTS_SHEET_NAME = 'Reports';
var SPREADSHEET_KEY = 'SECURLY_GAMES_SPREADSHEET_ID';

/* ───────────────────────────── doGet: page serving ───────────────────── */

function doGet(e) {
  var requested = e && e.parameter && String(e.parameter.p || 'index').trim();
  var fileName;
  var label;

  if (requested && requested.indexOf('games/') === 0) {
    fileName = requested; // "games/NAME"
    label = requested;
  } else {
    var base = (requested || 'index').toLowerCase();
    if (ALLOWED_PAGES.indexOf(base) === -1) base = 'index';
    fileName = base;
    label = base + '.html';
  }

  return servePage(fileName, label);
}

function servePage(fileName, label) {
  try {
    return HtmlService.createHtmlOutputFromFile(fileName)
      .setTitle('Securly Games')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    var fallback = HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Securly Games')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    fallback.append(
      '<div style="font-family:sans-serif;padding:20px;">page not found — ' +
        label +
        '</div>'
    );
    return fallback;
  }
}

// Helper called from client pages via google.script.run to build URL links.
function getGames() {
  return [];
}

/* ─────────────────────── Reports: Sheets storage ─────────────────────── */

function getStore_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(SPREADSHEET_KEY);
  var ss = null;
  if (id) {
    try {
      ss = SpreadsheetApp.openById(id);
    } catch (err) {
      ss = null;
    }
  }
  if (!ss) {
    ss = SpreadsheetApp.create('Securly Games Reports');
    props.setProperty(SPREADSHEET_KEY, ss.getId());
  }
  var sheet = ss.getSheetByName(REPORTS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(REPORTS_SHEET_NAME);
  return sheet;
}

function loadReports_() {
  var sheet = getStore_();
  var values = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[0]) continue;
    out.push({
      id: String(row[0]),
      game: String(row[1] || ''),
      note: String(row[2] || ''),
      date: String(row[3] || ''),
      status: String(row[4] || 'open'),
    });
  }
  return out;
}

function saveReports_(list) {
  var sheet = getStore_();
  sheet.clear();
  var rows = [['id', 'game', 'note', 'date', 'status']];
  list.forEach(function (r) {
    rows.push([r.id, r.game, r.note, r.date, r.status]);
  });
  sheet.getRange(1, 1, rows.length, 5).setValues(rows);
}

/* ─────────────── Server functions (google.script.run) ────────────────── */

// Create a new 'open' broken-game report. Returns the created report or
// throws if no game name was provided.
function appReport(game, note) {
  game = String(game || '').trim();
  if (!game) throw new Error('missing game');
  var report = {
    id: Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
    game: game,
    note: String(note || '').trim() || 'no details',
    date: new Date().toISOString(),
    status: 'open',
  };
  var reports = loadReports_();
  reports.unshift(report);
  saveReports_(reports);
  return report;
}

// Toggle a report between open and resolved. Returns the updated report.
function appResolve(id) {
  var reports = loadReports_();
  var found = null;
  for (var i = 0; i < reports.length; i++) {
    if (reports[i].id === String(id || '')) {
      found = reports[i];
      break;
    }
  }
  if (!found) throw new Error('not found');
  found.status = found.status === 'open' ? 'resolved' : 'open';
  saveReports_(reports);
  return found;
}

// Return all reports (newest first).
function appGetReports() {
  var reports = loadReports_();
  reports.sort(function (a, b) {
    return String(b.date).localeCompare(String(a.date));
  });
  return reports;
}