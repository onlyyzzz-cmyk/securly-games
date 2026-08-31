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

function doGet(e) {
  var requested = e && e.parameter && String(e.parameter.p || 'index').trim();
  var fileName;
  var label;

  if (requested && requested.indexOf('games/') === 0) {
    // Serve a game file: games/<name>.html
    fileName = requested; // "games/NAME"
    label = requested;
  } else {
    var base = (requested || 'index').toLowerCase();
    if (ALLOWED_PAGES.indexOf(base) === -1) base = 'index';
    fileName = base;
    label = base + '.html';
  }

  try {
    var html = HtmlService.createHtmlOutputFromFile(fileName)
      .setTitle('Securly Games')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    return html;
  } catch (err) {
    // Fall back to the index page if the requested file is missing.
    var fallback = HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Securly Games')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    fallback.append('<div style="font-family:sans-serif;padding:20px;">page not found — ' + label + '</div>');
    return fallback;
  }
}

// Allows `index.gs?p=games/a dance of fire and ice` style links to work and
// makes it easy to enumerate the games list for the homepage grid.
function getGames() {
  return [];
}