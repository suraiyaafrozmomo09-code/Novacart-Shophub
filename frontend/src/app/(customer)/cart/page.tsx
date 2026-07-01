"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SmartImage } from "@/components/ui/smart-image";
import { useAuth } from "@/components/layout/supabase-provider";
import type { CartItem, Product, ProductVariant } from "@/types";
import { cn } from "@/lib/utils";
import RecommendationSection from "@/components/products/recommendation-section";
import { getProductDisplaySrc, getProductImagePrompt } from "@/lib/product-media";
import {
  buildCartSeedProducts,
  buildRecommendations,
  formatCurrency,
  type ProductWithRelations,
} from "@/lib/storefront";

interface CartQueryRow {
  id: string;
  user_id: string;
  variant_id: string;
  quantity: number;
  variant?: ProductVariant & { product?: Product };
}

export default function CartPage() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<(CartItem & { product?: Product })[]>([]);
  const [catalog, setCatalog] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void supabase
      .from("products")
      .select("*, category:categories(*), variants:product_variants(*)")
      .eq("status", "active")
      .then(({ data }) => setCatalog((data || []) as ProductWithRelations[]));
  }, []);

  const fetchCart = async (userId: string) => {
    const { data } = await supabase
      .from("cart")
      .select("id, user_id, variant_id, quantity, variant:product_variants(*, product:products(*, category:categories(*)))")
      .eq("user_id", userId);

    if (data) {
      const items = (data as unknown as CartQueryRow[]).map((item) => ({
        id: item.id,
        user_id: item.user_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        variant: item.variant,
        product: item.variant?.product,
      }));
      setCartItems(items);
    } else {
      setCartItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;

    const loadCart = async () => {
      await fetchCart(user.id);
    };

    void loadCart();

    const channel = supabase
      .channel("cart-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "cart", filter: `user_id=eq.${user.id}` }, () => {
        void fetchCart(user.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (!user || newQty < 1) return;
    await supabase.from("cart").update({ quantity: newQty }).eq("id", itemId);
    await fetchCart(user.id);
  };

  const removeItem = async (itemId: string) => {
    if (!user) return;
    await supabase.from("cart").delete().eq("id", itemId);
    await fetchCart(user.id);
  };

  const total = cartItems.reduce((sum, item) => sum + (item.variant?.price || 0) * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const recommendations = buildRecommendations(
    buildCartSeedProducts(cartItems as Array<CartItem & { product?: ProductWithRelations }>),
    catalog,
    4
  ).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category?.name,
    price: product.variants?.[0]?.price || 0,
    image: product.variants?.[0]?.image,
  }));

  if (!user) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#0b0614_0%,_#12081f_16%,_#171024_36%,_#18111f_100%)]">
        <div className="border-b border-white/8 bg-[#140b20]/78 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] py-20 text-center backdrop-blur-xl">
            <ShoppingBag size={48} className="text-white/35 mx-auto mb-4" />
            <p className="text-xl font-semibold text-white mb-2">Please login to view your cart</p>
            <Link href="/login" className="text-fuchsia-300 hover:underline">Sign In</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0614] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-fuchsia-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#0b0614_0%,_#12081f_16%,_#171024_36%,_#18111f_100%)]">
      <div className="border-b border-white/8 bg-[#140b20]/78 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/72">
            <Sparkles size={14} className="text-fuchsia-300" />
            Cross-sell suggestions enabled
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white">Shopping Cart</h1>
          <p className="mt-1 text-white/58">{itemCount} item{itemCount !== 1 ? "s" : ""} in your cart</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.04] py-20 text-center backdrop-blur-xl">
            <ShoppingBag size={48} className="text-white/35 mx-auto mb-4" />
            <p className="text-xl font-semibold text-white mb-2">Your cart is empty</p>
            <Link href="/products" className="text-fuchsia-300 hover:underline">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_70px_rgba(3,2,10,0.34)] backdrop-blur-xl">
                  <Link href={`/products/${item.product?.id}`} className="w-24 h-24 bg-[#1a1224] rounded-lg overflow-hidden flex-shrink-0">
                    <SmartImage
                      src={getProductDisplaySrc(item.product as ProductWithRelations, item.variant)}
                      alt={item.product?.name}
                      fallbackPrompt={getProductImagePrompt(item.product as ProductWithRelations, item.variant)}
                      imageSize="square"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product?.id}`}>
                      <h3 className="truncate font-semibold text-white hover:text-fuchsia-200">{item.product?.name}</h3>
                    </Link>
                    <p className="text-sm text-white/45 mt-1">
                      {item.variant?.color && `Color: ${item.variant.color}`}
                      {item.variant?.color && item.variant?.size && " / "}
                      {item.variant?.size && `Size: ${item.variant.size}`}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center overflow-hidden rounded-lg border border-white/10">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-white/78 hover:bg-white/[0.06] transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-semibold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-white/78 hover:bg-white/[0.06] transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{formatCurrency((item.variant?.price || 0) * item.quantity)}</p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-white/45 mt-1">{formatCurrency(item.variant?.price || 0)} each</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_70px_rgba(3,2,10,0.34)] backdrop-blur-xl">
                <h3 className="font-bold text-lg text-white mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/55">Subtotal</span>
                    <span className="font-semibold text-white">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/55">Shipping</span>
                    <span className="font-semibold text-white">{total > 50 ? "Free" : "$5.99"}</span>
                  </div>
                  <hr className="my-3 border-white/8" />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-white">Total</span>
                    <span className="font-bold text-fuchsia-300">{formatCurrency(total + (total > 50 ? 0 : 5.99))}</span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className={cn(
                    "mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 px-4 font-semibold text-slate-950 transition hover:brightness-110"
                  )}
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </Link>
                <Link href="/products" className="mt-3 block text-center text-sm text-fuchsia-300 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {user && cartItems.length > 0 && recommendations.length > 0 && (
          <div className="mt-12">
            <RecommendationSection
              productId={cartItems[0].product?.id || ""}
              productName={cartItems[0].product?.name || "your selection"}
              recommendations={recommendations}
            />
          </div>
        )}
      </div>
    </div>
  );
}
