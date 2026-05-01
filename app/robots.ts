import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pricing',
          '/faq',
          '/help',
          '/contact',
          '/legal/',
          '/data-deletion'
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/share/',
          '/sample-report',
          '/sign-in',
          '/sign-up',
          '/webhook/'
        ]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
