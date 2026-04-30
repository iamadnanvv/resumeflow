import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, GraduationCap, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StudentVerifyDialog } from "@/components/StudentVerifyDialog";

const STUDENT_PLAN_IDS = new Set(["student_basic", "student_premium", "student_pro"]);
const TEACHER_PLAN_IDS = new Set(["teacher_basic", "teacher_premium", "teacher_pro"]);

const PLANS = [
  {
    id: "free", name: "Free", price: 0, currency: "₹",
    tagline: "Get started",
    features: ["1 resume", "Minimal & Modern templates", "PDF export", "Basic ATS score"],
    cta: "Get started",
  },
  {
    id: "pro", name: "Pro", price: 499, currency: "₹", popular: true,
    tagline: "For active job seekers",
    features: ["10 resumes", "All templates incl. premium", "AI rewriting unlimited", "Cover letter builder", "Advanced ATS scoring", "Priority support"],
    cta: "Upgrade to Pro",
  },
  {
    id: "premium", name: "Premium", price: 999, currency: "₹",
    tagline: "Unlimited everything",
    features: ["Unlimited resumes", "All Pro features", "Unlimited cover letters", "Resume review by AI", "Priority AI processing", "Early access to new templates"],
    cta: "Go Premium",
  },
];

const STUDENT_PLANS = [
  {
    id: "student_basic", name: "Student Basic", price: 199, currency: "₹",
    tagline: "For first-time job seekers",
    features: ["3 resumes", "All standard templates", "PDF export", "Basic ATS score", "Email support"],
    cta: "Get Student Basic",
  },
  {
    id: "student_premium", name: "Student Premium", price: 299, currency: "₹", popular: true,
    tagline: "Most popular for students",
    features: ["10 resumes", "All templates incl. premium", "AI rewriting (50/mo)", "5 cover letters / mo", "Advanced ATS scoring"],
    cta: "Get Student Premium",
  },
  {
    id: "student_pro", name: "Student Pro", price: 399, currency: "₹",
    tagline: "Everything for campus placements",
    features: ["Unlimited resumes", "Unlimited AI rewriting", "Unlimited cover letters", "Resume review by AI", "Priority support"],
    cta: "Get Student Pro",
  },
];

const TEACHER_PLANS = [
  {
    id: "teacher_basic", name: "Teacher Basic", price: 299, currency: "₹",
    tagline: "For new educators",
    features: ["5 resumes / CVs", "Academic CV templates", "PDF export", "Cover letter (3/mo)", "Email support"],
    cta: "Get Teacher Basic",
  },
  {
    id: "teacher_premium", name: "Teacher Premium", price: 499, currency: "₹", popular: true,
    tagline: "Most popular for faculty",
    features: ["15 resumes / CVs", "All academic templates", "AI rewriting (100/mo)", "Unlimited cover letters", "Advanced ATS scoring"],
    cta: "Get Teacher Premium",
  },
  {
    id: "teacher_pro", name: "Teacher Pro", price: 699, currency: "₹",
    tagline: "For department heads & researchers",
    features: ["Unlimited resumes / CVs", "Unlimited AI rewriting", "Publication & grants sections", "Resume review by AI", "Priority support"],
    cta: "Get Teacher Pro",
  },
];

declare global { interface Window { Razorpay?: any } }

export default function Pricing() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [pendingStudentPlan, setPendingStudentPlan] = useState<string | null>(null);
  const [isVerifiedStudent, setIsVerifiedStudent] = useState(false);
  const [isVerifiedTeacher, setIsVerifiedTeacher] = useState(false);
  const [verifyKind, setVerifyKind] = useState<"student" | "teacher">("student");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) { setIsVerifiedStudent(false); setIsVerifiedTeacher(false); return; }
      const { data } = await supabase
        .from("student_verifications")
        .select("id, kind")
        .eq("user_id", user.id)
        .eq("verified", true);
      if (active) {
        const rows = (data ?? []) as Array<{ kind?: string }>;
        setIsVerifiedStudent(rows.some(r => (r.kind ?? "student") === "student"));
        setIsVerifiedTeacher(rows.some(r => r.kind === "teacher"));
      }
    })();
    return () => { active = false; };
  }, [user]);

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true); s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const upgrade = async (planId: string) => {
    if (!user) { navigate("/dashboard"); return; }
    if (planId === "free") { navigate("/dashboard"); return; }

    // Gate: student/teacher plans require verification of matching kind
    if (STUDENT_PLAN_IDS.has(planId) && !isVerifiedStudent) {
      setPendingStudentPlan(planId);
      setVerifyKind("student");
      setVerifyOpen(true);
      return;
    }
    if (TEACHER_PLAN_IDS.has(planId) && !isVerifiedTeacher) {
      setPendingStudentPlan(planId);
      setVerifyKind("teacher");
      setVerifyOpen(true);
      return;
    }

    setLoadingPlan(planId);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Failed to load Razorpay");
      const { data, error } = await supabase.functions.invoke("razorpay-create-order", { body: { plan: planId } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const rzp = new window.Razorpay({
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "resumelylite",
        description: `resumelylite ${planId.toUpperCase()} plan`,
        order_id: data.order_id,
        prefill: { email: user.email, name: profile?.full_name || "" },
        theme: { color: "#10b981" },
        handler: async (resp: any) => {
          const { data: vd, error: ve } = await supabase.functions.invoke("razorpay-verify", {
            body: {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            }
          });
          if (ve || vd?.error) {
            toast.error("Payment verification failed");
          } else {
            toast.success(`Welcome to ${planId.toUpperCase()}!`);
            await refreshProfile();
            navigate("/billing");
          }
        },
        modal: { ondismiss: () => setLoadingPlan(null) },
      });
      rzp.open();
    } catch (e: any) {
      toast.error(e.message?.includes("not configured") ? "Razorpay not configured yet — add API keys" : (e.message || "Could not start checkout"));
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Pricing — resumelylite AI Resume Builder"
        description="Simple pricing for resumelylite. Free forever for basic resumes. Pro at ₹499/mo for unlimited PDF downloads, AI rewriting, and premium templates."
        path="/pricing"
      />
      <SiteHeader />
      <main className="flex-1 container py-20">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
            <Sparkles className="h-3 w-3" /> Simple pricing
          </div>
          <h1 className="font-display text-5xl font-semibold tracking-tight">Pick your plan.</h1>
          <p className="mt-4 text-muted-foreground">Cancel anytime. All plans include core builder + PDF export.</p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((p) => {
            const isCurrent = profile?.plan === p.id;
            return (
              <div key={p.id} className={`relative rounded-2xl p-8 border ${p.popular ? "border-primary/40 bg-gradient-card shadow-glow" : "bg-card"}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div className="text-sm text-muted-foreground">{p.tagline}</div>
                <div className="font-display text-2xl font-semibold mt-1">{p.name}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-display font-semibold">{p.currency}{p.price}</span>
                  <span className="text-muted-foreground text-sm">/ month</span>
                </div>
                <Button
                  className={`w-full mt-6 ${p.popular ? "bg-gradient-primary text-primary-foreground hover:opacity-90" : ""}`}
                  variant={p.popular ? "default" : "outline"}
                  disabled={isCurrent || loadingPlan === p.id}
                  onClick={() => upgrade(p.id)}
                >
                  {isCurrent ? "Current plan" : loadingPlan === p.id ? "Loading…" : p.cta}
                </Button>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Payments processed securely by Razorpay. UPI, cards & netbanking supported.
        </p>

        {/* Student Offer Program */}
        <section id="students" className="mt-24 max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
              <GraduationCap className="h-3 w-3" /> Student Offer Program
            </div>
            <h2 className="font-display text-4xl font-semibold tracking-tight">
              Built for students. <span className="text-gradient">Priced for students.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Up to 60% off regular pricing for verified students. Use your campus email at checkout.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              {user && isVerifiedStudent ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                  <Check className="h-3 w-3" /> Student status verified
                </span>
              ) : user ? (
                <Button size="sm" variant="outline" onClick={() => { setPendingStudentPlan(null); setVerifyOpen(true); }}>
                  Verify student status
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">Sign in to verify your student email.</span>
              )}
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {STUDENT_PLANS.map((p) => {
              const isCurrent = profile?.plan === p.id;
              return (
                <div
                  key={p.id}
                  className={`relative rounded-2xl p-8 border ${
                    p.popular ? "border-primary/40 bg-gradient-card shadow-glow" : "bg-card"
                  }`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most popular
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">{p.tagline}</div>
                  <div className="font-display text-2xl font-semibold mt-1">{p.name}</div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-display font-semibold">
                      {p.currency}
                      {p.price}
                    </span>
                    <span className="text-muted-foreground text-sm">/ month</span>
                  </div>
                  <Button
                    className={`w-full mt-6 ${
                      p.popular ? "bg-gradient-primary text-primary-foreground hover:opacity-90" : ""
                    }`}
                    variant={p.popular ? "default" : "outline"}
                    disabled={isCurrent || loadingPlan === p.id}
                    onClick={() => upgrade(p.id)}
                  >
                    {isCurrent ? "Current plan" : loadingPlan === p.id ? "Loading…" : p.cta}
                  </Button>
                  <ul className="mt-6 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            Student pricing requires a valid .edu / campus email. We may request verification.
          </p>
        </section>
      </main>
      <SiteFooter />
      <StudentVerifyDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        onVerified={() => {
          setIsVerifiedStudent(true);
          if (pendingStudentPlan) {
            const planId = pendingStudentPlan;
            setPendingStudentPlan(null);
            // Brief delay so the dialog can fully close before opening Razorpay
            setTimeout(() => upgrade(planId), 200);
          }
        }}
      />
    </div>
  );
}