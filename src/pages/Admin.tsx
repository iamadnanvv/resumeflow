import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { Users, FileText, CreditCard, TrendingUp } from "lucide-react";

export default function Admin() {
  const [stats, setStats] = useState({ users: 0, resumes: 0, payments: 0, revenue: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: uc }, { count: rc }, { data: pays }, { data: profs }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("resumes").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      const paid = (pays || []).filter((p) => p.status === "paid");
      setStats({
        users: uc || 0,
        resumes: rc || 0,
        payments: paid.length,
        revenue: paid.reduce((a, p) => a + p.amount, 0) / 100,
      });
      setPayments(pays || []);
      setUsers(profs || []);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview & user management.</p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Users} label="Total users" value={stats.users.toLocaleString()} />
          <Stat icon={FileText} label="Resumes built" value={stats.resumes.toLocaleString()} />
          <Stat icon={CreditCard} label="Successful payments" value={stats.payments.toLocaleString()} />
          <Stat icon={TrendingUp} label="Revenue" value={`₹${stats.revenue.toLocaleString()}`} accent />
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-6">
          <div className="border rounded-2xl bg-card overflow-hidden">
            <div className="px-5 py-3 border-b text-xs uppercase tracking-widest text-muted-foreground">Recent users</div>
            <div className="divide-y">
              {users.map((u) => (
                <div key={u.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{u.full_name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className={`text-xs uppercase px-2 py-0.5 rounded ${u.plan === "free" ? "bg-muted" : "bg-primary/10 text-primary"}`}>{u.plan}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border rounded-2xl bg-card overflow-hidden">
            <div className="px-5 py-3 border-b text-xs uppercase tracking-widest text-muted-foreground">Recent payments</div>
            <div className="divide-y">
              {payments.map((p) => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium uppercase">{p.plan}</div>
                    <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">₹{(p.amount / 100).toFixed(0)}</div>
                    <div className={`text-xs ${p.status === "paid" ? "text-primary" : "text-muted-foreground"}`}>{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: any) {
  return (
    <div className={`rounded-2xl p-5 border ${accent ? "bg-gradient-card shadow-elegant" : "bg-card"}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</div>
      <div className="font-display text-3xl font-semibold mt-2">{value}</div>
    </div>
  );
}