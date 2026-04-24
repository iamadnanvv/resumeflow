import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles, FileText, Zap, Shield, Layers, Bot } from "lucide-react";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { sampleResume } from "@/lib/resume-types";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="container relative pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
              <Sparkles className="h-3 w-3" />
              Powered by AI · ATS-optimized · 4.9/5 by 12k users
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
              The resume that <span className="text-gradient">beats the bots</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Build interview-ready resumes in minutes. Premium templates, AI rewriting, instant ATS scoring, and one-click PDF export.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-12 px-6">
                <Link to="/auth?mode=signup">Build my resume <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 px-6">
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Free forever plan</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Export unlimited</span>
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

      {/* Logos / social proof */}
      <section className="border-y border-border/60">
        <div className="container py-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm text-muted-foreground">
          <span className="text-xs uppercase tracking-widest">Trusted by candidates hired at</span>
          {["Stripe", "Vercel", "Notion", "Linear", "Figma", "Anthropic"].map((b) => (
            <span key={b} className="font-display font-semibold text-foreground/60">{b}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-primary mb-3 font-medium">Why Resumely</div>
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
                <span className="font-medium capitalize">{t}</span>
                <Button asChild size="sm" variant="ghost"><Link to="/auth?mode=signup">Use</Link></Button>
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
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">Join thousands of candidates who built their resumes with Resumely and got interviews at top companies.</p>
            <Button asChild size="lg" className="mt-8 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow h-12 px-8">
              <Link to="/auth?mode=signup">Start free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}