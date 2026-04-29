import { buildSitemap, buildRobots } from "./seo-routes.mjs";

/**
 * Vite plugin that:
 *  - Serves /sitemap.xml and /robots.txt dynamically in dev (always fresh)
 *  - Emits both files into the build output so static hosting picks them up
 * Site URL resolves to VITE_SITE_URL, falling back to https://resumelylite.app.
 */
export default function seoPlugin() {
  const siteUrl = (process.env.VITE_SITE_URL || "https://resumelylite.app").replace(/\/$/, "");

  return {
    name: "lovable-seo",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const url = req.url.split("?")[0];
        if (url === "/sitemap.xml") {
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.end(buildSitemap(siteUrl));
          return;
        }
        if (url === "/robots.txt") {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(buildRobots(siteUrl));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: buildSitemap(siteUrl),
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: buildRobots(siteUrl),
      });
    },
  };
}