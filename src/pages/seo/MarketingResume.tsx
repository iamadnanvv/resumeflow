import { SeoLanding } from "@/components/SeoLanding";

export default function MarketingResume() {
  return (
    <SeoLanding
      path="/marketing-resume"
      metaTitle="Marketing Resume Builder — Show Pipeline, Growth, and ROI"
      metaDescription="Build a marketing resume that proves growth: pipeline sourced, CAC payback, organic traffic, MQLs. AI bullet rewrites and ATS-friendly templates."
      eyebrow="Marketing"
      h1="A marketing resume that quantifies growth."
      highlight="growth"
      intro="Marketing leaders are hired on numbers: pipeline, payback, traffic, conversion. resumelylite makes sure every bullet on your resume earns its place with a metric."
      benefits={[
        "Bullets tuned for pipeline, CAC, ROAS, MQLs, and SEO traffic",
        "Channel-aware AI: paid, content, lifecycle, ABM, partnerships",
        "Keyword matching for HubSpot, Marketo, GA4, Looker, Segment",
        "Sections for campaigns, launches, and certifications",
        "ATS-safe layouts trusted by enterprise applicant tracking systems",
        "Cover letter generator tailored per role and brand voice",
      ]}
      sections={[
        {
          heading: "Numbers beat adjectives",
          body: (
            <p>
              "Drove growth through innovative campaigns" is invisible. "Launched paid program
              ($120K/mo) → 3.4x ROAS, 1,800 MQLs/qtr at $42 CPL" gets a reply. resumelylite
              rewrites every bullet into that shape.
            </p>
          ),
        },
        {
          heading: "Generalist or specialist?",
          body: (
            <p>
              Targeting a senior generalist role? Show range across paid, content, and lifecycle.
              Targeting a specialist role like SEO lead? Concentrate the resume on the channel
              and de-emphasize the rest. The builder makes both reorderable in seconds.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Should I include campaign budgets?",
          a: "Yes when allowed — budget context makes ROAS and CAC numbers meaningful.",
        },
        {
          q: "Where do I put HubSpot or Marketo certifications?",
          a: "Use the dedicated Certifications section with issuer and date fields.",
        },
        {
          q: "How do I handle agency vs. in-house experience?",
          a: "Lead each role with the most credible client/brand worked on, then show outcomes.",
        },
      ]}
      internalLinks={[
        { label: "Sales Resume", to: "/sales-resume", description: "Quota-carrying templates." },
        { label: "Designer Resume", to: "/designer-resume", description: "For brand and content designers." },
        { label: "Cover Letter Generator", to: "/cover-letter-generator", description: "Tone-matched cover letters." },
      ]}
    />
  );
}