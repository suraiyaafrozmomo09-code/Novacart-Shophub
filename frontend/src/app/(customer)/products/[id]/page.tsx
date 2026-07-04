"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Loader2, AlertCircle, CheckCircle2, Sparkles, Truck, ChevronRight, Star, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SmartImage } from "@/components/ui/smart-image";
import { useAuth } from "@/components/layout/supabase-provider";
import { cn } from "@/lib/utils";
import type { ProductVariant, Review, ReviewLanguage } from "@/types";
import RecommendationSection from "@/components/products/recommendation-section";
import { getProductDisplayId, getProductDisplaySrc, getProductImagePrompt } from "@/lib/product-media";
import {
  FREE_SHIPPING_THRESHOLD_USD,
  formatCurrency,
  getProductStock,
  type ProductWithRelations,
} from "@/lib/storefront";

interface ProductReview extends Review {
  user?: {
    full_name?: string;
    email?: string;
  };
}

const reviewLanguageLabels: Record<ReviewLanguage, string> = {
  english: "English",
  bangla: "Bangla",
  banglish: "Banglish",
};

const reviewPlaceholders: Record<ReviewLanguage, string> = {
  english: "Write your review in English",
  bangla: "বাংলায় আপনার রিভিউ লিখুন",
  banglish: "Banglish e apnar review likhun",
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const canReview = user?.role === "customer";
  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const [reviewFormTouched, setReviewFormTouched] = useState(false);
  const [reviewForm, setReviewForm] = useState<{
    rating: number;
    language: ReviewLanguage;
    comment: string;
  }>({
    rating: 5,
    language: "english",
    comment: "",
  });

  const existingReview = user ? reviews.find((review) => review.user_id === user.id) : undefined;
  const currentReviewForm = reviewFormTouched
    ? reviewForm
    : {
        rating: existingReview?.rating ?? reviewForm.rating,
        language: existingReview?.language ?? reviewForm.language,
        comment: existingReview?.comment ?? reviewForm.comment,
      };

  const fetchProductData = async (productId: string) => {
    const [{ data, error: fetchError }, { data: reviewRows, error: reviewsError }] = await Promise.all([
      supabase
        .from("products")
        .select("*, category:categories(*), variants:product_variants(*)")
        .eq("id", productId)
        .eq("status", "active")
        .single(),
      supabase
        .from("reviews")
        .select("id, product_id, user_id, rating, comment, language, created_at, updated_at, user:users(full_name, email)")
        .eq("product_id", productId)
        .order("created_at", { ascending: false }),
    ]);

    return { data, fetchError, reviewRows, reviewsError };
  };

  useEffect(() => {
    if (!params?.id) return;

    const loadProduct = async () => {
      setLoading(true);
      setError(null);

      const { data, fetchError, reviewRows, reviewsError } = await fetchProductData(params.id);

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      if (reviewsError) {
        console.error("Failed to load reviews:", reviewsError);
      }

      const resolvedProduct = data as ProductWithRelations;
      setProduct(resolvedProduct);
      setSelectedVariant(data.variants?.[0] || null);
      setReviews((reviewRows || []) as ProductReview[]);
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !product) {
      setReviewNotice("Please sign in to leave a review.");
      return;
    }

    if (!canReview) {
      setReviewNotice("Only customer accounts can post reviews.");
      return;
    }

    if (!currentReviewForm.comment.trim()) {
      setReviewNotice("Please write a short review before submitting.");
      return;
    }

    setSubmittingReview(true);
    setReviewNotice(null);

    const { error: reviewError } = await supabase.from("reviews").upsert(
      {
        product_id: product.id,
        user_id: user.id,
        rating: currentReviewForm.rating,
        language: currentReviewForm.language,
        comment: currentReviewForm.comment.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_id,user_id" }
    );

    if (reviewError) {
      console.error("Failed to submit review:", reviewError);
      setReviewNotice("We couldn't save your review right now. Please apply the latest review migration and try again.");
      setSubmittingReview(false);
      return;
    }

    const { data, reviewRows } = await fetchProductData(product.id);
    if (data) {
      setProduct(data as ProductWithRelations);
      setSelectedVariant(data.variants?.[0] || null);
    }
    setReviews((reviewRows || []) as ProductReview[]);
    setReviewFormTouched(false);
    setReviewForm({
      rating: currentReviewForm.rating,
      language: currentReviewForm.language,
      comment: currentReviewForm.comment.trim(),
    });
    setReviewNotice("Your review was saved successfully.");
    setSubmittingReview(false);
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
                  <span>{product.review_count} review{product.review_count === 1 ? "" : "s"}</span>
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
                    Orders above {formatCurrency(FREE_SHIPPING_THRESHOLD_USD)} qualify for free shipping. Admin can review each order status from the dashboard after checkout.
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

        <div className="mb-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_70px_rgba(3,2,10,0.28)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Customer reviews</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-white">What shoppers are saying</h2>
                <p className="mt-2 text-sm text-white/52">
                  Reviews can be written in English, Bangla, or Banglish.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white/78">
                {product.average_rating.toFixed(1)} / 5 from {product.review_count} review{product.review_count === 1 ? "" : "s"}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.02] px-5 py-8 text-center text-white/50">
                  No customer reviews yet. Be the first to share your thoughts.
                </div>
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {review.user?.full_name || review.user?.email?.split("@")[0] || "Customer"}
                        </p>
                        <p className="mt-1 text-xs text-white/42">
                          {new Date(review.created_at).toLocaleDateString("en-BD", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                          {reviewLanguageLabels[review.language]}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/72">
                      {review.comment}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_70px_rgba(3,2,10,0.28)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/48">Write a review</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Share your experience</h2>
            <p className="mt-2 text-sm text-white/52">
              Leave a rating and comment in the language you prefer.
            </p>

            {!user ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
                Please{" "}
                <Link href="/login" className="font-semibold text-white underline">
                  sign in
                </Link>{" "}
                to write a review for this product.
              </div>
            ) : !canReview ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-white/60">
                Reviews are available for customer accounts.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/72">Rating</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => {
                          setReviewFormTouched(true);
                          setReviewForm((current) => ({ ...current, rating }));
                        }}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm font-semibold transition",
                          currentReviewForm.rating === rating
                            ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                            : "border-white/12 bg-white/[0.03] text-white/68 hover:border-white/24"
                        )}
                      >
                        <Star size={14} className={cn(currentReviewForm.rating >= rating ? "fill-amber-400 text-amber-400" : "text-white/35")} />
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/72">Review language</label>
                  <div className="flex flex-wrap gap-2">
                    {(["english", "bangla", "banglish"] as ReviewLanguage[]).map((language) => (
                      <button
                        key={language}
                        type="button"
                        onClick={() => {
                          setReviewFormTouched(true);
                          setReviewForm((current) => ({ ...current, language }));
                        }}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-semibold transition",
                          currentReviewForm.language === language
                            ? "border-white bg-white text-slate-950"
                            : "border-white/12 bg-white/[0.03] text-white/68 hover:border-white/24"
                        )}
                      >
                        {reviewLanguageLabels[language]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="review-comment" className="mb-2 block text-sm font-medium text-white/72">
                    Your comment
                  </label>
                  <textarea
                    id="review-comment"
                    value={currentReviewForm.comment}
                    onChange={(e) => {
                      setReviewFormTouched(true);
                      setReviewForm((current) => ({ ...current, comment: e.target.value }));
                    }}
                    rows={6}
                    placeholder={reviewPlaceholders[currentReviewForm.language]}
                    className="w-full rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/18 focus:bg-white/[0.05]"
                  />
                </div>

                {reviewNotice && (
                  <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/75">
                    {reviewNotice}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className={cn(
                    "inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
                    submittingReview
                      ? "cursor-not-allowed bg-white/12 text-white/40"
                      : "bg-white text-slate-950 hover:bg-white/90"
                  )}
                >
                  {submittingReview ? "Saving review..." : "Post review"}
                </button>
              </form>
            )}
          </section>
        </div>

        <RecommendationSection productId={product.id} productName={product.name} />
      </div>
    </div>
  );
}
