import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
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
    const code = String(body.code || "").trim();
    if (!email || !/^\d{6}$/.test(code)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: row } = await admin
      .from("student_verifications")
      .select("*")
      .eq("user_id", user.id)
      .ilike("email", email)
      .maybeSingle();

    if (!row) {
      return new Response(JSON.stringify({ error: "No verification found. Request a new code." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (row.verified) {
      return new Response(JSON.stringify({ ok: true, alreadyVerified: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!row.expires_at || new Date(row.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Code expired. Request a new one." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if ((row.attempts ?? 0) >= 5) {
      return new Response(JSON.stringify({ error: "Too many wrong attempts. Request a new code." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const codeHash = await sha256Hex(code);
    if (codeHash !== row.code_hash) {
      await admin.from("student_verifications")
        .update({ attempts: (row.attempts ?? 0) + 1 })
        .eq("id", row.id);
      return new Response(JSON.stringify({ error: "Incorrect code" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("student_verifications").update({
      verified: true,
      verified_at: new Date().toISOString(),
      code_hash: null,
      expires_at: null,
    }).eq("id", row.id);

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