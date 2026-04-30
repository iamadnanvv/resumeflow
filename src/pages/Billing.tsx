import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Receipt, GraduationCap, Briefcase, BookOpen } from "lucide-react";
import { toast } from "sonner";

const TYPES = [
  { id: "student", label: "Student", icon: GraduationCap },
  { id: "professional", label: "Working professional", icon: Briefcase },
  { id: "teacher", label: "Teacher / Educator", icon: BookOpen },
] as const;

export default function Billing() {
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [sub, setSub] = useState<any>(null);
  const [userType, setUserType] = useState<string>("");
  const [savingType, setSavingType] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: s }, { data: prof }] = await Promise.all([
        supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("profiles").select("user_type").eq("id", user.id).maybeSingle(),
      ]);
      setPayments(p || []);
      setSub(s);
      setUserType(((prof as any)?.user_type as string) ?? "");
    })();
  }, [user]);

  const saveType = async (t: string) => {
    if (!user) return;
    setSavingType(true);
    const { error } = await supabase.from("profiles").update({ user_type: t as any }).eq("id", user.id);
    setSavingType(false);
    if (error) { toast.error(error.message); return; }
    setUserType(t);
    toast.success("Updated");
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10 max-w-4xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Billing</h1>

        <div className="mt-6 glass rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Current plan</div>
            <div className="font-display text-2xl font-semibold mt-1 flex items-center gap-2">
              {profile?.plan?.toUpperCase() || "FREE"}
              {profile?.plan !== "free" && <Sparkles className="h-4 w-4 text-primary" />}
            </div>
            {sub?.current_period_end && (
              <div className="text-xs text-muted-foreground mt-1">Renews on {new Date(sub.current_period_end).toLocaleDateString()}</div>
            )}
          </div>
          <Button asChild variant={profile?.plan === "free" ? "default" : "outline"} className={profile?.plan === "free" ? "bg-gradient-primary text-primary-foreground hover:opacity-90" : ""}>
            <Link to="/pricing">{profile?.plan === "free" ? "Upgrade" : "Change plan"}</Link>
          </Button>
        </div>

        <div className="mt-6 glass rounded-2xl p-6">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">I am a</div>
          <div className="mt-3 grid sm:grid-cols-3 gap-2">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const active = userType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={savingType}
                  onClick={() => saveType(t.id)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                    active ? "border-primary bg-primary/5 text-foreground" : "border-border hover:border-primary/40"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Used to suggest the right pricing (student / teacher discounts) and templates.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Payment history</h2>
          {payments.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-card border rounded-xl p-8 text-center">
              <Receipt className="h-8 w-8 mx-auto mb-2 opacity-40" /> No payments yet.
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="text-left px-4 py-3">Date</th><th className="text-left px-4 py-3">Plan</th><th className="text-left px-4 py-3">Amount</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Order ID</th></tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-4 py-3">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 uppercase">{p.plan}</td>
                      <td className="px-4 py-3">₹{(p.amount / 100).toFixed(2)}</td>
                      <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded text-xs ${p.status === "paid" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{p.status}</span></td>
                      <td className="px-4 py-3 font-mono text-xs">{p.razorpay_order_id?.slice(0, 16)}…</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}