"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import GradientText from "@/components/core/gradient-text";
import { SmartImage } from "@/components/ui/smart-image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      const authUser = data.user;
      
      // First check user_metadata for role (set during signup)
      const metaRole = authUser?.user_metadata?.role;
      let role = metaRole === "admin" ? "admin" : "customer";
      let profileExists = false;

      // Try to get role from users table
      if (authUser) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", authUser.id)
          .maybeSingle();

        if (profile?.role === "admin") {
          role = "admin";
          profileExists = true;
        } else if (profile) {
          profileExists = true;
        }

        // If profile doesn't exist, create it (fallback for users without trigger)
        if (!profileExists) {
          await supabase.from("users").insert({
            id: authUser.id,
            email: authUser.email || "",
            full_name: authUser.user_metadata?.full_name || "",
            phone: authUser.user_metadata?.phone || "",
            role: metaRole || "customer",
          });
        }
      }

      router.push(role === "admin" ? "/admin/dashboard" : "/profile");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f1eb] px-4 py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2.7rem] border border-white/20 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.22),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.2),transparent_30%)]" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3 text-xl font-semibold">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">N</div>
              NovaCart
            </Link>
          </div>

          <div className="relative space-y-6">
            <GradientText
              colors={["#ffffff", "#c4b5fd", "#f9a8d4", "#ffffff"]}
              animationSpeed={4}
              className="text-sm font-semibold uppercase tracking-[0.32em]"
            >
              Member access
            </GradientText>
            <div className="space-y-4">
              <h1 className="max-w-lg text-5xl font-semibold leading-tight">
                Sign in and step back into your curated storefront.
              </h1>
              <p className="max-w-md text-base leading-7 text-white/70">
                Save favourites, track orders, manage your cart, and keep shopping with a faster premium flow.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Persistent cart and order history",
                "Admin dashboard access",
                "Faster checkout for returning users",
                "Easy account access",
              ].map((item) => (
                <div key={item} className="rounded-[1.6rem] border border-white/10 bg-white/[0.08] p-4 text-sm text-white/80">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] p-3 backdrop-blur-xl">
            <SmartImage
              src="/product-images/hero-editorial.jpg"
              alt="Editorial retail"
              fallbackPrompt="premium fashion editorial campaign image"
              imageSize="portrait_3_4"
              className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
            />
          </div>
        </div>

        <div className="flex items-center justify-center bg-[#faf7f2] p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <Link href="/" className="inline-flex items-center gap-3 text-xl font-semibold text-slate-950">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">N</div>
                NovaCart
              </Link>
              <h2 className="mt-8 text-3xl font-semibold text-slate-950">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Enter your details to continue shopping, manage orders, and access your account.</p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-950 outline-none transition focus:border-slate-950/20 focus:ring-4 focus:ring-slate-950/5"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 pr-12 text-slate-950 outline-none transition focus:border-slate-950/20 focus:ring-4 focus:ring-slate-950/5"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-slate-500 shadow-sm">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  Secure access
                </div>
                <Link href="/register" className="font-medium text-slate-950 hover:underline">
                  Need an account?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 font-semibold text-white transition hover:bg-slate-800",
                  loading && "cursor-not-allowed opacity-50"
                )}
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-4">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <Sparkles size={15} />
                Quick access
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Customer accounts open the cart, checkout, and order history flow. Admin accounts go straight to the dashboard after login.
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 lg:text-left">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-slate-950 hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
