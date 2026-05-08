import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const normalizedPath = path.join(root, 'data', 'ai-tools', 'normalized', 'tools.jsonl');
const reportPath = path.join(root, 'data', 'ai-tools', 'reports', 'crawl_report.md');

const tools = fs.existsSync(normalizedPath)
  ? fs.readFileSync(normalizedPath, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
  : [];
const sourceCounts = tools.reduce((acc, tool) => {
  acc[tool.source] = (acc[tool.source] || 0) + 1;
  return acc;
}, {});

const markdown = [
  '# Toolify Crawl And Import Report',
  '',
  `Generated at: ${new Date().toISOString()}`,
  '',
  `- Normalized tools available: ${tools.length}`,
  `- Allowed tools: ${tools.filter((tool) => tool.safety?.allowed !== false).length}`,
  `- Safety filtered tools: ${tools.filter((tool) => tool.safety?.allowed === false).length}`,
  `- Sources: ${JSON.stringify(sourceCounts)}`,
  '',
  '## Notes',
  '',
  '- Crawler is intentionally polite: low rate, no proxy, no CAPTCHA bypass, no login-wall bypass.',
  '- If Toolify blocks access, use imported JSONL fixtures or official/partner data instead of aggressive bypass.',
  '- Next.js runtime reads normalized JSONL; crawling is an offline data generation step.',
  '',
  '## Sample Tools',
  '',
  ...tools.slice(0, 15).map((tool) => `- ${tool.name} (${tool.primaryCategory}) - ${tool.shortDescription}`),
  ''
].join('\n');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, markdown, 'utf8');
console.log(`[inspect] tools=${tools.length} report=${reportPath}`);
