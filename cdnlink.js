#!/usr/bin/env node
// Generate jsDelivr cloak links for the Pizza Arcade site.
// Usage:
//   node cdnlink.js                  -> default (CDN copy of index.html)
//   node cdnlink.js tools            -> a known page (index/tools/credits/dashboard/tutorial/bookmart/submit/404)
//   node cdnlink.js all              -> cloak links for every core page
//   node cdnlink.js "https://..."    -> any URL, base64-encoded
//   node cdnlink.js games/foo.html   -> any file in the repo, via CDN

const SITE = 'https://school-work.wasmer.app';
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/onlyyzzz-cmyk/securly-games@main/';
const PAGES = {
  index: 'index.html',
  tools: 'tools.html',
  credits: 'credits.html',
  dashboard: 'dashboard.html',
  tutorial: 'tutorial.html',
  bookmart: 'bookmart.html',
  submit: 'submit.html',
  '404': '404.html',
};

function build(page, target) {
  const b64 = Buffer.from(target).toString('base64');
  console.log('[' + page + ']');
  console.log('  target : ' + target);
  console.log('  base64 : ' + b64);
  console.log('  cloak  : ' + SITE + '/go?c=' + b64);
  console.log('  direct : ' + SITE + '/go?d=' + b64);
  console.log('');
}

const arg = (process.argv[2] || 'index').trim();

if (arg === 'all') {
  for (const key of Object.keys(PAGES)) build(key, CDN_BASE + PAGES[key]);
} else if (/^https?:\/\//i.test(arg)) {
  build('custom', arg);
} else if (PAGES[arg]) {
  build(arg, CDN_BASE + PAGES[arg]);
} else {
  build('custom', CDN_BASE + arg.replace(/^\/+/, ''));
}
