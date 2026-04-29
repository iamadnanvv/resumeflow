import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_PRICES: Record<string, number> = {
  pro: 49900,
  premium: 99900,
  student_basic: 19900,
  student_premium: 29900,
  student_pro: 39900,
}; // paise

const STUDENT_PLANS = new Set(["student_basic", "student_premium", "student_pro"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { plan } = await req.json();
    if (!PLAN_PRICES[plan]) throw new Error("Invalid plan");

    const KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!KEY_ID || !KEY_SECRET) {
      return new Response(JSON.stringify({ error: "Razorpay not configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Auth
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Unauthorized");
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: { user } } = await supa.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Server-side gate: student plans require a verified student record
    if (STUDENT_PLANS.has(plan)) {
      const admin0 = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { data: verified } = await admin0
        .from("student_verifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("verified", true)
        .limit(1)
        .maybeSingle();
      if (!verified) {
        return new Response(JSON.stringify({
          error: "Student verification required. Verify your campus email to access student pricing.",
          code: "student_verification_required",
        }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const amount = PLAN_PRICES[plan];
    const orderResp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${KEY_ID}:${KEY_SECRET}`),
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `rlite_${plan}_${Date.now()}`,
        notes: {
          user_id: user.id,
          plan,
          brand: "resumelylite",
          product: `resumelylite ${plan.toUpperCase()} plan`,
        },
      }),
    });
    if (!orderResp.ok) throw new Error(`Razorpay: ${await orderResp.text()}`);
    const order = await orderResp.json();

    // Use service role to insert (bypasses RLS but we still scope to user)
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await admin.from("payments").insert({
      user_id: user.id, razorpay_order_id: order.id, amount, currency: "INR", plan, status: "created",
    });

    return new Response(JSON.stringify({
      order_id: order.id, amount, currency: "INR", key_id: KEY_ID,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});