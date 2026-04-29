import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

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

declare global { interface Window { Razorpay?: any } }

export default function Pricing() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

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
      </main>
      <SiteFooter />
    </div>
  );
}