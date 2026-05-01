import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Sparkles } from "lucide-react";

type Row = {
  id: string;
  resume_id: string;
  user_id: string;
  source: string;
  template_slug: string | null;
  cloned_from_resume_id: string | null;
  ai_assist_count: number;
  created_at: string;
  resume?: { title: string | null; ats_score: number | null };
  user?: { full_name: string | null };
};

const SOURCE_LABEL: Record<string, string> = {
  scratch: "From scratch",
  template: "Template",
  onboarding: "Onboarding",
  cloned_showcase: "Cloned (showcase)",
  imported: "Imported",
};

export default function AdminAudit() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/dashboard");
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    (async () => {
      const { data: events } = await supabase
        .from("resume_creation_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      const list = (events || []) as Row[];
      const resumeIds = Array.from(new Set(list.map((e) => e.resume_id)));
      const userIds = Array.from(new Set(list.map((e) => e.user_id)));
      const [{ data: resumes }, { data: profiles }] = await Promise.all([
        resumeIds.length
          ? supabase.from("resumes").select("id, title, ats_score").in("id", resumeIds)
          : Promise.resolve({ data: [] as any[] }),
        userIds.length
          ? supabase.from("profiles").select("id, full_name").in("id", userIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);
      const rmap = new Map((resumes || []).map((r: any) => [r.id, r]));
      const pmap = new Map((profiles || []).map((p: any) => [p.id, p]));
      setRows(list.map((e) => ({ ...e, resume: rmap.get(e.resume_id), user: pmap.get(e.user_id) })));
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    let aiTotal = 0;
    rows.forEach((r) => { s[r.source] = (s[r.source] || 0) + 1; aiTotal += r.ai_assist_count; });
    return { bySource: s, aiTotal };
  }, [rows]);

  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const t = (r.user?.full_name || "") + " " + (r.resume?.title || "") + " " + r.source;
    return t.toLowerCase().includes(q.toLowerCase());
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Resume creation audit</h1>
            <p className="text-sm text-muted-foreground mt-1">How users created their resumes and how often AI was used.</p>
          </div>
          <a href="/admin/showcase" className="text-sm text-primary hover:underline">Showcase curation →</a>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {(["scratch","template","onboarding","cloned_showcase","imported"] as const).map((k) => (
            <div key={k} className="rounded-xl border bg-card p-4">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{SOURCE_LABEL[k]}</div>
              <div className="font-display text-2xl font-semibold mt-1">{stats.bySource[k] || 0}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> {stats.aiTotal} AI assists across {rows.length} resumes
        </div>

        <div className="mt-6 max-w-sm relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search user, title, source…" className="pl-9" />
        </div>

        <div className="mt-4 border rounded-2xl bg-card overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead className="text-right">AI assists</TableHead>
                  <TableHead className="text-right">ATS</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.user?.full_name || "—"}</TableCell>
                    <TableCell className="max-w-[260px] truncate">{r.resume?.title || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{SOURCE_LABEL[r.source] || r.source}</Badge></TableCell>
                    <TableCell className="capitalize text-xs text-muted-foreground">{r.template_slug || "—"}</TableCell>
                    <TableCell className="text-right font-medium">{r.ai_assist_count}</TableCell>
                    <TableCell className="text-right">{r.resume?.ats_score ?? "—"}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">No events yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}