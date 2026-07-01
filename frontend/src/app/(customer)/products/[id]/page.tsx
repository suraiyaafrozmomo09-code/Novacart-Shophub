"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Loader2, AlertCircle, CheckCircle2, Sparkles, Truck, ChevronRight, Star, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SmartImage } from "@/components/ui/smart-image";
import { useAuth } from "@/components/layout/supabase-provider";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types";
import RecommendationSection from "@/components/products/recommendation-section";
import { getProductDisplayId, getProductDisplaySrc, getProductImagePrompt } from "@/lib/product-media";
import {
  formatCurrency,
  getProductStock,
  type ProductWithRelations,
} from "@/lib/storefront";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;

    const loadProduct = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*, category:categories(*), variants:product_variants(*)")
        .eq("id", params.id)
        .eq("status", "active")
        .single();

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const resolvedProduct = data as ProductWithRelations;

      setProduct(resolvedProduct);
      setSelectedVariant(data.variants?.[0] || null);
      setLoading(false);
    };

    void loadProduct();
  }, [params?.id]);

  const handleAddToCart = async () => {
    if (!user || !selectedVariant || !product) return;
    
    setAddingToCart(true);
    setFeedback(null);

    const { data: existingItem } = await supabase
      .from("cart")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("variant_id", selectedVariant.id)
      .maybeSingle();

    const nextQuantity = Math.min((existingItem?.quantity || 0) + 1, selectedVariant.quantity);
    
    const payload = {
      user_id: user.id,
      variant_id: selectedVariant.id,
      quantity: nextQuantity,
    };

    const { error: insertError } = existingItem
      ? await supabase.from("cart").update({ quantity: nextQuantity }).eq("id", existingItem.id)
      : await supabase.from("cart").insert(payload);

    if (insertError) {
      console.error("Error adding to cart:", insertError);
      setFeedback("We couldn't add this item to your cart. Please make sure the latest database migration is applied.");
    } else {
      setFeedback(`${product.name} was added to your cart.`);
    }
    
    setAddingToCart(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,_#0b0614_0%,_#12081f_45%,_#18111f_100%)]">
        <Loader2 className="h-12 w-12 animate-spin text-white/70" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(180deg,_#0b0614_0%,_#12081f_45%,_#18111f_100%)] px-4">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-8 py-10 text-center shadow-[0_24px_80px_rgba(3,2,10,0.34)] backdrop-blur-xl">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-white/45" />
          <p className="text-white/80">Product not found</p>
          <Link href="/products" className="mt-4 inline-block text-sm font-semibold text-white">
            View all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#0b0614_0%,_#12081f_18%,_#171024_40%,_#18111f_100%)] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/45">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <ChevronRight size={14} />
          <Link href="/products" className="transition hover:text-white">Products</Link>
          <ChevronRight size={14} />
          <span className="text-white/82">{product.name}</span>
        </div>

        <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] shadow-[0_30px_120px_rgba(3,2,10,0.35)] backdrop-blur-xl">
          <div className="grid gap-8 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/10 bg-[#140d20]">
                <SmartImage
                  src={getProductDisplaySrc(product, selectedVariant || product.variants?.[0])}
                  alt={product.name}
                  fallbackPrompt={getProductImagePrompt(product, selectedVariant || product.variants?.[0])}
                  imageSize="square"
                  className="w-full h-full object-cover"
                />
                <div className="absolute left-5 top-5 rounded-full border border-white/12 bg-black/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white/72 backdrop-blur-xl">
                  {product.category?.name || "Featured"}
                </div>
              </div>
              
              {product.variants && product.variants.length > 1 && (
                <div className="grid grid-cols-4 gap-3 md:grid-cols-5">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={cn(
                        "overflow-hidden rounded-[1.2rem] border bg-white/[0.05] transition-all",
                        selectedVariant?.id === v.id 
                          ? "border-white/70 shadow-[0_18px_40px_rgba(3,2,10,0.32)]" 
                          : "border-white/8 hover:border-white/20"
                      )}
                    >
                      <SmartImage
                        src={getProductDisplaySrc(product, v)}
                        alt={`${product.name} variant`}
                        fallbackPrompt={getProductImagePrompt(product, v)}
                        imageSize="square"
                        className="aspect-square h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex-1">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white/66">
                  <Sparkles size={14} />
                  Curated selection
                </div>
                <h1 className="mb-3 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
                  {product.name}
                </h1>
                <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-white/50">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 font-medium text-white/78">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {product.average_rating.toFixed(1)} rating
                  </span>
                  <span>{product.brand || "Nova Select"}</span>
                  <span>Product code: <span className="font-semibold text-white">{getProductDisplayId(product)}</span></span>
                </div>
                <p className="mb-8 max-w-xl text-base leading-7 text-white/64">{product.description}</p>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-4xl font-semibold tracking-[-0.04em] text-white">
                      {formatCurrency(selectedVariant?.price || 0)}
                    </span>
                    <span className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]",
                      (selectedVariant?.quantity || 0) > 0 
                        ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300" 
                        : "border border-red-400/20 bg-red-400/10 text-red-300"
                    )}>
                      {selectedVariant?.quantity || 0} in stock
                    </span>
                  </div>

                  <div className="grid gap-3 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/38">Brand</p>
                      <p className="mt-1 font-semibold text-white">{product.brand || "Nova Select"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/38">Rating</p>
                      <p className="mt-1 font-semibold text-white">{product.average_rating.toFixed(1)} / 5</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/38">Total stock</p>
                      <p className="mt-1 font-semibold text-white">{getProductStock(product)} units</p>
                    </div>
                  </div>

                  {product.variants && product.variants.length > 1 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/50">Select Variant</h3>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            className={cn(
                              "rounded-full border px-4 py-2.5 text-sm font-medium transition-all",
                              selectedVariant?.id === v.id
                                ? "border-white bg-white text-slate-950"
                                : "border-white/12 bg-white/[0.03] text-white/72 hover:border-white/24 hover:bg-white/[0.06]"
                            )}
                          >
                            {[v.size ? `Size: ${v.size}` : "", v.color ? `Color: ${v.color}` : ""].filter(Boolean).join(" • ") || "Default"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || !user || (selectedVariant?.quantity || 0) === 0}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-full px-4 py-4 font-semibold text-white transition-all shadow-lg",
                    addingToCart || !user || (selectedVariant?.quantity || 0) === 0
                      ? "cursor-not-allowed bg-white/12 text-white/45 shadow-none"
                      : "bg-white text-slate-950 hover:bg-white/90"
                  )}
                >
                  {addingToCart ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Add to Cart
                    </>
                  )}
                </button>

                {feedback && (
                  <div className="flex items-start gap-2 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                    <CheckCircle2 size={16} className="mt-0.5" />
                    <span>{feedback}</span>
                  </div>
                )}
                
                {!user && (
                  <p className="text-center text-sm text-white/55">
                    Please{" "}
                    <Link href="/login" className="font-semibold text-white underline">
                      sign in
                    </Link>{" "}
                    to add items to cart
                  </p>
                )}

                <div className="grid gap-3 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Truck size={16} className="text-white/68" />
                    Delivery promise
                  </div>
                  <p className="mt-2 text-sm text-white/58">
                    Orders above $50 qualify for free shipping. Admin can review each order status from the dashboard after checkout.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <ShieldCheck size={16} className="text-white/68" />
                    Secure checkout
                  </div>
                  <p className="text-sm text-white/58">
                    Your cart and order history stay linked to your account for a smoother return-shopping experience.
                  </p>
                </div>
                {feedback && (
                  <button
                    type="button"
                    onClick={() => router.push("/cart")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] py-3 font-semibold text-white transition hover:bg-white/[0.08]"
                  >
                    View cart
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <RecommendationSection productId={product.id} productName={product.name} />
      </div>
    </div>
  );
}
