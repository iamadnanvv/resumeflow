import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Receipt } from "lucide-react";

export default function Billing() {
  const { user, profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [sub, setSub] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      setPayments(p || []);
      setSub(s);
    })();
  }, [user]);

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