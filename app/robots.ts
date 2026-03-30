import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/dashboard', '/provider'],
    },
    sitemap: 'https://clearcrossprogreso.com/sitemap.xml',
  };
}
