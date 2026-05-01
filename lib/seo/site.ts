export const SITE_NAME = 'Pathnook';
export const SITE_TITLE = 'Pathnook | AI Learning and Growth System for Families';
export const SITE_DESCRIPTION =
  'Pathnook helps families turn recent learning evidence into diagnosis, evidence, and a 7-day action plan.';

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?.trim()
  .replace(/\/+$/, '');

export const SITE_URL = configuredSiteUrl || 'https://pathnook.com';

export const NOINDEX_ROBOTS = {
  index: false,
  follow: false
} as const;

export const PUBLIC_ROUTES = [
  '/',
  '/pricing',
  '/faq',
  '/help',
  '/contact',
  '/legal/privacy',
  '/legal/terms',
  '/legal/refunds',
  '/data-deletion'
] as const;

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
