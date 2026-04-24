import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { z } from "zod";

// E.164-ish: + and 8-15 digits (allow leading + optional)
const phoneRegex = /^\+?[1-9]\d{7,14}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

const signupSchema = z.object({
  username: z.string().regex(usernameRegex, "3–20 chars, letters/numbers/underscore only"),
  phone: z.string().regex(phoneRegex, "Enter a valid phone (e.g. +14155551234)"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const loginSchema = z.object({
  identifier: z.string().min(3, "Enter your username or phone"),
  password: z.string().min(1, "Password required"),
});

const normalizePhone = (p: string) => (p.startsWith("+") ? p : `+${p.replace(/\D/g, "")}`);

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("mode") === "signup" ? "signup" : "signin");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => { if (user) navigate("/dashboard"); }, [user, navigate]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.safeParse({ username, phone, password });
        if (!parsed.success) {
          throw new Error(parsed.error.issues[0].message);
        }
        const normalizedPhone = normalizePhone(parsed.data.phone);

        // Check username uniqueness up front (DB also enforces it)
        const { data: existingPhone } = await supabase.rpc("get_phone_by_username", {
          _username: parsed.data.username,
        });
        if (existingPhone) throw new Error("That username is already taken");

        const { error } = await supabase.auth.signUp({
          phone: normalizedPhone,
          password: parsed.data.password,
          options: {
            data: {
              username: parsed.data.username,
              full_name: parsed.data.username,
              phone: normalizedPhone,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created! Signing you in…");
      } else {
        const parsed = loginSchema.safeParse({ identifier, password });
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);

        // If identifier looks like a phone, use it directly. Otherwise resolve username -> phone.
        let phoneToUse: string | null = null;
        const idTrim = parsed.data.identifier.trim();
        if (phoneRegex.test(idTrim) || phoneRegex.test(idTrim.replace(/\s/g, ""))) {
          phoneToUse = normalizePhone(idTrim.replace(/\s/g, ""));
        } else {
          const { data, error: rpcErr } = await supabase.rpc("get_phone_by_username", {
            _username: idTrim,
          });
          if (rpcErr) throw rpcErr;
          phoneToUse = data as string | null;
        }
        if (!phoneToUse) throw new Error("Invalid username or password");

        const { error } = await supabase.auth.signInWithPassword({
          phone: phoneToUse,
          password: parsed.data.password,
        });
        if (error) throw new Error("Invalid credentials");
        toast.success("Signed in");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="container py-6"><Logo /></div>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md glass rounded-2xl p-8 shadow-elegant">
          <h1 className="font-display text-2xl font-semibold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signup" ? "Build your first resume in 2 minutes." : "Sign in to continue."}
          </p>

          <form onSubmit={handle} className="space-y-4 mt-6">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourname"
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+14155551234"
                    autoComplete="tel"
                    required
                  />
                </div>
              </>
            )}
            {mode === "signin" && (
              <div>
                <Label htmlFor="identifier">Username or phone</Label>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="yourname or +14155551234"
                  autoComplete="username"
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "signup" ? 8 : 1}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <div className="mt-5 text-sm text-center text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-primary hover:underline">
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </div>
          <div className="mt-4 text-xs text-center text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}