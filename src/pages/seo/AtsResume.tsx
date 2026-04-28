import { SeoLanding } from "@/components/SeoLanding";

export default function AtsResume() {
  return (
    <SeoLanding
      path="/ats-resume"
      metaTitle="ATS Resume Builder — Beat Applicant Tracking Systems"
      metaDescription="Create an ATS-friendly resume that passes Applicant Tracking Systems. Real-time ATS scoring, keyword tips, clean formatting, instant PDF export."
      eyebrow="ATS Resume"
      h1="An ATS resume that actually beats the bots."
      highlight="beats the bots"
      intro="Most resumes never reach a recruiter — Applicant Tracking Systems filter them out first. Resumely scores your resume against ATS rules in real time and shows exactly what to fix."
      benefits={[
        "Live ATS score from 0–100 with actionable tips",
        "Single-column, machine-readable templates",
        "Standard headings ATS parsers expect",
        "Keyword & job-description matching",
        "PDF export that preserves text layers",
        "No tables, columns, or graphics that break parsers",
      ]}
      sections={[
        {
          heading: "What is an ATS resume?",
          body: (
            <>
              <p>
                An ATS (Applicant Tracking System) resume is a resume formatted so that automated
                hiring software can read every word — your name, job titles, dates, skills, and
                achievements — without losing structure. Around 75% of large employers use an ATS
                to filter candidates before any human reads their resume.
              </p>
              <p>
                Resumely templates use single-column layouts, standard fonts, real text (not
                images), and the section headings that ATS parsers are trained to recognize.
              </p>
            </>
          ),
        },
        {
          heading: "How Resumely's ATS scoring works",
          body: (
            <p>
              Every edit you make is scored live across six dimensions: contact completeness,
              section coverage, keyword density, action-verb usage, measurable results, and
              formatting safety. The score updates instantly and tells you the single highest-impact
              fix to make next.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Will my Resumely PDF pass an ATS?",
          a: "Yes. All templates export as text-layer PDFs with standard fonts and a single-column structure that the major ATS engines (Workday, Greenhouse, Lever, iCIMS, Taleo) parse cleanly.",
        },
        {
          q: "Do I need to add keywords manually?",
          a: "No — paste a job description into the builder and Resumely highlights the keywords missing from your resume so you can add them naturally to your bullets.",
        },
        {
          q: "Is the ATS scoring free?",
          a: "Yes, ATS scoring is included on every plan including Free. PDF download requires the Pro plan.",
        },
      ]}
      internalLinks={[
        { label: "Resume Builder", to: "/resume-builder", description: "Drag-and-drop builder with AI suggestions." },
        { label: "Cover Letter Generator", to: "/cover-letter-generator", description: "Match your resume with a tailored cover letter." },
        { label: "Pricing", to: "/pricing", description: "Compare Free, Pro, and Premium plans." },
      ]}
    />
  );
}