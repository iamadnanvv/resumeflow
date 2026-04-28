import { SeoLanding } from "@/components/SeoLanding";

export default function ResumeBuilder() {
  return (
    <SeoLanding
      path="/resume-builder"
      metaTitle="AI Resume Builder — Make a Professional Resume in Minutes"
      metaDescription="Build a professional resume with AI rewriting, premium templates, drag-and-drop sections, live preview, and instant PDF export. Start free."
      eyebrow="Resume Builder"
      h1="The fastest AI resume builder for professionals."
      highlight="AI resume builder"
      intro="Skip the blank-page paralysis. Resumely's AI writes your summary, improves your bullets, and structures your experience — all while you watch the live preview update."
      benefits={[
        "AI-written summaries tuned to your target role",
        "One-click bullet rewrites with measurable impact",
        "10+ premium, ATS-safe templates",
        "Drag-and-drop sections, live preview",
        "Auto-save — never lose your work",
        "Export to PDF in one click (Pro)",
      ]}
      sections={[
        {
          heading: "Build a polished resume in under 5 minutes",
          body: (
            <p>
              Pick a template, paste your job history, and let AI rewrite each bullet with strong
              action verbs and quantifiable outcomes. The builder is designed for speed: every
              section is editable inline, and your preview updates as you type.
            </p>
          ),
        },
        {
          heading: "Templates that recruiters actually like",
          body: (
            <p>
              Every Resumely template is built with hiring managers in mind: clear hierarchy,
              generous whitespace, scannable headings, and zero distractions. Switch templates any
              time without losing your content — your data is stored separately from the design.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Is the resume builder really free?",
          a: "Yes. You can build, edit, and preview unlimited resumes for free. Downloading PDFs is included with the Pro plan (₹499/month).",
        },
        {
          q: "How does the AI rewriting work?",
          a: "Resumely uses Google Gemini and OpenAI GPT models to rewrite your bullets into stronger, results-oriented copy. Nothing is shared with third parties beyond the model call.",
        },
        {
          q: "Can I switch between templates?",
          a: "Yes — switch any time from the builder header. Your content stays intact when you change designs.",
        },
      ]}
      internalLinks={[
        { label: "ATS Resume", to: "/ats-resume", description: "Beat applicant tracking systems with live scoring." },
        { label: "Cover Letter Generator", to: "/cover-letter-generator", description: "Generate matching cover letters in seconds." },
        { label: "Pricing", to: "/pricing", description: "Unlock unlimited PDF downloads with Pro." },
      ]}
    />
  );
}