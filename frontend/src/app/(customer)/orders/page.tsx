"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Package, ChevronRight, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/layout/supabase-provider";
import type { Order } from "@/types";
import { formatCurrency } from "@/lib/storefront";
import { cn } from "@/lib/utils";

function OrdersContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders(userId: string) {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    if (!user) return;
    const run = async () => {
      await loadOrders(user.id);
    };
    void run();
  }, [user]);

  const cancelOrder = async (orderId: string) => {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
    await loadOrders(user!.id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-slate-900">Please login to view orders</p>
          <Link href="/login" className="text-orange-600 mt-2 inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
          <p className="text-slate-600 mt-1">View and manage your orders</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {searchParams.get("placed") && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Your order was placed successfully and is now visible in your order history.
          </div>
        )}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 h-24 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <Package size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-900 mb-2">No orders yet</p>
            <Link href="/products" className="text-orange-600 hover:underline">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      order.status === "pending" && "bg-amber-50 text-amber-600",
                      order.status === "processing" && "bg-blue-50 text-blue-600",
                      order.status === "shipped" && "bg-purple-50 text-purple-600",
                      order.status === "delivered" && "bg-green-50 text-green-600",
                      order.status === "cancelled" && "bg-red-50 text-red-600",
                    )}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(order.total_amount)}</p>
                    <p className="text-xs text-slate-500">{order.payment_method === "online" ? "Paid Online" : "Cash on Delivery"}</p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                    <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
