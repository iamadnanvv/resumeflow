import { SeoLanding } from "@/components/SeoLanding";

export default function ProductManagerResume() {
  return (
    <SeoLanding
      path="/product-manager-resume"
      metaTitle="Product Manager Resume Builder — Show Outcomes, Not Tasks"
      metaDescription="Craft a PM resume that highlights shipped products, revenue impact, and user metrics. ATS-friendly templates and AI bullet rewrites built for product managers."
      eyebrow="Product Manager"
      h1="A product manager resume focused on outcomes."
      highlight="outcomes"
      intro="PM resumes live or die by metrics. resumelylite turns every bullet into an outcome statement: what you shipped, who it served, and the number that proves it worked."
      benefits={[
        "Outcome-first bullet rewrites (ARR, retention, NPS, activation)",
        "Sections for shipped products, A/B tests, and roadmaps",
        "Keyword matching for Jira, Figma, SQL, Mixpanel, Amplitude",
        "Frameworks-aware AI: RICE, ICE, JTBD, North Star",
        "Templates that read clean to non-technical interviewers too",
        "ATS-safe export with text-layer PDF",
      ]}
      sections={[
        {
          heading: "From task list to outcome story",
          body: (
            <p>
              The biggest PM resume mistake is describing what you did instead of what changed.
              resumelylite rewrites "Led roadmap planning" into "Owned roadmap for checkout
              (4 engineers); shipped 9 experiments → +12% conversion, +$2.1M ARR."
            </p>
          ),
        },
        {
          heading: "Show range without losing focus",
          body: (
            <p>
              Strong PM resumes prove range — discovery, delivery, growth — without becoming a
              wall of text. Our templates use grouped sub-bullets and tight typography so a
              hiring manager can see breadth in one scan.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "How many bullets per role?",
          a: "3–5 outcome-led bullets per role works best. resumelylite flags weak bullets so you can prioritize the strongest.",
        },
        {
          q: "Should I include certifications like CSPO?",
          a: "Yes if relevant — the builder has a dedicated Certifications section with issuer and date fields.",
        },
        {
          q: "How do I handle confidential metrics?",
          a: "Use ranges or relative percentages (e.g., '+15% retention') instead of absolute numbers when under NDA.",
        },
      ]}
      internalLinks={[
        { label: "Software Engineer Resume", to: "/software-engineer-resume", description: "For technical PMs and ex-engineers." },
        { label: "Data Scientist Resume", to: "/data-scientist-resume", description: "Lean into analytical impact." },
        { label: "ATS Resume", to: "/ats-resume", description: "Pass the bots before the bar-raiser." },
      ]}
    />
  );
}