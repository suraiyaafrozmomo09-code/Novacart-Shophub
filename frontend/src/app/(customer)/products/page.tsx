"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal, Grid, List, Star, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SmartImage } from "@/components/ui/smart-image";
import { Tilt } from "@/components/core/tilt";
import { getProductDisplaySrc, getProductImagePrompt } from "@/lib/product-media";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  getProductMaxPrice,
  getProductMinPrice,
  getProductStock,
  productMatchesQuery,
  type ProductWithRelations,
} from "@/lib/storefront";

const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: `Under ${formatCurrency(5000)}`, min: 0, max: 5000 },
  { label: `${formatCurrency(5000)} - ${formatCurrency(10000)}`, min: 5000, max: 10000 },
  { label: `${formatCurrency(10000)} - ${formatCurrency(25000)}`, min: 10000, max: 25000 },
  { label: `${formatCurrency(25000)} - ${formatCurrency(50000)}`, min: 25000, max: 50000 },
  { label: `Over ${formatCurrency(50000)}`, min: 50000, max: Infinity },
];

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "";
  const queryFromUrl = searchParams.get("query") || "";
  
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPrice, setSelectedPrice] = useState(priceRanges[0]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const selectedCategory = categoryFromUrl;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage(null);

      const [{ data: cats, error: categoriesError }, { data, error: productsError }] = await Promise.all([
        supabase.from("categories").select("*"),
        supabase
          .from("products")
          .select("*, category:categories(*), variants:product_variants(*)")
          .eq("status", "active"),
      ]);

      if (categoriesError || productsError) {
        console.error("Failed to load products page data", { categoriesError, productsError });
        setErrorMessage("We couldn't load products right now. Please try again in a moment.");
      }

      setCategories(cats ?? []);
      setProducts((data ?? []) as ProductWithRelations[]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getCategoryBySlug = (slug: string) => categories.find(c => c.slug === slug);
  
  const getParentCategories = () => categories.filter(c => !c.parent_id);
  
  const getChildCategories = (parentId: string) => 
    categories.filter(c => c.parent_id === parentId);
  
  const getCategoryIdsForFilter = () => {
    if (!selectedCategory) return [];
    const selectedCat = getCategoryBySlug(selectedCategory);
    if (!selectedCat) return [];
    
    // If selected category has no parent, it's a parent category - include all children
    if (!selectedCat.parent_id) {
      const childIds = getChildCategories(selectedCat.id).map(c => c.id);
      return [selectedCat.id, ...childIds];
    }
    
    // Otherwise just the selected category
    return [selectedCat.id];
  };

  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categorySlug) {
      params.set("category", categorySlug);
    } else {
      params.delete("category");
    }

    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const filteredProducts = products
    .filter((p) => {
      const categoryIds = getCategoryIdsForFilter();
      const matchesCategory = categoryIds.length === 0 || categoryIds.includes(p.category_id);
      const matchesSearch = productMatchesQuery(p, queryFromUrl);
      const matchesPrice = selectedPrice.max === Infinity
        ? true
        : p.variants && p.variants.length > 0
          ? p.variants.some((v) => v.price >= selectedPrice.min && v.price <= selectedPrice.max)
          : false;
      return matchesCategory && matchesPrice && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        const aPrice = a.variants?.[0]?.price || 0;
        const bPrice = b.variants?.[0]?.price || 0;
        return aPrice - bPrice;
      }
      if (sortBy === "price-high") {
        const aPrice = a.variants?.[0]?.price || 0;
        const bPrice = b.variants?.[0]?.price || 0;
        return bPrice - aPrice;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#0b0614_0%,_#12081f_16%,_#171024_36%,_#18111f_100%)]">
      <div className="border-b border-white/8 bg-[#140b20]/78 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/72">
            <Sparkles size={14} className="text-fuchsia-300" />
            Smart product discovery
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">
            {selectedCategory ? categories.find((c) => c.slug === selectedCategory)?.name || "Products" : "All Products"}
          </h1>
          <p className="mt-1 text-white/58">Browse our collection of premium products</p>
          {queryFromUrl && (
            <p className="mt-3 text-sm text-white/72">
              Search results for <span className="font-semibold text-white">&quot;{queryFromUrl}&quot;</span>
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className={cn("lg:w-64 flex-shrink-0", showFilters ? "block" : "hidden lg:block")}>
            <div className="sticky top-24 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_70px_rgba(3,2,10,0.34)] backdrop-blur-xl">
              <h3 className="mb-4 font-semibold text-white">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryChange("")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    selectedCategory === "" ? "bg-white/[0.08] text-white font-medium" : "text-white/58 hover:bg-white/[0.05]"
                  )}
                >
                  All Products
                </button>
                {getParentCategories().map((parentCat) => (
                  <div key={parentCat.id}>
                    <button
                      onClick={() => handleCategoryChange(parentCat.slug)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        selectedCategory === parentCat.slug ? "bg-white/[0.08] text-white" : "text-white/72 hover:bg-white/[0.05]"
                      )}
                    >
                      {parentCat.name}
                    </button>
                    {getChildCategories(parentCat.id).map((childCat) => (
                      <button
                        key={childCat.id}
                        onClick={() => handleCategoryChange(childCat.slug)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors pl-6",
                          selectedCategory === childCat.slug ? "bg-white/[0.08] text-white font-medium" : "text-white/45 hover:bg-white/[0.05]"
                        )}
                      >
                        {childCat.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              <h3 className="mt-6 mb-4 font-semibold text-white">Price Range</h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <label key={range.label} className="flex cursor-pointer items-center gap-2 text-sm text-white/58">
                    <input
                      type="radio"
                      name="price"
                      checked={selectedPrice.label === range.label}
                      onChange={() => setSelectedPrice(range)}
                      className="text-fuchsia-500 focus:ring-fuchsia-500"
                    />
                    {range.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/58">{filteredProducts.length} products</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <div className="hidden overflow-hidden rounded-lg border border-white/10 sm:flex items-center">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn("p-2", viewMode === "grid" ? "bg-white/[0.08] text-white" : "bg-transparent text-white/38")}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn("p-2", viewMode === "list" ? "bg-white/[0.08] text-white" : "bg-transparent text-white/38")}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="mb-4 h-48 rounded-lg bg-white/10" />
                    <div className="mb-2 h-4 w-3/4 rounded bg-white/10" />
                    <div className="h-4 w-1/2 rounded bg-white/10" />
                  </div>
                ))}
              </div>
            ) : errorMessage ? (
              <div className="rounded-[1.8rem] border border-red-400/20 bg-white/[0.04] py-16 text-center">
                <p className="text-lg font-semibold text-white">Products are unavailable right now</p>
                <p className="mt-2 text-white/55">{errorMessage}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-white/90"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] py-24 text-center">
                <p className="text-lg text-white/72">No products found</p>
                <p className="mt-2 text-white/45">Try adjusting your filters or search query</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Tilt key={product.id} rotationFactor={8} isRevese>
                    <Link
                      href={`/products/${product.id}`}
                      className="group block overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_70px_rgba(3,2,10,0.34)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/18"
                    >
                      <div className="relative aspect-[4/4.3] overflow-hidden bg-[#1a1224]">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
                        <SmartImage
                          src={getProductDisplaySrc(product, product.variants?.[0])}
                          alt={product.name}
                          fallbackPrompt={getProductImagePrompt(product, product.variants?.[0])}
                          fallbackSrc={getProductDisplaySrc(product)}
                          imageSize="square"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {product.average_rating > 0 && (
                          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-lg bg-black/45 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                            <Star size={12} className="fill-amber-300 text-amber-300" />
                            {product.average_rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="mb-1 text-xs uppercase tracking-wide text-white/42">{product.category?.name}</p>
                        <h3 className="line-clamp-2 font-semibold text-white transition-colors group-hover:text-white/88">
                          {product.name}
                        </h3>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            {product.variants && product.variants.length > 0 ? (
                              <div>
                                {product.variants.length === 1 ? (
                                  <p className="text-lg font-bold text-white">{formatCurrency(product.variants[0].price)}</p>
                                ) : (
                                  <p className="text-sm font-semibold text-white">
                                    {formatCurrency(getProductMinPrice(product))} - {formatCurrency(getProductMaxPrice(product))}
                                  </p>
                                )}
                              </div>
                            ) : null}
                          </div>
                          <span className="rounded border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-white/48">
                            {getProductStock(product)} in stock
                          </span>
                        </div>
                      </div>
                    </Link>
                  </Tilt>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group flex gap-5 rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_70px_rgba(3,2,10,0.34)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/18"
                  >
                    <div className="h-40 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-[#1a1224]">
                      <SmartImage
                        src={getProductDisplaySrc(product, product.variants?.[0])}
                        alt={product.name}
                        fallbackPrompt={getProductImagePrompt(product, product.variants?.[0])}
                        fallbackSrc={getProductDisplaySrc(product)}
                        imageSize="square"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="mb-1 text-xs uppercase tracking-wide text-white/42">{product.category?.name}</p>
                      <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-white/88">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-white/52">
                        {product.description || "Premium quality product"}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        {product.variants && product.variants.length > 0 ? (
                          <p className="text-lg font-bold text-white">
                            {product.variants.length === 1 ? formatCurrency(product.variants[0].price) : `${formatCurrency(getProductMinPrice(product))} - ${formatCurrency(getProductMaxPrice(product))}`}
                          </p>
                        ) : null}
<span className="rounded border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-white/48">
                           {getProductStock(product)} in stock
                         </span>
                       </div>
                     </div>
                   </Link>
                 ))}
               </div>
             )}
           </div>
         </div>
       </div>
     </div>
   );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
