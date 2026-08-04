#!/usr/bin/env node
/**
 * inject-gtm.mjs
 *
 * Installs the Google Tag Manager WEB container (GTM-W8HNHP9H) across every
 * production HTML page in this repository.
 *
 *  - Adds the GTM <script> immediately after the opening <head> tag.
 *  - Adds the GTM <noscript> iframe immediately after the opening <body> tag.
 *
 * The operation is idempotent: if a page already contains the container ID it
 * is left untouched, so each page ends up with exactly one head script and
 * exactly one noscript iframe.
 *
 * Usage:
 *   node scripts/inject-gtm.mjs          # apply changes
 *   node scripts/inject-gtm.mjs --dry    # report only, write nothing
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GTM_ID = 'GTM-W8HNHP9H';

// Scan from the repository root (the parent of this scripts/ directory) so the
// tool works no matter which directory it is invoked from.
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(SCRIPT_DIR, '..');

const IGNORE_DIRS = new Set(['.git', 'node_modules', 'dist', 'build']);

const DRY_RUN = process.argv.includes('--dry') || process.argv.includes('--dry-run');

// Base (2-space indented) snippets. Inner indentation matches the canonical GTM
// install so the blocks read naturally alongside sibling head/body children.
const HEAD_SNIPPET = [
  '  <!-- Google Tag Manager -->',
  '  <script>',
  '  (function(w,d,s,l,i){',
  "    w[l]=w[l]||[];",
  "    w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});",
  '    var f=d.getElementsByTagName(s)[0],',
  '        j=d.createElement(s),',
  "        dl=l!='dataLayer'?'&l='+l:'';",
  '    j.async=true;',
  "    j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;",
  '    f.parentNode.insertBefore(j,f);',
  "  })(window,document,'script','dataLayer','" + GTM_ID + "');",
  '  </script>',
  '  <!-- End Google Tag Manager -->',
].join('\n');

const BODY_SNIPPET = [
  '  <!-- Google Tag Manager (noscript) -->',
  '  <noscript>',
  '    <iframe',
  "      src=\"https://www.googletagmanager.com/ns.html?id=" + GTM_ID + "\"",
  '      height="0"',
  '      width="0"',
  '      style="display:none;visibility:hidden">',
  '    </iframe>',
  '  </noscript>',
  '  <!-- End Google Tag Manager (noscript) -->',
].join('\n');

// Match the opening <head>/<body> tag (with any attributes) but never <header>,
// <headerfoo> etc. — the required char after the tag name is whitespace or '>'.
const HEAD_RE = /<head(\s[^>]*)?>/i;
const BODY_RE = /<body(\s[^>]*)?>/i;

/** Recursively collect .html files, skipping ignored directories. */
function collectHtml(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (IGNORE_DIRS.has(entry)) continue;
      collectHtml(full, out);
    } else if (st.isFile() && entry.toLowerCase().endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Insert `snippet` immediately after the first tag matched by `re`, using the
 * file's own newline style. Returns the new string, or null if the tag is
 * absent.
 */
function insertAfter(content, re, snippet, nl) {
  const m = re.exec(content);
  if (!m) return null;
  const at = m.index + m[0].length;
  const block = snippet.split('\n').join(nl);
  return content.slice(0, at) + nl + block + content.slice(at);
}

function detectNewline(content) {
  return content.includes('\r\n') ? '\r\n' : '\n';
}

const results = { modified: [], already: [], failed: [] };

const files = collectHtml(ROOT).sort();

for (const file of files) {
  const rel = file.slice(ROOT.length + 1).split('\\').join('/');
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch (err) {
    results.failed.push({ rel, reason: 'read error: ' + err.message });
    continue;
  }

  // Idempotency: never insert a second snippet when the container is present.
  if (content.includes(GTM_ID)) {
    results.already.push(rel);
    continue;
  }

  const nl = detectNewline(content);

  const afterHead = insertAfter(content, HEAD_RE, HEAD_SNIPPET, nl);
  if (afterHead === null) {
    results.failed.push({ rel, reason: 'no <head> tag found' });
    continue;
  }

  const afterBody = insertAfter(afterHead, BODY_RE, BODY_SNIPPET, nl);
  if (afterBody === null) {
    results.failed.push({ rel, reason: 'no <body> tag found' });
    continue;
  }

  if (!DRY_RUN) {
    try {
      writeFileSync(file, afterBody, 'utf8');
    } catch (err) {
      results.failed.push({ rel, reason: 'write error: ' + err.message });
      continue;
    }
  }
  results.modified.push(rel);
}

// ---- Report ---------------------------------------------------------------
const line = '-'.repeat(60);
console.log(line);
console.log('Google Tag Manager injection (' + GTM_ID + ')' + (DRY_RUN ? '  [DRY RUN]' : ''));
console.log(line);
console.log('HTML files scanned : ' + files.length);
console.log('Modified           : ' + results.modified.length);
console.log('Already configured : ' + results.already.length);
console.log('Skipped / failed   : ' + results.failed.length);
console.log(line);

if (results.modified.length) {
  console.log('\nModified files:');
  for (const r of results.modified) console.log('  + ' + r);
}
if (results.already.length) {
  console.log('\nAlready configured (unchanged):');
  for (const r of results.already) console.log('  = ' + r);
}
if (results.failed.length) {
  console.log('\nSkipped / could not process:');
  for (const r of results.failed) console.log('  ! ' + r.rel + '  (' + r.reason + ')');
}
console.log('');
