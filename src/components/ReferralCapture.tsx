import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "rl_referral_code";

/**
 * Captures `?ref=CODE` from the URL into localStorage on first load,
 * then redeems it via the `referral-claim` edge function once a user is signed in.
 * Idempotent: backend rejects duplicate or post-paid claims.
 */
export function ReferralCapture() {
  const { user } = useAuth();
  const claimed = useRef(false);

  // 1. Capture ?ref= on first mount and strip from URL
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("ref");
      if (code && /^[A-Za-z0-9]{6,16}$/.test(code)) {
        localStorage.setItem(STORAGE_KEY, code.toUpperCase());
        url.searchParams.delete("ref");
        window.history.replaceState({}, "", url.toString());
      }
    } catch {}
  }, []);

  // 2. Redeem once we have a real (non-anonymous) user with email
  useEffect(() => {
    if (!user || claimed.current) return;
    const code = localStorage.getItem(STORAGE_KEY);
    if (!code) return;
    // Skip anonymous sessions — wait until the user properly signs up
    if ((user as any).is_anonymous) return;
    claimed.current = true;
    supabase.functions
      .invoke("referral-claim", { body: { code } })
      .then(({ data, error }) => {
        if (!error && !data?.error) {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => { claimed.current = false; });
  }, [user]);

  return null;
}