export const SITE_NAME = 'AI Task Workflow Copilot';
export const SITE_TITLE = 'AI Task Workflow Copilot | Get a simple AI workflow for your task';
export const SITE_DESCRIPTION =
  'Tell us what you want to finish. Get a good-enough AI workflow first, then upgrade only when needed.';

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?.trim()
  .replace(/\/+$/, '');

export const SITE_URL = configuredSiteUrl || 'https://picktool.local';

export const PUBLIC_ROUTES = ['/', '/copilot', '/archive', '/results'] as const;

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
