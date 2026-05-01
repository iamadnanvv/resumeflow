import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showcaseToTemplate, logResumeCreation } from "@/lib/resume-tracking";
import type { ResumeContent } from "@/lib/resume-types";
import { Sparkles, Copy, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Seo } from "@/components/Seo";

type ShowcaseRow = {
  id: string;
  showcase_title: string | null;
  showcase_industry: string | null;
  template_slug: string;
  ats_score: number | null;
  showcase_anonymized_content: ResumeContent | null;
  content: ResumeContent;
};

export default function Showcase() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ShowcaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cloning, setCloning] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("id, showcase_title, showcase_industry, template_slug, ats_score, showcase_anonymized_content, content")
        .eq("showcase_status", "approved")
        .order("showcase_reviewed_at", { ascending: false })
        .limit(60);
      if (error) toast.error("Could not load showcase");
      setItems((data || []) as any);
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter((it) => {
    if (!q.trim()) return true;
    const t = (it.showcase_title || "") + " " + (it.showcase_industry || "");
    return t.toLowerCase().includes(q.toLowerCase());
  });

  const useAsTemplate = async (row: ShowcaseRow) => {
    if (!user) { toast.error("Sign in to use this template"); navigate("/dashboard"); return; }
    setCloning(row.id);
    try {
      const source = (row.showcase_anonymized_content || row.content) as ResumeContent;
      const seed = showcaseToTemplate(source);
      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: `${row.showcase_title || "Inspired"} — my version`,
          template_slug: row.template_slug,
          content: seed as any,
        })
        .select()
        .single();
      if (error) throw error;
      await logResumeCreation({
        resumeId: data.id,
        userId: user.id,
        source: "cloned_showcase",
        templateSlug: row.template_slug,
        clonedFromResumeId: row.id,
      });
      toast.success("Template added to your dashboard");
      navigate(`/builder/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Could not clone template");
    } finally {
      setCloning(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Resume Showcase — get inspired by real, anonymized resumes"
        description="Browse anonymized resumes curated by our team. Use any as a structural template for your own."
        path="/showcase"
      />
      <SiteHeader />
      <main className="container py-12 flex-1">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-3"><Sparkles className="h-3 w-3 mr-1 text-primary" /> Resume Copycat</Badge>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Resume Showcase</h1>
          <p className="text-muted-foreground mt-2">
            Real resumes, anonymized and curated. Click <strong>Use as template</strong> to start a new resume with the same
            structure — your content stays yours.
          </p>
        </div>

        <div className="mt-8 max-w-md relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by role or industry…" className="pl-9" />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p>No showcased resumes yet. Be the first — submit yours from the builder.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((it) => {
              const c = (it.showcase_anonymized_content || it.content) as ResumeContent;
              return (
                <article key={it.id} className="rounded-2xl bg-gradient-card border overflow-hidden flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="outline" className="text-xs capitalize">{it.template_slug}</Badge>
                      {it.ats_score != null && (
                        <span className="text-xs text-muted-foreground">ATS <span className="font-semibold text-primary">{it.ats_score}</span></span>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-semibold leading-tight">{it.showcase_title || c.personal.title || "Untitled"}</h3>
                    {it.showcase_industry && <div className="text-xs text-muted-foreground mt-0.5">{it.showcase_industry}</div>}
                    {c.personal.summary && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-4">{c.personal.summary}</p>
                    )}
                    {c.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {c.skills.slice(0, 6).map((s) => (
                          <span key={s} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-t p-3 flex gap-2">
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                      <Link to={`/showcase/${it.id}`}>Preview</Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => useAsTemplate(it)}
                      disabled={cloning === it.id}
                      className="flex-1 bg-gradient-primary text-primary-foreground hover:opacity-90"
                    >
                      {cloning === it.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
                      <span className="ml-1.5">Use as template</span>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}