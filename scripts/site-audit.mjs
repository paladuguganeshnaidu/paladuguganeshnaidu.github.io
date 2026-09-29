import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const fail = [];
const warn = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const files = walk(root);
const rel = file => path.relative(root, file).replaceAll(path.sep, '/');
const allFiles = new Set(files.map(rel));
const htmlFiles = files.filter(file => file.endsWith('.html'));

for (const file of htmlFiles) {
  const name = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  if (!/<html[^>]+lang="/i.test(html)) fail.push(name + ': missing html[lang]');
  if (!/<meta[^>]+name="viewport"/i.test(html)) fail.push(name + ': missing viewport meta');
  if (!/<title>\s*[^<]+\s*<\/title>/i.test(html)) fail.push(name + ': missing title');
  if (!/<meta[^>]+name="description"/i.test(html)) fail.push(name + ': missing description');
  if (!/<link[^>]+rel="canonical"/i.test(html)) fail.push(name + ': missing canonical');
  if (name !== 'myworld.html' && (html.match(/<h1\b/gi) || []).length !== 1) fail.push(name + ': expected exactly one h1');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/gi)].map(match => match[1]).filter(value => value && !value.startsWith('#') && !value.startsWith('http://') && !value.startsWith('https://') && !value.startsWith('mailto:') && !value.startsWith('data:'));
  for (const ref of refs) {
    const clean = ref.split('#')[0].split('?')[0];
    if (!clean || clean.endsWith('/')) continue;
    const target = path.normalize(path.join(path.dirname(name), clean));
    if (!allFiles.has(target)) fail.push(name + ': broken local reference ' + ref);
  }
  if (/http:\/\//g.test(html)) fail.push(name + ': insecure http:// reference');
}

for (const file of files.filter(file => file.endsWith('.js'))) {
  const name = rel(file);
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); }
  catch { fail.push(name + ': JavaScript syntax check failed'); }
}

for (const file of files.filter(file => file.endsWith('.css'))) {
  const css = fs.readFileSync(file, 'utf8');
  const opens = (css.match(/\{/g) || []).length;
  const closes = (css.match(/\}/g) || []).length;
  if (opens !== closes) fail.push(rel(file) + ': CSS brace mismatch');
}

try { JSON.parse(fs.readFileSync(path.join(root, 'site.webmanifest'), 'utf8')); }
catch { fail.push('site.webmanifest: invalid JSON'); }
if (!allFiles.has('CNAME')) fail.push('CNAME: missing');
if (!allFiles.has('robots.txt')) fail.push('robots.txt: missing');
if (!allFiles.has('sitemap.xml')) fail.push('sitemap.xml: missing');

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const page of htmlFiles.map(rel).filter(file => file !== 'index.html')) {
  if (!sitemap.includes(page)) warn.push('sitemap.xml: ' + page + ' not explicitly listed');
}

const myWorld = fs.readFileSync(path.join(root, 'myworld.html'), 'utf8');
const myWorldBody = myWorld.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
if (myWorldBody.replace(/<[^>]+>/g, '').replace(/\s+/g, '').length !== 0) fail.push('myworld.html: rendered text detected');

if (fail.length) {
  console.error('\nProduction audit failed:\n');
  for (const item of fail) console.error('✖ ' + item);
  if (warn.length) {
    console.error('\nWarnings:\n');
    for (const item of warn) console.error('⚠ ' + item);
  }
  process.exit(1);
}

console.log('Production audit passed.');
for (const item of warn) console.log('⚠ ' + item);