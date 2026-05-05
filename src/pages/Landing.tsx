import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles, FileText, Zap, Shield, Layers, Bot } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { sampleResume } from "@/lib/resume-types";
import { Onboarding } from "@/components/Onboarding";
import { Seo } from "@/components/Seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    q: "What does ATS-friendly actually mean?",
    a: "Applicant Tracking Systems (Workday, Greenhouse, Lever, Taleo) parse resumes into structured fields. Our templates use single-column layouts, real selectable text (no images of text), and standard section headings so common ATS parsers can read every line.",
  },
  {
    q: "Will my resume pass keyword screening?",
    a: "Our live ATS score flags missing role keywords and weak verbs as you type. Tailor your skills and bullets to the job description — quantified, role-specific bullets consistently score higher in keyword screening.",
  },
  {
    q: "Is the free plan really free?",
    a: "Yes. The Free plan lets you build 1 resume end-to-end, preview every template, and try AI rewriting (subject to fair-use AI credits). PDF download, multiple resumes, and premium templates are part of Pro.",
  },
  {
    q: "How does AI rewriting work?",
    a: "We send only the bullet or section you're improving (never your whole profile) to a fast LLM with a recruiter-tuned prompt. It rewrites for impact, action verbs, and quantified outcomes — you keep full control to accept or edit.",
  },
  {
    q: "Can I import from LinkedIn?",
    a: "Yes. Open any resume in the Builder and click LinkedIn to upload your profile PDF or data export. We extract your experience, education, and skills automatically.",
  },
  {
    q: "Can recruiters tell I used a template?",
    a: "Our templates use clean, single-column layouts in line with what most recruiters and ATS expect. They look professionally designed without screaming \"template\" — the focus stays on your content.",
  },
  {
    q: "Do you offer student or teacher discounts?",
    a: "Yes. Verify with a campus email (e.g. .edu, .ac.uk, school or university subdomains) on the Pricing page to unlock student and teacher pricing.",
  },
  {
    q: "How do refunds work?",
    a: "Email support within 7 days of your first paid charge if Pro isn't a fit and we'll review your refund request.",
  },
];

export default function Landing() {
  const [obOpen, setObOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="resumelylite — AI Resume Builder for ATS-Friendly Resumes"
        description="Build resumes that beat the bots. AI rewriting, real-time ATS scoring, premium templates, and one-click PDF export. Start free."
        path="/"
      />
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="container relative pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
              <Sparkles className="h-3 w-3" />
              Powered by AI · ATS-optimized · Free to start
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
              The resume that <span className="text-gradient">beats the bots</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Build interview-ready resumes in minutes. Premium templates, AI rewriting, instant ATS scoring, and one-click PDF export.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setObOpen(true)} className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-12 px-6">
                Build my resume <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-6">
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Free to build</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> PDF export with Pro</span>
            </div>
          </div>
          <div className="relative animate-fade-in" style={{ animationDelay: "150ms" }}>
            <div className="absolute -inset-8 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
            <div className="relative scale-[0.55] origin-top -mt-12 -mb-32 lg:scale-[0.65] xl:scale-75">
              <ResumePreview content={sampleResume} template="modern" />
            </div>
          </div>
        </div>
      </section>

      {/* Value strip — neutral, fact-based */}
      <section className="border-y border-border/60 bg-background/50">
        <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { k: "ATS-safe", v: "Single-column, parser-friendly layouts" },
            { k: "AI-assisted", v: "Rewrite bullets in your voice" },
            { k: "Live score", v: "See ATS feedback as you type" },
            { k: "Export", v: "One-click PDF (Pro)" },
          ].map((item) => (
            <div key={item.k}>
              <div className="text-xs uppercase tracking-widest text-primary font-medium">{item.k}</div>
              <div className="text-sm text-muted-foreground mt-1">{item.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-primary mb-3 font-medium">Why resumelylite</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Everything to land the interview.</h2>
          <p className="mt-4 text-muted-foreground">A complete toolkit, not just templates. Built with the same craft as the products you're applying to.</p>
        </div>
        <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Bot, title: "AI rewriting", desc: "Turn weak bullets into achievements with quantified impact." },
            { icon: Shield, title: "ATS-optimized", desc: "Layouts that parse cleanly through every applicant tracking system." },
            { icon: Zap, title: "Live ATS score", desc: "Real-time score with actionable tips as you type." },
            { icon: Layers, title: "Multiple resumes", desc: "Tailor versions per role. Switch templates in one click." },
            { icon: FileText, title: "Cover letter builder", desc: "Generate tailored cover letters with your resume context." },
            { icon: Sparkles, title: "Premium templates", desc: "Designer-crafted layouts. Recruiter-tested. Pixel-perfect." },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:shadow-elegant transition-all hover:-translate-y-1">
              <div className="bg-primary/10 text-primary inline-flex p-2.5 rounded-lg mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="container py-24 border-t border-border/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-widest text-primary mb-3 font-medium">Templates</div>
          <h2 className="font-display text-4xl font-semibold tracking-tight">Beautiful. ATS-safe. Yours.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {["minimal", "modern", "executive"].map((t) => (
            <div key={t} className="group relative rounded-2xl overflow-hidden border bg-gradient-card hover:shadow-elegant transition">
              <div className="aspect-[3/4] overflow-hidden">
                <div className="scale-[0.32] origin-top-left -translate-y-2">
                  <ResumePreview content={sampleResume} template={t} />
                </div>
              </div>
              <div className="p-4 border-t flex items-center justify-between">
                <span className="font-medium capitalize">
                  {t}{t === "executive" && <span className="ml-1.5 text-[10px] font-normal text-primary">Pro</span>}
                </span>
                <Button size="sm" variant="ghost" onClick={() => setObOpen(true)}>Use</Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-card border p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-primary opacity-10" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">Your next role is one resume away.</h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Build a polished, ATS-friendly resume with resumelylite — free to start, no credit card required.</p>
            <Button size="lg" onClick={() => setObOpen(true)} className="mt-8 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-12 px-8">
              Start free <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container py-24 border-t border-border/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-primary mb-3 font-medium">FAQ</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
              Quick answers
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you'd want to know about resumelylite, ATS, and getting hired.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        {/* JSON-LD for FAQ rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
      </section>

      <SiteFooter />
      <Onboarding open={obOpen} onOpenChange={setObOpen} />
    </div>
  );
}