"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, X, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/layout/supabase-provider";
import { supabase } from "@/lib/supabase";
import {
  buildSearchSuggestions,
  FREE_SHIPPING_THRESHOLD_USD,
  formatCurrency,
  type ProductWithRelations,
} from "@/lib/storefront";

const categories = [
  { name: "Baby Clothes", slug: "baby-clothes" },
  { name: "Men's Clothing", slug: "mens-clothing" },
  { name: "Women's Clothing", slug: "womens-clothing" },
  { name: "Men's Shoes", slug: "mens-shoes" },
  { name: "Women's Shoes", slug: "womens-shoes" },
  { name: "Accessories", slug: "accessories" },
  { name: "Electronics", slug: "electronics" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState<ProductWithRelations[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const { user, signOut } = useAuth();

  useEffect(() => {
    void supabase
      .from("products")
      .select("*, category:categories(*), variants:product_variants(*)")
      .eq("status", "active")
      .then(({ data }) => setCatalog((data || []) as ProductWithRelations[]));
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadCartCount = async () => {
      const { data } = await supabase
        .from("cart")
        .select("quantity")
        .eq("user_id", user.id);

      setCartCount((data || []).reduce((sum, item) => sum + item.quantity, 0));
    };

    void loadCartCount();

    const channel = supabase
      .channel("header-cart-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "cart", filter: `user_id=eq.${user.id}` }, () => {
        void loadCartCount();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  const suggestions = useMemo(
    () => buildSearchSuggestions(query, catalog, 6),
    [catalog, query]
  );
  const displayedCartCount = user ? cartCount : 0;

  const submitSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    router.push(`/products?query=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#130a1f]/86 text-white shadow-[0_20px_60px_rgba(5,2,12,0.35)] backdrop-blur-2xl">
      <div className="border-b border-white/8 bg-white/[0.03]">
        <div className="container mx-auto flex items-center justify-between px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/55">
          <span>New season arrivals</span>
          <div className="hidden items-center gap-3 md:flex">
            <span>Free shipping over {formatCurrency(FREE_SHIPPING_THRESHOLD_USD)}</span>
            <ChevronRight size={12} />
            <span>Fast checkout</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-4 py-4 lg:flex-nowrap lg:gap-6">
          <button
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-2 text-white transition hover:bg-white/[0.1] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="min-w-fit flex items-center gap-3 text-2xl font-semibold tracking-[-0.04em]">
            <span className="hidden sm:block text-white">NovaCart</span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 text-sm lg:flex">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="rounded-full px-3 py-2 text-white/72 transition hover:bg-white/[0.08] hover:text-white"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="relative min-w-[260px] flex-1 lg:max-w-[360px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" size={18} />
              <input
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    submitSearch();
                  }
                }}
                placeholder="Search products, brands, or styles"
                className="w-full rounded-full border border-white/10 bg-white/[0.06] py-3 pl-11 pr-24 text-sm text-white placeholder:text-white/35 focus:border-white/18 focus:outline-none focus:ring-4 focus:ring-white/8"
              />
              <button
                type="button"
                onClick={submitSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
              >
                Search
              </button>
            </div>

            {searchOpen && query.trim() && (
              <div className="absolute inset-x-0 top-[calc(100%+0.75rem)] rounded-[1.8rem] border border-white/10 bg-[#1a1029]/96 p-3 shadow-[0_30px_80px_rgba(4,2,10,0.45)] backdrop-blur-2xl">
                {suggestions.length > 0 ? (
                  <div className="space-y-1">
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          router.push(`/products/${product.id}`);
                          setSearchOpen(false);
                          setQuery(product.name);
                        }}
                        className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/[0.05]"
                      >
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-xs text-white/45">
                            {product.category?.name || product.sub_type || product.product_type}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {formatCurrency(product.variants?.[0]?.price || 0)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/[0.04] px-4 py-5 text-sm text-white/55">
                    No matching products yet. Try a broader keyword like `shirt`, `panjabi`, or `watch`.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="ml-auto flex min-w-fit flex-nowrap items-center justify-end gap-2 whitespace-nowrap">
            {user ? (
              <>
                <Link
                  href={user.role === "admin" ? "/admin/dashboard" : "/profile"}
                  className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-white transition hover:bg-white/[0.1] md:flex"
                >
                  <User size={16} />
                  <span className="text-sm font-medium">
                    {user.role === "admin" ? "Admin" : user.full_name?.split(" ")[0] || "Profile"}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="hidden rounded-full border border-white/10 bg-transparent px-3 py-2 text-sm font-semibold text-white/78 transition hover:bg-white/[0.06] md:inline-flex"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1] md:inline-flex"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] md:inline-flex"
                >
                  Register
                </Link>
              </>
            )}
            <Link
              href="/cart"
              className="relative rounded-full border border-white/10 bg-white/[0.06] p-2.5 text-white transition hover:bg-white/[0.1]"
            >
              <ShoppingBag size={22} />
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-slate-950">
                {displayedCartCount}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/8 bg-[#130a1f] p-4 md:hidden">
          <div className="space-y-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      submitSearch();
                    }
                  }}
                  placeholder="Search"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35"
                />
              </div>
            </div>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="block rounded-xl px-4 py-3 font-medium text-white/72 hover:bg-white/[0.06] hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <hr className="my-2 border-white/8" />
            {user ? (
              <>
                <Link href="/profile" className="block rounded-xl px-4 py-3 text-white/72 hover:bg-white/[0.06] hover:text-white">My Profile</Link>
                <Link href="/orders" className="block rounded-xl px-4 py-3 text-white/72 hover:bg-white/[0.06] hover:text-white">My Orders</Link>
                <button onClick={signOut} className="block w-full rounded-xl px-4 py-3 text-left text-white/72 hover:bg-white/[0.06] hover:text-white">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block rounded-xl px-4 py-3 text-white/72 hover:bg-white/[0.06] hover:text-white">Sign In</Link>
                <Link href="/register" className="block rounded-xl px-4 py-3 text-white/72 hover:bg-white/[0.06] hover:text-white">Create Account</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
