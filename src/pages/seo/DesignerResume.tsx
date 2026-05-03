import { SeoLanding } from "@/components/SeoLanding";

export default function DesignerResume() {
  return (
    <SeoLanding
      path="/designer-resume"
      metaTitle="UX & Product Designer Resume Builder — Pair Craft with Outcomes"
      metaDescription="Build a designer resume that links your portfolio to measurable outcomes. ATS-safe templates, AI rewrites, and dedicated portfolio + case study sections."
      eyebrow="UX / Product Designer"
      h1="A designer resume that does justice to your portfolio."
      highlight="portfolio"
      intro="Design hiring teams want to see craft and impact. resumelylite keeps the resume itself ATS-safe while linking out cleanly to your portfolio, case studies, and Figma files."
      benefits={[
        "Sections for portfolio, case studies, and Dribbble/Behance",
        "Outcome-led bullets (activation, conversion, task time)",
        "Keyword matching for Figma, Sketch, design systems, research",
        "Typography that signals taste without breaking parsers",
        "Single-column ATS-safe layout — no PDFs of Figma frames",
        "Cover letter generator that matches your visual identity",
      ]}
      sections={[
        {
          heading: "Resume ≠ portfolio",
          body: (
            <p>
              The biggest designer-resume mistake is treating it like a portfolio. ATS systems
              can't parse Figma exports. resumelylite keeps the resume clean and text-based,
              and uses a prominent link block for your portfolio.
            </p>
          ),
        },
        {
          heading: "Show research, systems, and shipping",
          body: (
            <p>
              The strongest designer resumes prove all three: research depth, systems thinking,
              and shipped product. Our templates surface each via grouped bullets per role.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Can I use a creative template?",
          a: "Yes — but resumelylite warns you if a layout choice will break ATS parsing. Most teams scan resumes via ATS first.",
        },
        {
          q: "How do I link my Figma case studies?",
          a: "The Projects section has a link field per item, and the contact block supports portfolio + Dribbble + Behance.",
        },
        {
          q: "Should the resume match my portfolio's visual style?",
          a: "A subtle accent color match is great. Don't go further — recruiters value scannability over flair.",
        },
      ]}
      internalLinks={[
        { label: "Product Manager Resume", to: "/product-manager-resume", description: "For design-PM pivots." },
        { label: "Marketing Resume", to: "/marketing-resume", description: "For brand and content designers." },
        { label: "Cover Letter Generator", to: "/cover-letter-generator", description: "Match your tone to each studio." },
      ]}
    />
  );
}