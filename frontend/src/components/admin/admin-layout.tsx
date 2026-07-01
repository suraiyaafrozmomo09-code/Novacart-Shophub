"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Package, Users, ShoppingBag, Tag, BarChart3,
  LogOut, Bell, Search, Menu, X
} from "lucide-react";
import { useAuth } from "@/components/layout/supabase-provider";
import { cn } from "@/lib/utils";

const adminNav = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user && user.role !== "admin") {
      router.push("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0614] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-fuchsia-400 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0614] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-white">Please sign in to continue</p>
          <p className="mt-2 text-white/55">Admin pages require an authenticated account.</p>
          <Link href="/login" className="mt-4 inline-block text-fuchsia-300">Go to Sign In</Link>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0b0614] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-white">Access Denied</p>
          <p className="mt-2 text-white/55">You need admin privileges to access this page.</p>
          <Link href="/login" className="mt-4 inline-block text-fuchsia-300">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#0b0614_0%,_#12081f_18%,_#171024_100%)] text-white">
      <div className="flex">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-[linear-gradient(180deg,_#130a1f,_#1a1029)] text-white transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-white/8",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-16 items-center gap-2 border-b border-white/8 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950">
              <span className="font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-lg">NovaCart Admin</span>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto">
              <X size={20} />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {adminNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/72 hover:bg-white/[0.06] hover:text-white transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/8 p-4">
            <Link href="/" className="mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-white/72 transition-colors hover:bg-white/[0.06] hover:text-white">
              <ShoppingBag size={20} />
              View Store
            </Link>
            <button onClick={signOut} className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-rose-300 transition-colors hover:bg-rose-500/10">
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-h-screen">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/8 bg-[#130a1f]/82 px-4 backdrop-blur-xl lg:px-8">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06]">
              <Menu size={20} />
            </button>
            <div className="flex-1 max-w-md mx-4 hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-lg border border-white/10 bg-white/[0.05] py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative rounded-lg p-2 hover:bg-white/[0.06]">
                <Bell size={20} className="text-white/70" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950">
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>
          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
