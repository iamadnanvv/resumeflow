import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showcaseToTemplate, logResumeCreation } from "@/lib/resume-tracking";
import type { ResumeContent } from "@/lib/resume-types";
import { ArrowLeft, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ShowcaseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("id, showcase_title, showcase_industry, template_slug, ats_score, showcase_anonymized_content, content, showcase_status")
        .eq("id", id!)
        .eq("showcase_status", "approved")
        .maybeSingle();
      if (error || !data) { toast.error("Showcase not found"); navigate("/showcase"); return; }
      setRow(data);
      setLoading(false);
    })();
  }, [id, navigate]);

  const useAsTemplate = async () => {
    if (!user) { toast.error("Sign in to use this template"); navigate("/dashboard"); return; }
    setCloning(true);
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
        resumeId: data.id, userId: user.id, source: "cloned_showcase",
        templateSlug: row.template_slug, clonedFromResumeId: row.id,
      });
      toast.success("Template added to your dashboard");
      navigate(`/builder/${data.id}`);
    } catch (e: any) {
      toast.error(e.message || "Could not clone template");
    } finally { setCloning(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  const c = (row.showcase_anonymized_content || row.content) as ResumeContent;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="container py-10 flex-1">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2"><Link to="/showcase"><ArrowLeft className="h-4 w-4 mr-1" /> Back to showcase</Link></Button>
            <h1 className="font-display text-3xl font-semibold">{row.showcase_title || "Showcase resume"}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              {row.showcase_industry && <span>{row.showcase_industry}</span>}
              <Badge variant="outline" className="capitalize">{row.template_slug}</Badge>
              {row.ats_score != null && <span>ATS <span className="font-semibold text-primary">{row.ats_score}</span></span>}
            </div>
          </div>
          <Button onClick={useAsTemplate} disabled={cloning} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            {cloning ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
            Use as template
          </Button>
        </div>
        <div className="bg-muted/30 rounded-2xl p-6 flex justify-center overflow-auto">
          <div className="origin-top scale-[0.6] sm:scale-[0.75] lg:scale-[0.9]">
            <ResumePreview content={c} template={row.template_slug} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}