import type { AiTool } from './types.ts';

const blockedKeywordGroups: Record<string, string[]> = {
  adult: ['nsfw', 'adult', 'porn', 'erotic', 'nude', 'nudify', 'undress', 'onlyfans', 'sexy', 'bikini'],
  bypass: ['anti-detection', 'anti detection', 'bypass', 'captcha solver', 'stealth', 'undetectable'],
  gambling: ['gambling', 'casino', 'betting', 'sports betting', 'bookmaker'],
  weapons: ['weapon', 'gun', 'firearm', 'ammo', 'knife'],
  drugs: ['drug', 'cannabis', 'marijuana', 'thc', 'cbd', 'vape', 'nicotine', 'alcohol'],
  relationship: ['ai girlfriend', 'ai boyfriend', 'dating assistant', 'pickup lines', 'pick-up lines', 'rizz', 'waifu']
};

export function inspectSafetyText(parts: string[]): { allowed: boolean; riskTags: string[]; blockedReason?: string } {
  const text = parts.filter(Boolean).join(' ').toLowerCase();
  const riskTags: string[] = [];

  for (const [tag, keywords] of Object.entries(blockedKeywordGroups)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      riskTags.push(tag);
    }
  }

  if (riskTags.length > 0) {
    return {
      allowed: false,
      riskTags,
      blockedReason: `Blocked by safety filter: ${riskTags.join(', ')}`
    };
  }

  return { allowed: true, riskTags: [] };
}

export function applySafety(tool: Omit<AiTool, 'safety'>): AiTool {
  const safety = inspectSafetyText([
    tool.name,
    tool.shortDescription,
    tool.primaryCategory,
    ...tool.categories,
    ...tool.tags,
    ...tool.bestFor,
    ...tool.useWhen
  ]);
  return { ...tool, safety };
}

export function isAllowedTool(tool: AiTool) {
  return tool.safety.allowed;
}
