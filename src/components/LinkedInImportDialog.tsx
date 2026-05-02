import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { ResumeContent } from "@/lib/resume-types";
import { Loader2, Linkedin, Upload } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: (resume: ResumeContent) => void;
};

async function readPdfText(file: File): Promise<string> {
  // @ts-ignore - dynamic import; pdfjs-dist ships with the project via jspdf already? fallback: text only.
  const buf = await file.arrayBuffer();
  // Quick lightweight extraction via pdfjs (worker disabled)
  const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs").catch(() => null);
  if (!pdfjs) throw new Error("PDF parser not available — please paste text instead.");
  pdfjs.GlobalWorkerOptions.workerSrc = "";
  const doc = await pdfjs.getDocument({ data: buf, disableWorker: true }).promise;
  let out = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    out += content.items.map((it: any) => it.str).join(" ") + "\n\n";
  }
  return out;
}

export function LinkedInImportDialog({ open, onOpenChange, onImport }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("PDF too large (max 5MB)");
    setLoading(true);
    try {
      if (f.type === "application/json" || f.name.endsWith(".json")) {
        const t = await f.text();
        setText(t);
      } else if (f.type === "application/pdf" || f.name.endsWith(".pdf")) {
        const t = await readPdfText(f);
        setText(t);
      } else {
        const t = await f.text();
        setText(t);
      }
      toast.success("File loaded — review and import");
    } catch (err: any) {
      toast.error(err.message || "Could not read file");
    } finally { setLoading(false); }
  };

  const submit = async () => {
    if (text.trim().length < 50) return toast.error("Need more text to parse");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("linkedin-import", { body: { text } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.resume) throw new Error("No resume returned");
      onImport(data.resume as ResumeContent);
      toast.success("LinkedIn profile imported");
      onOpenChange(false);
      setText("");
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-2 w-fit">
            <Linkedin className="h-3 w-3" /> LinkedIn import
          </div>
          <DialogTitle>Import from LinkedIn</DialogTitle>
          <DialogDescription>
            On LinkedIn → <strong>Me → Save to PDF</strong> (or Settings → Get a copy of your data → JSON).
            Upload it below and we'll fill your resume.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="li-file">Profile PDF or JSON</Label>
            <div className="mt-1 flex items-center gap-2">
              <input id="li-file" type="file" accept=".pdf,.json,application/pdf,application/json" onChange={onFile}
                className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:text-xs file:font-medium" />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div>
            <Label htmlFor="li-text">Or paste extracted text</Label>
            <Textarea id="li-text" rows={8} value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Paste your LinkedIn profile text here…" className="mt-1 text-xs" />
          </div>
          <p className="text-xs text-muted-foreground">
            Your file is parsed locally; only extracted text is sent to AI for structuring. Existing resume content will be replaced.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={loading || text.trim().length < 50}
            className="bg-gradient-primary text-primary-foreground hover:opacity-90">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}