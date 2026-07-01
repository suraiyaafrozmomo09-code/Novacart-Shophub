"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Component,
  HomeIcon,
  Package,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SmartImage } from "@/components/ui/smart-image";
import { ColorBends } from "@/components/core/color-bends";
import CircularGallery from "@/components/core/circular-gallery";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/core/dock";
import GradientText from "@/components/core/gradient-text";
import ScrollFloat from "@/components/core/scroll-float";
import { Tilt } from "@/components/core/tilt";
import { getProductDisplaySrc, getProductImagePrompt } from "@/lib/product-media";
import {
  buildHeroProducts,
  formatCurrency,
  getProductMinPrice,
  type ProductWithRelations,
} from "@/lib/storefront";

const collectionCards = [
  { title: "Men’s Clothing", href: "/products?category=mens-clothing", image: "/product-images/tshirt.jpg" },
  { title: "Women’s Clothing", href: "/products?category=womens-clothing", image: "/product-images/sandal.jpg" },
  { title: "Accessories", href: "/products?category=accessories", image: "/product-images/watch.jpg" },
  { title: "Electronics", href: "/products?category=electronics", image: "/product-images/headphones.jpg" },
];

const dockData = [
  {
    title: "Home",
    href: "#hero",
    icon: <HomeIcon className="h-full w-full text-current" />,
  },
  {
    title: "Products",
    href: "#new-arrivals",
    icon: <Package className="h-full w-full text-current" />,
  },
  {
    title: "Collections",
    href: "#collections",
    icon: <Component className="h-full w-full text-current" />,
  },
  {
    title: "Gallery",
    href: "#gallery",
    icon: <Activity className="h-full w-full text-current" />,
  },
];

const fallbackProducts = [
  {
    id: "fallback-tshirt",
    name: "Minimal Tee",
    description: "Soft everyday cotton in clean monochrome tones.",
    price: 18.99,
    category: "Men’s Clothing",
    image: "/product-images/tshirt.jpg",
    href: "/products?query=t-shirt",
    rating: 4.8,
  },
  {
    id: "fallback-panjabi",
    name: "Festive Panjabi",
    description: "Elegant tailoring for special moments and celebrations.",
    price: 49.99,
    category: "Traditional Wear",
    image: "/product-images/panjabi.jpg",
    href: "/products?query=panjabi",
    rating: 4.9,
  },
  {
    id: "fallback-watch",
    name: "Signature Watch",
    description: "A refined finishing piece for a polished daily look.",
    price: 69.99,
    category: "Accessories",
    image: "/product-images/watch.jpg",
    href: "/products?query=watch",
    rating: 4.7,
  },
  {
    id: "fallback-headphones",
    name: "Wireless Headphones",
    description: "Immersive sound with a sleek, modern silhouette.",
    price: 89.99,
    category: "Electronics",
    image: "/product-images/headphones.jpg",
    href: "/products?query=headphones",
    rating: 4.8,
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);

  useEffect(() => {
    void supabase
      .from("products")
      .select("*, category:categories(*), variants:product_variants(*)")
      .eq("status", "active")
      .then(({ data }) => setProducts((data || []) as ProductWithRelations[]));
  }, []);

  const spotlightProducts = useMemo(() => buildHeroProducts(products).slice(0, 4), [products]);
  const displayProducts = spotlightProducts.length > 0
    ? spotlightProducts.map((product) => ({
        id: product.id,
        href: `/products/${product.id}`,
        name: product.name,
        description: product.description,
        price: formatCurrency(getProductMinPrice(product)),
        category: product.category?.name || "Featured",
        image: getProductDisplaySrc(product, product.variants?.[0]),
        rating: product.average_rating,
        prompt: getProductImagePrompt(product, product.variants?.[0]),
      }))
    : fallbackProducts.map((product) => ({
        id: product.id,
        href: product.href,
        name: product.name,
        description: product.description,
        price: formatCurrency(product.price),
        category: product.category,
        image: product.image,
        rating: product.rating,
        prompt: "premium ecommerce product shot",
      }));

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#0b0614_0%,_#12081f_18%,_#171024_38%,_#18111f_100%)] text-white">
      <section id="hero" className="relative overflow-hidden px-4 pb-20 pt-8">
        <div className="absolute inset-0">
          <ColorBends
            rotation={90}
            speed={0.4}
            colors={["#f31d76", "#2b27cd", "#2e61ca"]}
            transparent
            autoRotate={0}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            parallax={0.7}
            noise={0.1}
            iterations={1}
            intensity={1.5}
            bandWidth={6}
          />
        </div>

        <div className="container relative mx-auto">
          <div className="overflow-hidden rounded-[2.8rem] border border-white/15 bg-black/30 shadow-[0_30px_120px_rgba(15,23,42,0.24)] backdrop-blur-md">
            <div className="grid min-h-[760px] gap-10 px-6 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
              <div className="flex flex-col justify-between gap-10">
                <div className="space-y-6">
                  <GradientText
                    colors={["#ffffff", "#c4b5fd", "#f9a8d4", "#ffffff"]}
                    animationSpeed={4}
                    showBorder={false}
                    className="text-sm font-semibold uppercase tracking-[0.32em]"
                  >
                    New season / elevated essentials
                  </GradientText>

                  <div className="space-y-4">
                    <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] text-white md:text-7xl">
                      Feel the new
                      <span className="block">rhythm of style.</span>
                    </h1>
                    <p className="max-w-xl text-base leading-7 text-white/72 md:text-lg">
                      Refined fashion, statement accessories, and smart everyday tech curated to look sharp and sell well.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
                    >
                      Shop new arrivals
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      href="#collections"
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-6 py-3 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/[0.14]"
                    >
                      Explore collections
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Curated drops", value: "Weekly arrivals" },
                    { label: "Bundle ready", value: "Smart suggestions" },
                    { label: "Secure checkout", value: "Fast ordering" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.8rem] border border-white/12 bg-white/10 p-5 text-white backdrop-blur-xl">
                      <p className="text-sm uppercase tracking-[0.22em] text-white/55">{item.label}</p>
                      <p className="mt-3 text-xl font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative flex flex-col justify-between gap-4">
                <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                    <SmartImage
                      src="/product-images/hero-editorial.jpg"
                      alt="Hero fashion campaign"
                      fallbackPrompt="high-end ecommerce editorial fashion campaign, luxury neutral palette, premium retail mood"
                      imageSize="portrait_3_4"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="absolute left-6 top-6 rounded-[1.5rem] border border-white/15 bg-white/[0.14] px-4 py-3 text-white backdrop-blur-xl">
                    <p className="text-[11px] uppercase tracking-[0.26em] text-white/60">Just dropped</p>
                    <p className="mt-2 text-base font-semibold">Studio Layered Look</p>
                  </div>

                  <div className="absolute bottom-6 right-6 w-[220px] rounded-[1.5rem] border border-white/15 bg-black/35 p-4 text-white backdrop-blur-2xl">
                    <p className="text-[11px] uppercase tracking-[0.26em] text-white/60">Featured pairing</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-14 w-14 overflow-hidden rounded-2xl">
                        <SmartImage
                          src="/product-images/watch.jpg"
                          alt="Featured accessory"
                          fallbackPrompt="luxury watch product shot"
                          imageSize="square"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold">Essential add-ons</p>
                        <p className="text-sm text-white/65">Watches, fragrances, and tech picks</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    "/product-images/tshirt.jpg",
                    "/product-images/panjabi.jpg",
                    "/product-images/headphones.jpg",
                  ].map((image) => (
                    <div key={image} className="overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/10 p-2 backdrop-blur-xl">
                      <SmartImage
                        src={image}
                        alt=""
                        fallbackPrompt="premium ecommerce product shot"
                        imageSize="square"
                        className="aspect-[4/4.5] w-full rounded-[1.1rem] object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center px-6 pb-8">
              <Dock className="max-w-full items-end bg-white/90">
                {dockData.map((item, idx) => (
                  <Link key={item.title} href={item.href}>
                    <DockItem index={idx} className="bg-[#f7f3ee] text-slate-700 hover:bg-slate-950 hover:text-white">
                      <DockLabel>{item.title}</DockLabel>
                      <DockIcon>{item.icon}</DockIcon>
                    </DockItem>
                  </Link>
                ))}
              </Dock>
            </div>
          </div>
        </div>
      </section>

      <section id="new-arrivals" className="px-4 py-24">
        <div className="container mx-auto">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <GradientText
                colors={["#ffffff", "#a78bfa", "#f9a8d4", "#ffffff"]}
                animationSpeed={5}
                className="text-sm font-semibold uppercase tracking-[0.28em]"
              >
                New arrivals
              </GradientText>
              <ScrollFloat
                animationDuration={1}
                ease="back.inOut(2)"
                scrollStart="center bottom+=35%"
                scrollEnd="bottom bottom-=20%"
                stagger={0.018}
                textClassName="text-4xl md:text-6xl font-semibold text-white"
              >
                Fresh picks for every day.
              </ScrollFloat>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-white">
              View all products
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {displayProducts.map((item) => (
              <Tilt key={item.id} rotationFactor={8} isRevese>
                <Link
                  href={item.href}
                  className="group block overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(3,2,10,0.35)] backdrop-blur-xl transition hover:border-white/18"
                >
                  <div className="relative aspect-[4/4.3] overflow-hidden bg-[#1a1224]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      fallbackPrompt={item.prompt}
                      imageSize="square_hd"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/62">
                        {item.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-white/52">{item.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">{item.price}</span>
                      <span className="text-sm font-semibold text-white/52">Shop now</span>
                    </div>
                  </div>
                </Link>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      <section id="collections" className="px-4 py-16">
        <div className="container mx-auto">
          <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="h-fit rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,_#22103d,_#4a1d63)] p-8 text-white shadow-[0_30px_100px_rgba(40,16,68,0.28)] md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">Curated collections</p>
              <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
                Seasonal essentials for every wardrobe.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/72">
                Discover tailored menswear, polished women&apos;s pieces, elegant accessories, and everyday essentials selected for effortless shopping.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {collectionCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 shadow-[0_24px_70px_rgba(3,2,10,0.32)] backdrop-blur-xl"
                >
                  <div className="aspect-[4/4.6] overflow-hidden rounded-[1.6rem] bg-[#1a1224]">
                    <SmartImage
                      src={card.image}
                      alt={card.title}
                      fallbackPrompt={`premium ecommerce category image for ${card.title}`}
                      imageSize="square_hd"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center justify-between px-2 pb-2 pt-4">
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <ArrowRight size={16} className="text-white/55" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="px-4 pb-24 pt-20">
        <div className="container mx-auto">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/55">Circular gallery</p>
            <h2 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Turn through every category.</h2>
            <p className="mt-4 text-base leading-7 text-white/55">
              Browse featured categories and signature product groups from across the catalog.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-[linear-gradient(135deg,_#13071f,_#2a1141_46%,_#4a1d63_72%,_#12091f)] p-4 shadow-[0_30px_120px_rgba(31,12,54,0.32)]">
            <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="absolute right-0 top-20 h-56 w-56 rounded-full bg-violet-400/15 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative mb-4 flex flex-wrap gap-3 px-3 pt-2 text-white/80">
              {["New arrivals", "Best sellers", "Gift picks"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] backdrop-blur-xl"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="relative h-[560px] rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),transparent_28%)]">
              <CircularGallery
                bend={3}
                textColor="#ffffff"
                borderRadius={0.08}
                scrollEase={0.06}
                font="bold 28px Inter"
                scrollSpeed={2.2}
                items={[
                  { image: "/product-images/tshirt.jpg", text: "Men's Clothing" },
                  { image: "/product-images/kurti.jpg", text: "Women's Clothing" },
                  { image: "/product-images/watch.jpg", text: "Accessories" },
                  { image: "/product-images/headphones.jpg", text: "Electronics" },
                  { image: "/product-images/onesie.jpg", text: "Baby Clothes" },
                  { image: "/product-images/heel.jpg", text: "Women's Shoes" },
                  { image: "/product-images/chinos.jpg", text: "Men's Pants" },
                  { image: "/product-images/perfume.jpg", text: "Perfume" },
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
