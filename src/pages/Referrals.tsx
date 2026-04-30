import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Gift, Users, Wallet, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Referral = {
  id: string;
  status: string;
  reward_amount: number;
  rewarded_at: string | null;
  created_at: string;
};

export default function Referrals() {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [credits, setCredits] = useState<{ balance: number; lifetime_earned: number } | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, { data: cr }, { data: refs }] = await Promise.all([
        supabase.from("profiles").select("referral_code").eq("id", user.id).maybeSingle(),
        supabase.from("user_credits").select("balance, lifetime_earned").eq("user_id", user.id).maybeSingle(),
        supabase.from("referrals").select("id, status, reward_amount, rewarded_at, created_at")
          .eq("referrer_id", user.id).order("created_at", { ascending: false }),
      ]);
      setCode((prof as any)?.referral_code ?? null);
      setCredits((cr as any) ?? { balance: 0, lifetime_earned: 0 });
      setReferrals((refs as Referral[]) ?? []);
    })();
  }, [user]);

  const link = code ? `${window.location.origin}/?ref=${code}` : "";
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "resumelylite", text: "Build a job-winning resume on resumelylite — get 10% off:", url: link }); }
      catch {}
    } else { copy(link); }
  };

  const rewardedCount = referrals.filter(r => r.status === "rewarded").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Seo title="Referrals — resumelylite" description="Invite friends to resumelylite. Earn ₹100 in credit per paid signup. They get 10% off." path="/referrals" />
      <SiteHeader />
      <main className="flex-1 container py-16">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
            <Gift className="h-3 w-3" /> Referral Program
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Give 10% off, earn <span className="text-gradient">₹100 credit</span>.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Friends get 10% off their first paid plan. You earn ₹100 in credit per paid signup — redeemable on any future plan.
          </p>

          {!user ? (
            <Card className="mt-8 p-6 text-center">
              <p className="text-sm text-muted-foreground">Sign in to get your referral link.</p>
              <Button asChild className="mt-4 bg-gradient-primary text-primary-foreground"><Link to="/dashboard">Sign in</Link></Button>
            </Card>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-4 mt-8">
                <Card className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="h-3.5 w-3.5" /> Credit balance</div>
                  <div className="mt-2 font-display text-3xl font-semibold">₹{credits?.balance ?? 0}</div>
                </Card>
                <Card className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Gift className="h-3.5 w-3.5" /> Lifetime earned</div>
                  <div className="mt-2 font-display text-3xl font-semibold">₹{credits?.lifetime_earned ?? 0}</div>
                </Card>
                <Card className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" /> Paid referrals</div>
                  <div className="mt-2 font-display text-3xl font-semibold">{rewardedCount}</div>
                </Card>
              </div>

              <Card className="mt-6 p-6">
                <div className="text-sm font-medium">Your referral link</div>
                <div className="mt-3 flex gap-2">
                  <Input readOnly value={link} className="font-mono text-sm" />
                  <Button variant="outline" onClick={() => copy(link)}><Copy className="h-4 w-4" /></Button>
                  <Button onClick={share} className="bg-gradient-primary text-primary-foreground hover:opacity-90"><Share2 className="h-4 w-4 mr-1.5" />Share</Button>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Or share your code: <button onClick={() => code && copy(code)} className="font-mono font-semibold text-foreground hover:text-primary">{code || "—"}</button>
                </div>
              </Card>

              <Card className="mt-6 p-6">
                <div className="text-sm font-medium mb-3">Your referrals</div>
                {referrals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No referrals yet. Share your link to start earning.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {referrals.map((r) => (
                      <li key={r.id} className="py-3 flex items-center justify-between text-sm">
                        <div>
                          <div className="font-medium capitalize">{r.status}</div>
                          <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className={r.status === "rewarded" ? "text-primary font-medium" : "text-muted-foreground"}>
                          {r.status === "rewarded" ? `+₹${r.reward_amount}` : "Pending"}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <p className="mt-8 text-xs text-muted-foreground text-center">
                Credits are auto-applied on your next checkout. Self-referrals and post-paid claims are not eligible.
              </p>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}