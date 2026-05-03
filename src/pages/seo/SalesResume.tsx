import { SeoLanding } from "@/components/SeoLanding";

export default function SalesResume() {
  return (
    <SeoLanding
      path="/sales-resume"
      metaTitle="Sales Resume Builder — Quota, Attainment, Pipeline, Closed-Won"
      metaDescription="Build a sales resume that leads with quota, attainment, ACV, and closed-won. AI bullet rewrites and ATS-safe templates trusted by SaaS sales teams."
      eyebrow="Sales"
      h1="A sales resume that leads with quota and attainment."
      highlight="quota and attainment"
      intro="Sales hiring managers scan for one thing first: did you hit your number? resumelylite puts quota, attainment, and ACV at the top of every role — exactly where they belong."
      benefits={[
        "Quota-first formatting (% to plan, ACV, deal size, ramp)",
        "Bullets for pipeline generation, closed-won, expansion, retention",
        "Keyword matching for Salesforce, Outreach, Gong, ZoomInfo, MEDDIC",
        "Templates for AE, SDR, AM, CSM, and Sales Leadership",
        "ATS-safe single-column layout for enterprise recruiting platforms",
        "Pair with a tailored cover letter for every territory",
      ]}
      sections={[
        {
          heading: "The one-line anatomy of a great sales bullet",
          body: (
            <p>
              Quota → attainment → number of deals → ACV → standout logo. Example: "$1.4M
              quota, 138% attainment FY24 — closed 22 new logos avg ACV $63K, including
              [Marquee Logo]." resumelylite rewrites your bullets to that exact pattern.
            </p>
          ),
        },
        {
          heading: "Show ramp and consistency",
          body: (
            <p>
              Reps who hit quota multiple years in a row outperform one-hit wonders in
              recruiter triage. The template surfaces multi-year attainment so consistency is
              visible at a glance.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Should I include a President's Club mention?",
          a: "Yes — call it out under Awards or directly on the role line. It's a strong signal.",
        },
        {
          q: "What if I'm under NDA on revenue?",
          a: "Use percentages and ranges — '120%+ to plan, 25 new logos' still tells the story.",
        },
        {
          q: "Can I list MEDDIC, SPIN, Challenger?",
          a: "Yes — methodology fluency belongs in skills or under sales leadership bullets.",
        },
      ]}
      internalLinks={[
        { label: "Marketing Resume", to: "/marketing-resume", description: "Demand gen and growth roles." },
        { label: "Product Manager Resume", to: "/product-manager-resume", description: "For sales-engineering pivots." },
        { label: "ATS Resume", to: "/ats-resume", description: "Pass enterprise ATS filters." },
      ]}
    />
  );
}