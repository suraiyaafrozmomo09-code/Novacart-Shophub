"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock, Phone, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import GradientText from "@/components/core/gradient-text";
import { SmartImage } from "@/components/ui/smart-image";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: "customer",
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f1eb] px-4 py-6 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[2.7rem] border border-white/20 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex items-center justify-center bg-[#faf7f2] p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <Link href="/" className="inline-flex items-center gap-3 text-xl font-semibold text-slate-950">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">N</div>
                NovaCart
              </Link>
              <h1 className="mt-8 text-3xl font-semibold text-slate-950">Create your account</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Join the storefront to save favourites, place orders, and get a more seamless shopping experience.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-950 outline-none transition focus:border-slate-950/20 focus:ring-4 focus:ring-slate-950/5"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

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
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-950 outline-none transition focus:border-slate-950/20 focus:ring-4 focus:ring-slate-950/5"
                    placeholder="+880 1XXX-XXXXXX"
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-950 outline-none transition focus:border-slate-950/20 focus:ring-4 focus:ring-slate-950/5"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 font-semibold text-white transition hover:bg-slate-800",
                  loading && "cursor-not-allowed opacity-50"
                )}
              >
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-6 rounded-[1.8rem] border border-slate-200 bg-white p-4">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <Sparkles size={15} />
                Member benefits
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create an account to save your cart, receive product suggestions, and track every order from your profile.
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500 lg:text-left">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-slate-950 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(244,114,182,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.22),transparent_30%)]" />
          <div className="relative">
            <GradientText
              colors={["#ffffff", "#93c5fd", "#f9a8d4", "#ffffff"]}
              animationSpeed={4}
              className="text-sm font-semibold uppercase tracking-[0.32em]"
            >
              Create your membership
            </GradientText>
          </div>

          <div className="relative space-y-6">
            <h2 className="max-w-lg text-5xl font-semibold leading-tight">
              Create an account for faster, easier shopping.
            </h2>
            <p className="max-w-md text-base leading-7 text-white/72">
              Save your details, keep track of orders, and check out faster whenever you return.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                "/product-images/tshirt.jpg",
                "/product-images/perfume.jpg",
                "/product-images/watch.jpg",
                "/product-images/headphones.jpg",
              ].map((image) => (
                <div key={image} className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.08] p-2 backdrop-blur-xl">
                  <SmartImage
                    src={image}
                    alt=""
                    fallbackPrompt="premium ecommerce product image"
                    imageSize="square"
                    className="aspect-square w-full rounded-[1.3rem] object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-[1.8rem] border border-white/10 bg-white/[0.08] p-5 text-sm leading-6 text-white/72 backdrop-blur-xl">
            Sign up once to keep your order history, saved details, and shopping preferences in one place.
          </div>
        </div>
      </div>
    </div>
  );
}
