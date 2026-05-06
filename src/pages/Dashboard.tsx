import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, FileText, Mail, Trash2, Edit3, Sparkles, Briefcase } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { emptyResume, type ResumeContent } from "@/lib/resume-types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { logResumeCreation } from "@/lib/resume-tracking";
import { getRolePreset } from "@/lib/role-presets";
import { AiAssistantDialog } from "@/components/AiAssistantDialog";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const seededRef = useRef(false);

  const load = async () => {
    if (!user) return;
    const [{ data: r }, { data: l }] = await Promise.all([
      supabase.from("resumes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("cover_letters").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
    ]);
    setResumes(r || []);
    setLetters(l || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  // Auto-create a role-seeded resume when arriving via /dashboard?role=<slug>
  useEffect(() => {
    const roleSlug = searchParams.get("role");
    if (!roleSlug || !user || loading || seededRef.current) return;
    const preset = getRolePreset(roleSlug);
    if (!preset) return;
    seededRef.current = true;
    (async () => {
      const limit = profile?.plan === "free" ? 1 : profile?.plan === "pro" ? 10 : 999;
      if (resumes.length >= limit) {
        toast.error(`Your ${profile?.plan} plan allows ${limit} resume${limit > 1 ? "s" : ""}. Upgrade for more.`);
        setSearchParams({}, { replace: true });
        navigate("/pricing");
        return;
      }
      const seeded: ResumeContent = {
        ...emptyResume,
        personal: { ...emptyResume.personal, title: preset.title, summary: preset.summary },
        skills: preset.skills,
      };
      const { data, error } = await supabase
        .from("resumes")
        .insert({ user_id: user.id, title: `${preset.label} Resume`, content: seeded as any })
        .select()
        .single();
      if (error) { toast.error(error.message); return; }
      await logResumeCreation({ resumeId: data.id, userId: user.id, source: "scratch", templateSlug: "minimal" });
      toast.success(`Started a ${preset.label} resume — keyword tips loaded.`);
      navigate(`/builder/${data.id}?role=${preset.slug}`, { replace: true });
    })();
  }, [searchParams, user, loading, resumes.length, profile?.plan, navigate, setSearchParams]);

  const createResume = async () => {
    if (!user) return;
    const limit = profile?.plan === "free" ? 1 : profile?.plan === "pro" ? 10 : 999;
    if (resumes.length >= limit) {
      toast.error(`Your ${profile?.plan} plan allows ${limit} resume${limit > 1 ? "s" : ""}. Upgrade for more.`);
      navigate("/pricing");
      return;
    }
    const { data, error } = await supabase
      .from("resumes")
      .insert({ user_id: user.id, title: "Untitled Resume", content: emptyResume as any })
      .select()
      .single();
    if (error) return toast.error(error.message);
    await logResumeCreation({ resumeId: data.id, userId: user.id, source: "scratch", templateSlug: "minimal" });
    navigate(`/builder/${data.id}`);
  };

  const createLetter = async () => {
    if (!user) return;
    if (profile?.plan === "free" && letters.length >= 1) {
      toast.error("Cover letters require Pro plan.");
      navigate("/pricing");
      return;
    }
    const { data, error } = await supabase
      .from("cover_letters")
      .insert({ user_id: user.id, title: "Untitled Cover Letter" })
      .select()
      .single();
    if (error) return toast.error(error.message);
    navigate(`/cover-letter/${data.id}`);
  };

  const del = async (table: "resumes" | "cover_letters", id: string) => {
    if (!confirm("Delete this?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your resumes and cover letters.</p>
          </div>
          <Link to="/pricing">
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {profile?.plan === "free" ? "Upgrade" : profile?.plan?.toUpperCase()}
            </Button>
          </Link>
        </div>

        <Link
          to="/applications"
          className="mb-6 block rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 hover:border-primary/40 transition group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/15 p-2.5"><Briefcase className="h-5 w-5 text-primary" /></div>
              <div>
                <div className="font-display text-lg font-semibold">Application Tracker</div>
                <p className="text-sm text-muted-foreground">Track every job, link the resume you sent, and stay on top of follow-ups.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex group-hover:bg-primary group-hover:text-primary-foreground transition">Open tracker</Button>
          </div>
        </Link>

        <Tabs defaultValue="resumes" className="w-full">
          <TabsList>
            <TabsTrigger value="resumes"><FileText className="h-4 w-4 mr-1.5" /> Resumes ({resumes.length})</TabsTrigger>
            <TabsTrigger value="letters"><Mail className="h-4 w-4 mr-1.5" /> Cover Letters ({letters.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="resumes" className="mt-6">
            <div className="mb-4 rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-display text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Describe it. We'll build it.
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">Type your background — AI generates a complete, ATS-friendly resume in seconds.</p>
              </div>
              <AiAssistantDialog />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button onClick={createResume} className="aspect-[3/4] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group">
                <div className="bg-primary/10 group-hover:bg-primary/20 transition rounded-full p-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium">New resume</span>
              </button>
              {loading ? null : resumes.map((r) => (
                <div key={r.id} className="aspect-[3/4] rounded-2xl bg-gradient-card border overflow-hidden flex flex-col group">
                  <Link to={`/builder/${r.id}`} className="flex-1 p-6 flex flex-col">
                    <FileText className="h-5 w-5 text-primary mb-3" />
                    <div className="font-medium truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 capitalize">{r.template_slug} template</div>
                    {r.ats_score != null && (
                      <div className="mt-auto">
                        <div className="text-xs text-muted-foreground">ATS Score</div>
                        <div className="text-2xl font-display font-semibold text-primary">{r.ats_score}</div>
                      </div>
                    )}
                  </Link>
                  <div className="border-t p-2 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground px-2">{new Date(r.updated_at).toLocaleDateString()}</span>
                    <div className="flex gap-0.5">
                      <Button size="icon" variant="ghost" asChild><Link to={`/builder/${r.id}`}><Edit3 className="h-3.5 w-3.5" /></Link></Button>
                      <Button size="icon" variant="ghost" onClick={() => del("resumes", r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="letters" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button onClick={createLetter} className="aspect-[3/4] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group">
                <div className="bg-primary/10 group-hover:bg-primary/20 transition rounded-full p-4">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium">New cover letter</span>
              </button>
              {letters.map((l) => (
                <div key={l.id} className="aspect-[3/4] rounded-2xl bg-gradient-card border overflow-hidden flex flex-col">
                  <Link to={`/cover-letter/${l.id}`} className="flex-1 p-6">
                    <Mail className="h-5 w-5 text-primary mb-3" />
                    <div className="font-medium truncate">{l.title}</div>
                    {l.company && <div className="text-xs text-muted-foreground mt-1">{l.company}</div>}
                  </Link>
                  <div className="border-t p-2 flex justify-between items-center text-xs">
                    <span className="text-muted-foreground px-2">{new Date(l.updated_at).toLocaleDateString()}</span>
                    <Button size="icon" variant="ghost" onClick={() => del("cover_letters", l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}