import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Seo } from "@/components/Seo";

export type FaqItem = { q: string; a: string };

type Props = {
  path: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  highlight?: string; // word/phrase inside h1 to gradient-highlight
  intro: string;
  benefits: string[];
  sections: { heading: string; body: ReactNode }[];
  faq: FaqItem[];
  primaryCta?: { label: string; to: string };
  internalLinks?: { label: string; to: string; description: string }[];
};

export function SeoLanding({
  path,
  metaTitle,
  metaDescription,
  eyebrow,
  h1,
  highlight,
  intro,
  benefits,
  sections,
  faq,
  primaryCta = { label: "See pricing", to: "/pricing" },
  internalLinks = [],
}: Props) {
  const renderH1 = () => {
    if (!highlight || !h1.includes(highlight)) return h1;
    const [before, after] = h1.split(highlight);
    return (
      <>
        {before}
        <span className="text-gradient">{highlight}</span>
        {after}
      </>
    );
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: metaTitle,
      description: metaDescription,
      url: `https://resumely.app${path}`,
      isPartOf: { "@type": "WebSite", name: "Resumely", url: "https://resumely.app/" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://resumely.app/" },
        { "@type": "ListItem", position: 2, name: eyebrow, item: `https://resumely.app${path}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Seo title={metaTitle} description={metaDescription} path={path} jsonLd={jsonLd} />
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="container relative pt-20 pb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
            <Sparkles className="h-3 w-3" /> {eyebrow}
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
            {renderH1()}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">{intro}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-12 px-6">
              <Link to={primaryCta.to}>
                {primaryCta.label} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <Link to="/pricing">View Pro plans</Link>
            </Button>
          </div>

          <ul className="mt-8 grid sm:grid-cols-2 gap-2.5 text-sm">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Body sections */}
      <section className="container py-16 max-w-3xl space-y-12">
        {sections.map((s) => (
          <div key={s.heading}>
            <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-3">{s.heading}</h2>
            <div className="text-muted-foreground leading-relaxed space-y-3">{s.body}</div>
          </div>
        ))}

        {/* FAQ */}
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-5">
            {faq.map((f) => (
              <div key={f.q}>
                <h3 className="font-medium text-foreground">{f.q}</h3>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Internal links */}
        {internalLinks.length > 0 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight mb-6">Explore more</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {internalLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-xl border bg-card p-5 hover:border-primary/40 hover:shadow-elegant transition group"
                >
                  <div className="font-medium group-hover:text-primary transition-colors flex items-center gap-1.5">
                    {l.label} <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{l.description}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Final CTA */}
        <div className="rounded-2xl bg-gradient-card border p-8 md:p-10 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            Ready to land your next role?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Start free. Upgrade to Pro to download unlimited PDFs.
          </p>
          <Button asChild size="lg" className="mt-6 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-12 px-8">
            <Link to="/pricing">See Pro pricing <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}