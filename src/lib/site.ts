// Single source of truth for canonical URLs across SEO, sitemap, and OG tags.
// Override at runtime/build by setting VITE_SITE_URL.
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "https://resumelylite.netlify.app")
).replace(/\/$/, "");

// Canonical public-facing domain used for shareable resume links, regardless of
// where the app is currently hosted (preview, custom domain, etc.).
export const PUBLIC_SHARE_ORIGIN = "https://resumelylite.netlify.app";

export const SITE_NAME = "resumelylite";
export const TWITTER_HANDLE = "@resumelylite";

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
  { path: "/software-engineer-resume", changefreq: "monthly", priority: 0.8 },
  { path: "/product-manager-resume", changefreq: "monthly", priority: 0.8 },
  { path: "/data-scientist-resume", changefreq: "monthly", priority: 0.8 },
  { path: "/designer-resume", changefreq: "monthly", priority: 0.8 },
  { path: "/marketing-resume", changefreq: "monthly", priority: 0.8 },
  { path: "/sales-resume", changefreq: "monthly", priority: 0.8 },
  { path: "/nurse-resume", changefreq: "monthly", priority: 0.8 },
  { path: "/teacher-resume", changefreq: "monthly", priority: 0.8 },
];