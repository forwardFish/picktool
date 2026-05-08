import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const crawlerDir = path.join(root, 'toolify_ai_source_crawler');
const python = process.env.PYTHON || 'python';
const db = path.join(crawlerDir, 'data', 'toolify.sqlite');
const reportDir = path.join(root, 'data', 'ai-tools', 'reports');
const blockerReport = path.join(reportDir, 'crawl_blocker_report.md');
const defaultCategorySlugs = [
  'ai-video-editor',
  'ai-caption-generator',
  'ai-subtitle-generator',
  'ai-short-video-generator',
  'ai-ppt-maker',
  'ai-presentation-generator',
  'ai-pdf-summarizer',
  'ai-landing-page-builder',
  'ai-website-builder',
  'ai-report-generator',
  'ai-script-writing'
].join(',');

function run(args, options = {}) {
  console.log(`[crawl] ${python} ${args.join(' ')}`);
  return spawnSync(python, args, {
    cwd: crawlerDir,
    stdio: 'inherit',
    encoding: 'utf8',
    ...options
  });
}

fs.mkdirSync(reportDir, { recursive: true });

let result = run(['crawler.py', '--smoke-test', '--db', db, '--export']);
if (result.status !== 0) process.exit(result.status ?? 1);

const crawlMode = (process.env.TOOLIFY_CRAWL_MODE || 'auto').toLowerCase();
const requestArgs = [
  'crawler.py',
  '--source', 'category',
  '--db', db,
  '--max-categories', process.env.TOOLIFY_MAX_CATEGORIES || '30',
  '--max-tools-per-category', process.env.TOOLIFY_MAX_TOOLS_PER_CATEGORY || '50',
  '--category-pages', process.env.TOOLIFY_CATEGORY_PAGES || '2',
  '--delay', process.env.TOOLIFY_DELAY || '2',
  '--export'
];
const browserArgs = [
  'browser_crawler.py',
  '--db', db,
  '--category-slugs', process.env.TOOLIFY_CATEGORY_SLUGS || defaultCategorySlugs,
  '--max-tools-per-category', process.env.TOOLIFY_MAX_TOOLS_PER_CATEGORY || '20',
  '--category-pages', process.env.TOOLIFY_CATEGORY_PAGES || '1',
  '--delay', process.env.TOOLIFY_DELAY || '2',
  '--export'
];

result = crawlMode === 'browser' ? run(browserArgs) : run(requestArgs);

if (result.status !== 0 && crawlMode === 'auto') {
  fs.writeFileSync(blockerReport, [
    '# Toolify Crawl Blocker Report',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    'The requests-based crawler did not finish successfully, so the crawl runner switched to browser-mode fallback.',
    'Browser mode opens public pages only. It must stop if CAPTCHA, login walls, Cloudflare challenges, Access Denied, or other access controls appear.',
    `Target category slugs: ${process.env.TOOLIFY_CATEGORY_SLUGS || defaultCategorySlugs}`,
    ''
  ].join('\n'), 'utf8');
  console.error(`[crawl] request crawler failed. Switching to browser fallback. See ${blockerReport}`);
  result = run(browserArgs);
}

if (result.status !== 0) {
  fs.writeFileSync(blockerReport, [
    '# Toolify Crawl Blocker Report',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    'Toolify crawling did not finish successfully.',
    'Do not bypass CAPTCHA, login walls, Cloudflare challenges, or access controls.',
    'Use official/partner data, manual imports, or curated fixtures if public browser-mode crawling is blocked.',
    ''
  ].join('\n'), 'utf8');
  process.exit(result.status ?? 1);
}

run(['generate_report.py', '--db', db, '--out', path.join(crawlerDir, 'data', 'report.html')]);
console.log('[crawl] completed');
