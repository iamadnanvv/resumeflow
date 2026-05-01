import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hmacSha256Hex(key: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    const SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!SECRET) throw new Error("Razorpay not configured");

    const expected = await hmacSha256Hex(SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
    if (expected !== razorpay_signature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Unauthorized");
    const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await supa.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: payment } = await admin.from("payments").select("*").eq("razorpay_order_id", razorpay_order_id).eq("user_id", user.id).maybeSingle();
    if (!payment) throw new Error("Payment record not found");

    await admin.from("payments").update({ razorpay_payment_id, razorpay_signature, status: "paid" }).eq("id", payment.id);
    await admin.from("profiles").update({ plan: payment.plan }).eq("id", user.id);

    const periodEnd = new Date(); periodEnd.setMonth(periodEnd.getMonth() + 1);
    await admin.from("subscriptions").insert({
      user_id: user.id, plan: payment.plan, status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
    });

    // Mark any reserved redemption for this order as consumed
    try {
      await admin.from("referral_discount_redemptions")
        .update({ status: "consumed", payment_id: payment.id })
        .eq("order_id", razorpay_order_id)
        .eq("referee_id", user.id)
        .eq("status", "reserved");
    } catch (e) {
      console.error("Failed to consume redemption:", e);
    }

    // Referral payout: if this user was referred and referral is pending, credit referrer ₹100
    try {
      const { data: ref } = await admin
        .from("referrals")
        .select("id, referrer_id, status")
        .eq("referee_id", user.id)
        .eq("status", "pending")
        .maybeSingle();
      if (ref) {
        // Final cross-account self-referral guard before paying out
        const { data: isSelf } = await admin.rpc("is_self_referral", {
          _referrer: ref.referrer_id, _referee: user.id,
        });
        if (isSelf === true) {
          await admin.from("referrals").update({ status: "blocked" }).eq("id", ref.id);
          throw new Error("self_referral_blocked");
        }
        const REWARD = 100; // INR
        await admin.from("referrals").update({
          status: "rewarded",
          reward_amount: REWARD,
          rewarded_at: new Date().toISOString(),
        }).eq("id", ref.id);

        // Upsert credits for referrer
        const { data: existing } = await admin
          .from("user_credits").select("balance,lifetime_earned").eq("user_id", ref.referrer_id).maybeSingle();
        if (existing) {
          await admin.from("user_credits").update({
            balance: (existing.balance ?? 0) + REWARD,
            lifetime_earned: (existing.lifetime_earned ?? 0) + REWARD,
          }).eq("user_id", ref.referrer_id);
        } else {
          await admin.from("user_credits").insert({
            user_id: ref.referrer_id, balance: REWARD, lifetime_earned: REWARD,
          });
        }
      }
    } catch (e) {
      console.error("Referral payout failed:", e);
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});