"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Globe, Mail } from "lucide-react";

const footerLinks = {
  shop: {
    title: "Shop",
    links: [
      { name: "All Products", href: "/products" },
      { name: "Baby Clothes", href: "/products?category=baby-clothes" },
      { name: "Men's Clothing", href: "/products?category=mens-clothing" },
      { name: "Women's Clothing", href: "/products?category=womens-clothing" },
      { name: "Electronics", href: "/products?category=electronics" },
    ],
  },
  account: {
    title: "Account",
    links: [
      { name: "My Account", href: "/profile" },
      { name: "Order History", href: "/orders" },
      { name: "Wishlist", href: "/wishlist" },
      { name: "Cart", href: "/cart" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { name: "Contact Us", href: "/contact" },
      { name: "FAQs", href: "/faq" },
      { name: "Shipping", href: "/shipping" },
      { name: "Returns", href: "/returns" },
    ],
  },
};

export function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-white/8 bg-[linear-gradient(180deg,_#0d0716,_#130a1f)] text-slate-300">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-8 rounded-[2rem] border border-white/8 bg-white/[0.03] p-8 backdrop-blur-xl md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2 text-2xl font-bold">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
                <Store className="text-slate-950" size={24} />
              </div>
              <span className="text-white">NovaCart</span>
            </Link>
            <p className="mb-5 max-w-sm text-sm leading-7 text-slate-400">
              Curated fashion, accessories, and everyday tech selected for a cleaner premium shopping experience.
            </p>
            <div className="flex gap-3">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.05] transition-colors hover:bg-white/[0.1]">
                <Globe size={18} />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.05] transition-colors hover:bg-white/[0.1]">
                <Mail size={18} />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.05] transition-colors hover:bg-white/[0.1]">
                <Store size={18} />
              </a>
            </div>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/72">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-6 md:flex-row">
          <p className="text-slate-500 text-sm">
            {year} NovaCart. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
