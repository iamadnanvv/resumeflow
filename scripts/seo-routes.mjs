// Single source of truth for SEO routes used by the Vite plugin.
// Mirrors src/lib/site.ts PUBLIC_ROUTES (kept in sync manually — both are tiny).
export const PUBLIC_ROUTES = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/pricing", changefreq: "monthly", priority: 0.9 },
  { path: "/ats-resume", changefreq: "monthly", priority: 0.9 },
  { path: "/resume-builder", changefreq: "monthly", priority: 0.9 },
  { path: "/cover-letter-generator", changefreq: "monthly", priority: 0.9 },
];

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "PerplexityBot",
  "Google-Extended",
  "ClaudeBot",
  "anthropic-ai",
  "Applebot-Extended",
  "CCBot",
  "cohere-ai",
  "Bytespider",
];

export function buildSitemap(siteUrl) {
  const now = new Date().toISOString().slice(0, 10);
  const urls = PUBLIC_ROUTES.map(
    (r) => `  <url>
    <loc>${siteUrl}${r.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function buildRobots(siteUrl) {
  const aiSection = AI_BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n");
  return `# robots.txt for ${siteUrl}
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /billing
Disallow: /builder/
Disallow: /cover-letter/

# AI assistants & answer engines
${aiSection}

Sitemap: ${siteUrl}/sitemap.xml
`;
}