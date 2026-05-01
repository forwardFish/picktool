export const SITE_NAME = 'AI Tool Decision Assistant';
export const SITE_TITLE =
  'AI Tool Decision Assistant | Make better AI tool decisions for every task';
export const SITE_DESCRIPTION =
  'Describe a task and get a focused AI tool setup, usage path, skip list, alternatives, and cost advice.';

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?.trim()
  .replace(/\/+$/, '');

export const SITE_URL = configuredSiteUrl || 'https://picktool.local';

export const PUBLIC_ROUTES = ['/', '/results'] as const;

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
