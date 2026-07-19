"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Truck, Check, ChevronRight, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SmartImage } from "@/components/ui/smart-image";
import { useAuth } from "@/components/layout/supabase-provider";
import type { CartItem, Address, Product, ProductVariant } from "@/types";
import { cn } from "@/lib/utils";
import {
  FREE_SHIPPING_THRESHOLD,
  formatCurrency,
  formatShippingLabel,
  STANDARD_SHIPPING,
} from "@/lib/storefront";
import { getProductDisplaySrc, getProductImagePrompt } from "@/lib/product-media";

interface CheckoutCartRow {
  id: string;
  user_id: string;
  variant_id: string;
  quantity: number;
  variant?: ProductVariant & { product?: Product };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<(CartItem & { product?: Product; variant?: ProductVariant })[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("cod");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [address, setAddress] = useState<Address>({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    country: "Bangladesh",
  });

  const fetchCart = async (userId: string) => {
    const { data } = await supabase
      .from("cart")
      .select("id, user_id, variant_id, quantity, variant:product_variants(*, product:products(*))")
      .eq("user_id", userId);

    if (data) {
      const items = (data as unknown as CheckoutCartRow[]).map((item) => ({
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

  const handleSubmitOrder = async () => {
    if (!user || cartItems.length === 0) return;
    setSubmitting(true);
    setSubmitError(null);

    const missingRequiredFields = [address.full_name, address.phone, address.address_line1, address.city, address.state, address.zip_code]
      .some((value) => !value.trim());

    if (missingRequiredFields) {
      setSubmitError("Please complete all required shipping fields before placing the order.");
      setSubmitting(false);
      return;
    }

    const shippingAddress = address;
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (item.variant?.price || 0) * item.quantity,
      0
    ) + (cartItems.reduce((sum, item) => sum + (item.variant?.price || 0) * item.quantity, 0) > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING);

    const { data: orderId, error: rpcError } = await supabase.rpc("place_order_from_cart", {
      p_shipping_address: shippingAddress,
      p_payment_method: paymentMethod,
    });

    if (!rpcError && orderId) {
      router.push(`/orders?placed=${orderId}`);
      setSubmitting(false);
      return;
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "cod" ? "pending" : "paid",
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      setSubmitError("Order placement is blocked by the current database rules. Run the latest Supabase migration and try again.");
      setSubmitting(false);
      return;
    }

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product?.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.variant?.price || 0,
    }));

    const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems);

    if (orderItemsError) {
      setSubmitError("Your order record was created, but line items could not be saved. Apply the latest migration before using checkout.");
      setSubmitting(false);
      return;
    }

    await Promise.all([
      supabase.from("cart").delete().eq("user_id", user.id),
      ...cartItems.map((item) =>
        supabase
          .from("product_variants")
          .update({ quantity: Math.max((item.variant?.quantity || 0) - item.quantity, 0) })
          .eq("id", item.variant_id)
      ),
    ]);
    router.push("/orders");
    setSubmitting(false);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.variant?.price || 0) * item.quantity, 0);
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = subtotal + shipping;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0614] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-white">Please login to checkout</p>
          <Link href="/login" className="text-fuchsia-300 mt-2 inline-block">Sign In</Link>
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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0614] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-white">Your cart is empty</p>
          <Link href="/products" className="text-fuchsia-300 mt-2 inline-block">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#0b0614_0%,_#12081f_16%,_#171024_36%,_#18111f_100%)]">
      <div className="border-b border-white/8 bg-[#140b20]/78 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white">Checkout</h1>
          <div className="flex items-center gap-3 mt-4">
            {["Shipping", "Payment", "Review"].map((label, idx) => (
              <div key={label} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  step > idx + 1 ? "bg-emerald-500 text-white" : step === idx + 1 ? "bg-white text-slate-950" : "bg-white/10 text-white/45"
                )}>
                  {step > idx + 1 ? <Check size={16} /> : idx + 1}
                </div>
                <span className={cn("text-sm font-medium hidden sm:block", step === idx + 1 ? "text-white" : "text-white/45")}>{label}</span>
                {idx < 2 && <ChevronRight size={16} className="text-white/25" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-white mb-4">Shipping Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-white/72 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={address.full_name}
                      onChange={(e) => setAddress({ ...address, full_name: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/72 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/72 mb-1.5">Country</label>
                    <input
                      type="text"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-white/72 mb-1.5">Address Line 1</label>
                    <input
                      type="text"
                      value={address.address_line1}
                      onChange={(e) => setAddress({ ...address, address_line1: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-white/72 mb-1.5">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={address.address_line2}
                      onChange={(e) => setAddress({ ...address, address_line2: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/72 mb-1.5">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/72 mb-1.5">State</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/72 mb-1.5">ZIP Code</label>
                    <input
                      type="text"
                      value={address.zip_code}
                      onChange={(e) => setAddress({ ...address, zip_code: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                      required
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full rounded-xl bg-white py-3 font-semibold text-slate-950 transition-colors hover:bg-white/90"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-white mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: "online", label: "Online Payment", desc: "Credit/Debit Card, bKash, Nagad", icon: CreditCard },
                    { value: "cod", label: "Cash on Delivery", desc: "Pay when you receive", icon: Truck },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={cn(
                        "flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all",
                        paymentMethod === method.value ? "border-white/18 bg-white/[0.06]" : "border-white/10 hover:border-white/18"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value as "online" | "cod")}
                        className="text-orange-600 focus:ring-orange-500 hidden"
                      />
                      <div className="p-2 bg-white/[0.05] rounded-lg shadow-sm">
                        <method.icon size={24} className={paymentMethod === method.value ? "text-fuchsia-300" : "text-white/45"} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{method.label}</p>
                        <p className="text-sm text-white/45">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-xl border border-white/10 py-3 font-semibold text-white hover:bg-white/[0.05] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 rounded-xl bg-white py-3 font-semibold text-slate-950 transition-colors hover:bg-white/90"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-white mb-4">Review Your Order</h2>
                <div className="space-y-4">
                  {submitError && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      <AlertCircle size={16} className="mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}
                  <div className="rounded-xl bg-white/[0.04] p-4">
                    <h3 className="font-semibold text-white mb-2">Shipping Address</h3>
                    <p className="text-sm text-white/55">{address.full_name}, {address.phone}</p>
                    <p className="text-sm text-white/55">{address.address_line1}</p>
                    <p className="text-sm text-white/55">{address.city}, {address.state} {address.zip_code}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] p-4">
                    <h3 className="font-semibold text-white mb-2">Payment Method</h3>
                    <p className="text-sm text-white/55">{paymentMethod === "online" ? "Online Payment" : "Cash on Delivery"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">{cartItems.length} Items</h3>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-white/8 last:border-0">
                        <div className="w-12 h-12 bg-[#1a1224] rounded-lg overflow-hidden">
                          <SmartImage
                            src={getProductDisplaySrc(item.product || {}, item.variant)}
                            alt={item.product?.name || "Checkout item"}
                            fallbackPrompt={getProductImagePrompt(item.product || {}, item.variant)}
                            fallbackSrc={getProductDisplaySrc(item.product || {})}
                            imageSize="square"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{item.product?.name}</p>
                          <p className="text-xs text-white/45">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-white">{formatCurrency((item.variant?.price || 0) * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-xl border border-white/10 py-3 font-semibold text-white hover:bg-white/[0.05] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className={cn(
                      "flex-1 rounded-xl bg-white py-3 font-semibold text-slate-950 transition-colors hover:bg-white/90",
                      submitting && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {submitting ? "Placing Order..." : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
              <h3 className="font-bold text-white mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/55">Subtotal ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/55">Shipping</span>
                  <span className="font-semibold text-white">{formatShippingLabel(shipping)}</span>
                </div>
                <hr className="my-3 border-white/8" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-bold text-fuchsia-300">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
