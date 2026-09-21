/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⛔ The blog routes and the sitemap are ISR now (the webmaster's posts come
  // from Supabase), so they REGENERATE at runtime in a serverless function, and
  // lib/blog.ts reads content/blog/*.mdx with fs. Measured on this site: a
  // runtime render that reads those files without them traced into the bundle
  // gets ENOENT (the sitemap served zero blog posts for weeks that way). These
  // entries put the MDX into each route's trace.
  outputFileTracingIncludes: {
    '/blog': ['./content/blog/**/*'],
    '/blog/[slug]': ['./content/blog/**/*'],
    '/sitemap.xml': ['./content/blog/**/*'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // ⛔ WHY A HEADER AND NOT <html lang="es">. app/layout.tsx is the single root
  // layout and hardcodes lang="en"; the correct fix is two root layouts (a
  // route-group refactor touching every route). Google ignores both `lang` and
  // Content-Language and detects language from the text, so it loses nothing
  // today. Bing does read Content-Language as a language signal, and a header is
  // server-side, so this gives the Spanish tree a correct declaration to the
  // crawler that reads one without moving a single route.
  async headers() {
    const es = [{ key: 'Content-Language', value: 'es' }];
    return [
      { source: '/es', headers: es },
      { source: '/es/:path*', headers: es },
    ];
  },
};

module.exports = nextConfig;
