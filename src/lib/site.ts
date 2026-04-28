// Single source of truth for canonical URLs across SEO, sitemap, and OG tags.
// Override at runtime/build by setting VITE_SITE_URL.
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "https://resumely.app")
).replace(/\/$/, "");

export const SITE_NAME = "Resumely";
export const TWITTER_HANDLE = "@resumely";

export const canonical = (path: string) => {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
};

// Public routes that should be indexed (also used by the sitemap generator).
export const PUBLIC_ROUTES: { path: string; changefreq: string; priority: number }[] = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/pricing", changefreq: "monthly", priority: 0.9 },
  { path: "/ats-resume", changefreq: "monthly", priority: 0.9 },
  { path: "/resume-builder", changefreq: "monthly", priority: 0.9 },
  { path: "/cover-letter-generator", changefreq: "monthly", priority: 0.9 },
];