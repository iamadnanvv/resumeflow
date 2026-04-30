import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Allowed campus email domains (.edu globally + common Indian academic TLDs).
const ALLOWED_PATTERNS = [
  /\.edu$/i,
  /\.edu\.[a-z]{2,}$/i,        // .edu.in, .edu.au, etc.
  /\.ac\.[a-z]{2,}$/i,          // .ac.in, .ac.uk
  /\.ac$/i,
  /\.[a-z]+\.ac\.[a-z]{2,}$/i,  // sub.ac.in
];

function isCampusEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  // Accept anything ending in an academic TLD/SLD or having one as a label.
  // Examples: mit.edu, iitb.ac.in, ox.ac.uk, abc.sch.uk, st-marys.sch.ac.uk,
  // cs.stanford.edu, math.dept.iitd.ac.in, school.k12.ca.us
  const ACADEMIC_TLDS = [
    /(^|\.)edu(\.[a-z]{2,})?$/i,   // .edu, .edu.in, .edu.au
    /(^|\.)ac(\.[a-z]{2,})?$/i,    // .ac, .ac.in, .ac.uk
    /(^|\.)sch(\.[a-z]{2,})?$/i,   // .sch.uk, .sch.ac.uk school subdomains
    /(^|\.)k12\.[a-z]{2}\.us$/i,   // US K-12 districts
    /(^|\.)edu\.[a-z]{2}$/i,       // explicit edu.<cc>
  ];
  return ACADEMIC_TLDS.some((re) => re.test(domain));
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return n.toString().padStart(6, "0");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Unauthorized");
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await supa.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const kind = (String(body.kind || "student").toLowerCase() === "teacher") ? "teacher" : "student";
    if (!isCampusEmail(email)) {
      return new Response(JSON.stringify({
        error: "Email must be a campus address (.edu, .edu.in, .ac.in, .ac.uk, .sch.uk, etc.)",
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const RESEND = Deno.env.get("RESEND_API_KEY");
    if (!RESEND) throw new Error("Email provider not configured");

    const code = generateCode();
    const codeHash = await sha256Hex(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Rate limit: max 5 requests per email per hour
    const sinceIso = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("student_verifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .ilike("email", email)
      .gte("updated_at", sinceIso);
    if ((count ?? 0) > 5) {
      return new Response(JSON.stringify({ error: "Too many attempts. Try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert verification row (one per user+email)
    const { error: upErr } = await admin.from("student_verifications").upsert({
      user_id: user.id,
      email,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
      verified: false,
      kind,
    }, { onConflict: "user_id,email" });
    if (upErr) throw upErr;

    // Send email via Resend
    const emailResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND}`,
      },
      body: JSON.stringify({
        from: "resumelylite <onboarding@resend.dev>",
        to: [email],
        subject: `${code} — Verify your ${kind} email · resumelylite`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0f172a">
          <h2 style="margin:0 0 16px">Verify your ${kind} email</h2>
          <p>Use this code in resumelylite to unlock ${kind} pricing:</p>
          <div style="font-size:32px;font-weight:700;letter-spacing:6px;background:#ecfdf5;color:#047857;padding:16px;text-align:center;border-radius:12px;margin:16px 0">${code}</div>
          <p style="color:#64748b;font-size:13px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>`,
      }),
    });
    if (!emailResp.ok) {
      console.error("Resend error:", await emailResp.text());
      throw new Error("Failed to send verification email");
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});