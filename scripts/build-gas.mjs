#!/usr/bin/env node
/**
 * Builds the Google Apps Script output into gas/.
 *
 * Apps Script projects are flat and cannot serve static assets, so this
 * generator:
 *  - inlines index.css into the pages that link it (a separate .css file
 *    would collide with index.html — both map to the remote name "index")
 *  - embeds games.json / tools.json into index.gs as server functions
 *    (Apps Script can't serve fetch()-able .json files)
 *
 * The repo's real files are never modified; gas/ is generated and gitignored.
 * Run before every `clasp push` (also done automatically in CI).
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'gas');

if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });

const read = (p) => readFileSync(join(root, p), 'utf8');

// 1) CSS: inline into the pages that link index.css
const css = read('index.css');
const cssTag = '<style>\n' + css + '\n</style>';
for (const page of ['index', 'tools', 'credits', 'dashboard']) {
  let html = read(page + '.html');
  html = html.replace(/<link rel="stylesheet" href="[^"]*index\.css">/i, cssTag);
  writeFileSync(join(out, page + '.html'), html);
}

// 2) Other pages copied untouched
for (const page of ['bookmart', 'submit', 'tutorial', '404']) {
  writeFileSync(join(out, page + '.html'), read(page + '.html'));
}

// 3) Server code with games/tools lists embedded
let gs = read('index.gs');
const stub = `// Helper called from client pages via google.script.run to build URL links.
function getGames() {
  return [];
}`;
const replacement = `// Games/tools lists, embedded at build time (Apps Script can't serve
// static .json files). Called from pages via google.script.run.
function getGames() {
  return JSON.parse(${JSON.stringify(read('games.json').trim())});
}
function getTools() {
  return JSON.parse(${JSON.stringify(read('tools.json').trim())});
}`;
if (!gs.includes(stub)) {
  console.error('index.gs stub not found — cannot embed games/tools lists');
  process.exit(1);
}
gs = gs.replace(stub, replacement);
// The server file must not be named "index" — Apps Script rejects a .gs and
// .html file sharing the same base name (index.gs + index.html would both be
// "index"). Code.gs is the conventional name.
writeFileSync(join(out, 'Code.gs'), gs);

// 4) Manifest
writeFileSync(join(out, 'appsscript.json'), read('appsscript.json'));

const ok =
  existsSync(join(out, 'Code.gs')) &&
  existsSync(join(out, 'index.html')) &&
  existsSync(join(out, 'appsscript.json'));
console.log(ok ? 'gas/ built ok' : 'gas/ build MISSING FILES');
if (!ok) process.exit(1);
