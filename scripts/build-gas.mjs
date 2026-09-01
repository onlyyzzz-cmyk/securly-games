#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'gas');
if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });
const read = (p) => readFileSync(join(root, p), 'utf8');

const cssTag = '<style>\n' + read('index.css') + '\n</style>';

function removeStartup(html) {
  html = html.replace(/<!-- Startup -->[\s\S]*?<\/div>\s*\n\s*<!-- Onboarding -->/i, '<!-- Startup disabled for Apps Script -->\n\n<!-- Onboarding -->');
  html = html.replace(/<div id="startup">[\s\S]*?<\/div>\s*\n\s*<!-- Onboarding -->/i, '<!-- Startup disabled for Apps Script -->\n\n<!-- Onboarding -->');
  const start = html.indexOf('function startWebsite(){');
  const boot = html.indexOf('function bootApp(){');
  if (start !== -1 && boot !== -1) html = html.slice(0, start) + html.slice(boot);
  html = html.replace(/function bootApp\(\)\{[\s\S]*?\n\}\nif\(document\.readyState===['"]loading['"]\)[\s\S]*?\n\}\n/, 'function bootApp(){ initializeApp(); }\nbootApp();\n');
  html = html.replace(/\/\* fail-safe:[\s\S]*?\n\s*\}, 5000\);/g, '');
  html = html.replace(/\/\* fail-safe:[\s\S]*?\n\s*\}, 8000\);/g, '');
  return html;
}

for (const page of ['index', 'tools', 'credits', 'dashboard']) {
  let html = read(page + '.html').replace(/<link rel="stylesheet" href="[^"]*index\.css">/i, cssTag);
  if (page === 'index') html = removeStartup(html);
  writeFileSync(join(out, page + '.html'), html);
}
for (const page of ['bookmart', 'submit', 'tutorial', '404']) {
  writeFileSync(join(out, page + '.html'), read(page + '.html'));
}

let gs = read('index.gs');
const games = read('games.json').trim();
const tools = read('tools.json').trim();
const listFunctions = `function getGames() {\n  return JSON.parse('[]');\n}\n\nfunction getTools() {\n  return JSON.parse('[]');\n}`;
const embeddedFunctions = `function getGames() {\n  return JSON.parse(${JSON.stringify(games)});\n}\n\nfunction getTools() {\n  return JSON.parse(${JSON.stringify(tools)});\n}`;
const placeholder = `// Helper called from client pages via google.script.run to build URL links.\nfunction getGames() {\n  return [];\n}`;
const currentFunctions = /function getGames\(\) \{[\\s\\S]*?\n\}\n\nfunction getTools\(\) \{[\\s\\S]*?\n\}/;
if (gs.includes(listFunctions)) gs = gs.replace(listFunctions, embeddedFunctions);
else if (gs.includes(placeholder)) gs = gs.replace(placeholder, embeddedFunctions);
else if (currentFunctions.test(gs)) gs = gs.replace(currentFunctions, embeddedFunctions);
else {
  console.error('getGames/getTools block not found');
  process.exit(1);
}
writeFileSync(join(out, 'Code.gs'), gs);
writeFileSync(join(out, 'appsscript.json'), read('appsscript.json'));

if (!existsSync(join(out, 'Code.gs')) || !existsSync(join(out, 'index.html'))) process.exit(1);
console.log('gas/ built ok');
