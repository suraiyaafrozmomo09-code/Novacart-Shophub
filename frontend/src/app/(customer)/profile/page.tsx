"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Package, MapPin, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/layout/supabase-provider";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (user?.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [authLoading, router, user]);

const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from("users").update({ full_name: fullName, phone }).eq("id", user.id);
    setSaving(false);
    alert("Profile updated successfully");
  };

  if (authLoading || user?.role === "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-slate-900">Please login to view profile</p>
          <Link href="/login" className="text-orange-600 mt-2 inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  const resolvedFullName = fullName ?? user.full_name ?? "";
  const resolvedPhone = phone ?? user.phone ?? "";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-1">Manage your account settings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-24">
              <nav className="space-y-1">
                {[
                  { name: "Profile", href: "/profile", icon: User },
                  { name: "My Orders", href: "/orders", icon: Package },
                  { name: "Addresses", href: "#", icon: MapPin },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium"
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {(resolvedFullName.charAt(0) || user.email.charAt(0)).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{resolvedFullName || "Your Profile"}</h2>
                  <p className="text-slate-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={resolvedFullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={resolvedPhone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-600/20",
                    saving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
