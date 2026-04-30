import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { code } = await req.json();
    const cleaned = String(code || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{6,16}$/.test(cleaned)) {
      return new Response(JSON.stringify({ error: "Invalid referral code" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Find referrer
    const { data: refProfile } = await admin
      .from("profiles").select("id").eq("referral_code", cleaned).maybeSingle();
    if (!refProfile) {
      return new Response(JSON.stringify({ error: "Referral code not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (refProfile.id === user.id) {
      return new Response(JSON.stringify({ error: "You can't refer yourself" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Eligibility: user must have NO prior paid payments (referee discount is for first plan)
    const { data: priorPaid } = await admin
      .from("payments").select("id").eq("user_id", user.id).eq("status", "paid").limit(1).maybeSingle();
    if (priorPaid) {
      return new Response(JSON.stringify({ error: "Referrals only apply before your first paid plan" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check existing referral
    const { data: existing } = await admin
      .from("referrals").select("id").eq("referee_id", user.id).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ ok: true, alreadyClaimed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: insErr } = await admin.from("referrals").insert({
      referrer_id: refProfile.id,
      referee_id: user.id,
      code: cleaned,
      status: "pending",
    });
    if (insErr) throw insErr;

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