import { SeoLanding } from "@/components/SeoLanding";

export default function SoftwareEngineerResume() {
  return (
    <SeoLanding
      path="/software-engineer-resume"
      metaTitle="Software Engineer Resume Builder — Land FAANG & Startup Roles"
      metaDescription="Build a software engineer resume that passes ATS and impresses tech recruiters. Quantified bullets, GitHub links, system-design highlights, instant PDF export."
      eyebrow="Software Engineer"
      h1="A software engineer resume that gets you to the on-site."
      highlight="on-site"
      intro="Recruiters skim your resume in 6 seconds. resumelylite helps you front-load impact — shipped systems, scale numbers, and the languages and frameworks tech hiring managers actually filter for."
      primaryCta={{ label: "Build my SWE resume", to: "/dashboard?role=software-engineer" }}
      benefits={[
        "Tech-tuned bullet rewrites with measurable impact (latency, scale, %)",
        "Smart sections for GitHub, LeetCode, and portfolio links",
        "Keyword matching for stacks like React, Go, Kubernetes, AWS",
        "ATS-safe single-column layout — Workday, Greenhouse, Lever ready",
        "Templates trusted by candidates hired at FAANG-style companies",
        "Instant PDF export with text-layer parsing",
      ]}
      sections={[
        {
          heading: "What tech recruiters look for in 6 seconds",
          body: (
            <p>
              Tech recruiters scan for three signals: scope (team size, system scale), impact
              (numbers, not adjectives), and stack relevance. resumelylite's AI rewrites your
              bullets to put a verb, a metric, and a technology in every line.
            </p>
          ),
        },
        {
          heading: "Templates built for engineers",
          body: (
            <p>
              Clean, single-column, monospaced-friendly accents. Skills grouped by category
              (Languages / Frameworks / Infra) so a hiring manager can confirm fit in one glance.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Should a software engineer resume be one page?",
          a: "Yes for under ~8 years of experience. resumelylite warns you when your content overflows and suggests bullets to tighten.",
        },
        {
          q: "Do I need a separate skills section?",
          a: "Yes — ATS parsers and recruiters both expect it. resumelylite groups skills automatically so they're scannable.",
        },
        {
          q: "Can I include side projects and open-source?",
          a: "Absolutely. The builder includes a dedicated Projects section with link fields for GitHub, demos, and case studies.",
        },
      ]}
      internalLinks={[
        { label: "ATS Resume", to: "/ats-resume", description: "Make sure your resume parses cleanly." },
        { label: "Cover Letter Generator", to: "/cover-letter-generator", description: "Tailored letters for every tech role." },
        { label: "Product Manager Resume", to: "/product-manager-resume", description: "Switching to PM? Start here." },
      ]}
    />
  );
}