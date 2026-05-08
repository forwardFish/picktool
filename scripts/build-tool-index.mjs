import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const normalizedPath = path.join(root, 'data', 'ai-tools', 'normalized', 'tools.jsonl');
const reportPath = path.join(root, 'data', 'ai-tools', 'reports', 'quality_report.md');

const tools = fs.existsSync(normalizedPath)
  ? fs.readFileSync(normalizedPath, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
  : [];

const categoryCounts = new Map();
const missing = { websiteUrl: 0, shortDescription: 0, categories: 0, taskIntents: 0 };
for (const tool of tools) {
  for (const category of tool.categories?.length ? tool.categories : [tool.primaryCategory || 'Uncategorized']) {
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  }
  if (!tool.websiteUrl) missing.websiteUrl += 1;
  if (!tool.shortDescription) missing.shortDescription += 1;
  if (!tool.categories?.length) missing.categories += 1;
  if (!tool.taskIntents?.length) missing.taskIntents += 1;
}

const allowed = tools.filter((tool) => tool.safety?.allowed !== false);
const topCategories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
const markdown = [
  '# Tool Catalog Quality Report',
  '',
  `Generated at: ${new Date().toISOString()}`,
  '',
  `- Total normalized tools: ${tools.length}`,
  `- Allowed tools: ${allowed.length}`,
  `- Safety filtered tools: ${tools.length - allowed.length}`,
  `- Category count: ${categoryCounts.size}`,
  '',
  '## Missing Fields',
  '',
  `- websiteUrl: ${missing.websiteUrl}`,
  `- shortDescription: ${missing.shortDescription}`,
  `- categories: ${missing.categories}`,
  `- taskIntents: ${missing.taskIntents}`,
  '',
  '## Top Categories',
  '',
  ...topCategories.map(([category, count]) => `- ${category}: ${count}`),
  ''
].join('\n');

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, markdown, 'utf8');
console.log(`[index] tools=${tools.length} report=${reportPath}`);
