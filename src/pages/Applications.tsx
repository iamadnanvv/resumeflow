import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Briefcase, ExternalLink, Edit3, Trash2, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";
import { ApplicationDialog, type AppStatus, type ApplicationRow } from "@/components/ApplicationDialog";
import { Link } from "react-router-dom";

const STATUSES: { key: AppStatus; label: string; tone: string }[] = [
  { key: "saved", label: "Saved", tone: "bg-muted text-muted-foreground" },
  { key: "applied", label: "Applied", tone: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { key: "interview", label: "Interview", tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { key: "offer", label: "Offer", tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { key: "rejected", label: "Rejected", tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
];

export default function Applications() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ApplicationRow | null>(null);
  const [resumeFilter, setResumeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | AppStatus>("all");

  const load = async () => {
    if (!user) return;
    const [{ data: a }, { data: r }] = await Promise.all([
      supabase.from("applications").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("resumes").select("id,title").eq("user_id", user.id),
    ]);
    setRows(a || []);
    setResumes(r || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (resumeFilter !== "all" && r.resume_id !== resumeFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [rows, resumeFilter, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<AppStatus, number> = { saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0 };
    filtered.forEach((r) => { c[r.status as AppStatus] = (c[r.status as AppStatus] || 0) + 1; });
    return c;
  }, [filtered]);

  const updateStatus = async (id: string, status: AppStatus) => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const del = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Deleted");
  };

  const resumeTitle = (id: string | null) => resumes.find((r) => r.id === id)?.title || null;

  const groups = useMemo(() => {
    const g: Record<AppStatus, any[]> = { saved: [], applied: [], interview: [], offer: [], rejected: [] };
    filtered.forEach((r) => g[r.status as AppStatus]?.push(r));
    return g;
  }, [filtered]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Briefcase className="h-7 w-7 text-primary" /> Application Tracker
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track every job you apply to, link the resume you used, and never miss a follow-up.
            </p>
          </div>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="bg-gradient-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-1.5" /> New application
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Resume:</span>
            <Select value={resumeFilter} onValueChange={setResumeFilter}>
              <SelectTrigger className="h-9 w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All resumes</SelectItem>
                {resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <div className="font-medium">No applications yet</div>
            <p className="text-sm text-muted-foreground mt-1">Add the jobs you're interested in to keep them all in one place.</p>
            <Button onClick={() => { setEditing(null); setOpen(true); }} className="mt-4" size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add your first
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {STATUSES.map((s) => (
              <div key={s.key} className="rounded-2xl border bg-card/50 p-3 min-h-[200px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${s.tone}`}>
                    {s.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{counts[s.key] || 0}</span>
                </div>
                <div className="space-y-2">
                  {groups[s.key].map((r) => (
                    <div key={r.id} className="rounded-lg border bg-background p-3 hover:shadow-sm transition group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">{r.company}</div>
                          {r.role && <div className="text-xs text-muted-foreground truncate">{r.role}</div>}
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(r); setOpen(true); }}>
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del(r.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                        {r.next_step_at && (
                          <Badge variant="outline" className="font-normal gap-1">
                            <Calendar className="h-3 w-3" /> {new Date(r.next_step_at).toLocaleDateString()}
                          </Badge>
                        )}
                        {r.resume_id && resumeTitle(r.resume_id) && (
                          <Link to={`/builder/${r.resume_id}`}>
                            <Badge variant="outline" className="font-normal gap-1 hover:bg-muted">
                              <FileText className="h-3 w-3" /> {resumeTitle(r.resume_id)}
                            </Badge>
                          </Link>
                        )}
                        {r.job_url && (
                          <a href={r.job_url} target="_blank" rel="noreferrer">
                            <Badge variant="outline" className="font-normal gap-1 hover:bg-muted">
                              <ExternalLink className="h-3 w-3" /> JD
                            </Badge>
                          </a>
                        )}
                      </div>
                      <div className="mt-2">
                        <Select value={r.status} onValueChange={(v: AppStatus) => updateStatus(r.id, v)}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ApplicationDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSaved={load}
      />
    </div>
  );
}
