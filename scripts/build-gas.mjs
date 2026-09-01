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
  html = html.replace(/<!-- Startup -->[\s\S]*?<\/div>\s*\n\s*<!-- Onboarding -->/i, '<!-- Startup disabled -->\n\n<!-- Onboarding -->');
  html = html.replace(/<div id="startup">[\s\S]*?<\/div>\s*\n\s*<!-- Onboarding -->/i, '<!-- Startup disabled -->\n\n<!-- Onboarding -->');
  return html;
}

for (const page of ['index', 'tools', 'credits', 'dashboard', 'bookmart', 'submit', 'tutorial', '404']) {
  let html = read(page + '.html');
  if (/<link rel="stylesheet" href="[^"]*index\.css">/i.test(html)) html = html.replace(/<link rel="stylesheet" href="[^"]*index\.css">/i, cssTag);
  if (page === 'index') html = removeStartup(html);
  writeFileSync(join(out, page + '.html'), html);
}

// Keep the Apps Script files only as an optional legacy export; static hosting never loads them.
writeFileSync(join(out, 'Code.gs'), read('index.gs'));
writeFileSync(join(out, 'appsscript.json'), read('appsscript.json'));
console.log('gas/ built ok');
