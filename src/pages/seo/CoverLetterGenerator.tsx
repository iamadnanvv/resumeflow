import { SeoLanding } from "@/components/SeoLanding";

export default function CoverLetterGenerator() {
  return (
    <SeoLanding
      path="/cover-letter-generator"
      metaTitle="AI Cover Letter Generator — Tailored Letters in Seconds"
      metaDescription="Generate a personalized, ATS-friendly cover letter in seconds. Paste a job description, pick a tone, and download a polished PDF that matches your resume."
      eyebrow="Cover Letter Generator"
      h1="A tailored cover letter for every job — in seconds."
      highlight="in seconds"
      intro="Stop rewriting the same cover letter from scratch. Paste a job description, choose a tone, and Resumely generates a personalized, ATS-friendly letter that actually sounds like you."
      benefits={[
        "Personalized to the company and role you're targeting",
        "Three tones: confident, conversational, formal",
        "Pulls in your real experience from your Resumely resume",
        "ATS-safe formatting that matches your resume design",
        "Edit any line — AI suggestions are starting points, not lock-ins",
        "PDF export with Pro",
      ]}
      sections={[
        {
          heading: "How the cover letter generator works",
          body: (
            <p>
              Drop in the job title, company name, and a paste of the job description. Resumely
              combines those signals with your resume content to produce a one-page letter that
              opens strong, mirrors the role's keywords, and closes with a clear call to action.
            </p>
          ),
        },
        {
          heading: "Why pair it with your resume",
          body: (
            <p>
              Recruiters see your resume and cover letter side by side. When the design language
              matches — same font pairing, same accent color, same hierarchy — your application
              looks intentional. Resumely keeps both in lockstep automatically.
            </p>
          ),
        },
      ]}
      faq={[
        {
          q: "Are the generated letters unique?",
          a: "Yes. Each letter is generated from your specific resume + the specific job posting. Two users targeting the same role will get distinct letters.",
        },
        {
          q: "Can I edit the AI's output?",
          a: "Absolutely — every line is editable. The AI gives you a strong first draft; you make it yours.",
        },
        {
          q: "How many cover letters can I generate?",
          a: "Free plan includes 1 cover letter. Pro and Premium plans include unlimited cover letter generation.",
        },
      ]}
      internalLinks={[
        { label: "Resume Builder", to: "/resume-builder", description: "Build the matching resume in minutes." },
        { label: "ATS Resume", to: "/ats-resume", description: "Make sure both pieces pass ATS filters." },
        { label: "Pricing", to: "/pricing", description: "Unlock unlimited cover letters with Pro." },
      ]}
    />
  );
}