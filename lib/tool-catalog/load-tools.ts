import fs from 'node:fs';
import path from 'node:path';
import { getManualCatalogTools } from './manual-tools.ts';
import type { AiTool } from './types.ts';

const catalogPath = path.join(process.cwd(), 'data', 'ai-tools', 'normalized', 'tools.jsonl');

export type CatalogLoadResult = {
  tools: AiTool[];
  source: 'local' | 'fallback' | 'mixed';
  localCount: number;
  fallbackCount: number;
  safetyFilteredCount: number;
  path: string;
};

function readJsonl(filePath: string): AiTool[] {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AiTool);
}

function mergeTools(localTools: AiTool[], manualTools: AiTool[]) {
  const bySlug = new Map<string, AiTool>();
  for (const tool of localTools) bySlug.set(tool.slug, tool);
  for (const tool of manualTools) {
    if (!bySlug.has(tool.slug)) bySlug.set(tool.slug, tool);
  }
  return [...bySlug.values()];
}

export function loadAiTools(): CatalogLoadResult {
  const localTools = readJsonl(catalogPath);
  const manualTools = getManualCatalogTools();
  const tools = mergeTools(localTools, manualTools);
  const safetyFilteredCount = tools.filter((tool) => !tool.safety.allowed).length;
  return {
    tools,
    source: localTools.length > 0 ? 'mixed' : 'fallback',
    localCount: localTools.length,
    fallbackCount: manualTools.length,
    safetyFilteredCount,
    path: catalogPath
  };
}

export function getAiToolBySlug(slug: string) {
  return loadAiTools().tools.find((tool) => tool.slug === slug);
}

export function getCatalogSummary() {
  const loaded = loadAiTools();
  const allowed = loaded.tools.filter((tool) => tool.safety.allowed);
  const categoryCounts = new Map<string, number>();
  const missing = {
    websiteUrl: 0,
    shortDescription: 0,
    categories: 0,
    taskIntents: 0
  };

  for (const tool of loaded.tools) {
    for (const category of tool.categories.length ? tool.categories : [tool.primaryCategory]) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
    if (!tool.websiteUrl) missing.websiteUrl += 1;
    if (!tool.shortDescription) missing.shortDescription += 1;
    if (!tool.categories.length) missing.categories += 1;
    if (!tool.taskIntents.length) missing.taskIntents += 1;
  }

  return {
    ...loaded,
    allowedTools: allowed,
    categoryCount: categoryCounts.size,
    topCategories: [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12),
    missing
  };
}
