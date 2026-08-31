#!/usr/bin/env node
/**
 * Builds the Google Apps Script output into gas/.
 *
 * Apps Script projects are flat and cannot serve static assets, so this
 * generator inlines CSS, embeds game/tool lists, and removes the startup
 * splash from the Apps Script build. HtmlService's mobile sandbox can leave
 * animation overlays stuck, so the app starts directly.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'gas');

if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });

const read = (p) => readFileSync(join(root, p), 'utf8');
const css = read('index.css');
const cssTag = '<style>\n' + css + '\n</style>';

function removeStartup(html) {
  // Remove the visible startup markup.
  html = html.replace(/<!-- Startup -->[\s\S]*?<\/div>\s*\n\s*<!-- Onboarding -->/i, '<!-- Startup disabled for Apps Script -->\n\n<!-- Onboarding -->');
  html = html.replace(/<div id="startup">[\s\S]*?<\/div>\s*\n\s*<!-- Onboarding -->/i, '<!-- Startup disabled for Apps Script -->\n\n<!-- Onboarding -->');

  // Remove startup-related style blocks/rules from the inlined CSS. The exact
  // selectors are scoped so other page styles remain unchanged.
  html = html.replace(/#startup\s*\{[^}]*\}\s*#startup\.fade-out\s*\{[^}]*\}\s*#startup::before\s*\{[^}]*\}\s*#startup h1\s*\{[^}]*\}\s*#startup-sub\s*\{[^}]*\}\s*#startupfill\s*\{[^}]*\}\s*\.startup-bar-container\s*\{[^}]*\}\s*\.startup-bar-track\s*\{[^}]*\}\s*\.startup-status\s*\{[^}]*\}/g, '');

  // Make the boot path direct and remove references to the startup element.
  const start = html.indexOf('function startWebsite(){');
  const boot = html.indexOf('function bootApp(){');
  if (start !== -1 && boot !== -1) {
    html = html.slice(0, start) + html.slice(boot);
  }
  html = html.replace(/function bootApp\(\)\{[\s\S]*?\n\}\nif\(document\.readyState===['"]loading['"]\)[\s\S]*?\n\}\n/,
    "function bootApp(){ initializeApp(); }\nbootApp();\n");
  html = html.replace(/\/\* fail-safe: never leave the startup screen up \*\/[\s\S]*?\n\s*\}, 5000\);/, '');
  html = html.replace(/\/\* fail-safe: never leave the startup screen up if something goes wrong \*\/[\s\S]*?\n\s*\}, 8000\);/, '');

  return html;
}

for (const page of ['index', 'tools', 'credits', 'dashboard']) {
  let html = read(page + '.html');
  html = html.replace(/<link rel="stylesheet" href="[^"]*index\.css">/i, cssTag);
  if (page === 'index') html = removeStartup(html);
  writeFileSync(join(out, page + '.html'), html);
}

for (const page of ['bookmart', 'submit', 'tutorial', '404']) {
  writeFileSync(join(out, page + '.html'), read(page + '.html'));
}

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
writeFileSync(join(out, 'Code.gs'), gs);
writeFileSync(join(out, 'appsscript.json'), read('appsscript.json'));

const ok = existsSync(join(out, 'Code.gs')) && existsSync(join(out, 'index.html')) && existsSync(join(out, 'appsscript.json'));
console.log(ok ? 'gas/ built ok' : 'gas/ build MISSING FILES');
if (!ok) process.exit(1);
