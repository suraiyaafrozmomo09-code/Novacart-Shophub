"use client";

import { useState, useEffect } from "react";
import { Eye, XCircle, Plus, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant } from "@/types";
import { getProductImagePrompt } from "@/lib/product-media";

interface OrderWithItems {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  shipping_address: {
    full_name?: string;
    phone?: string;
    address_line1?: string;
    city?: string;
  };
  profiles?: { full_name: string; email: string };
  order_items: Array<{
    id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    price: number;
    product?: { name: string };
    variant?: { size?: string; color?: string; image?: string };
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; full_name: string; email: string }>>([]);
  const [products, setProducts] = useState<(Product & { variants?: ProductVariant[] })[]>([]);
  const [orderForm, setOrderForm] = useState({
    customerId: "",
    items: [{ productId: "", variantId: "", quantity: "1", price: "" }],
    status: "pending",
    paymentStatus: "pending",
  });

  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*, product:products(name), variant:product_variants(size, color, image)), profiles:users!orders_user_id_fkey(full_name, email)")
      .order("created_at", { ascending: false });

    if (data) setOrders(data as OrderWithItems[]);
    setLoading(false);
  }

  async function fetchCustomers() {
    const { data } = await supabase.from("users").select("id, full_name, email").eq("role", "customer");
    if (data) setCustomers(data);
  }

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*, variants:product_variants(*)");
    if (data) setProducts(data);
  }

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchOrders(), fetchCustomers(), fetchProducts()]);
    };

    void loadData();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    void fetchOrders();
  };

  const updatePaymentStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ payment_status: status }).eq("id", orderId);
    void fetchOrders();
  };

  const addOrderItem = () => {
    setOrderForm({ ...orderForm, items: [...orderForm.items, { productId: "", variantId: "", quantity: "1", price: "" }] });
  };

  const updateOrderItem = (index: number, field: string, value: string) => {
    const updated = [...orderForm.items];
    updated[index] = { ...updated[index], [field]: value };
    setOrderForm({ ...orderForm, items: updated });
  };

  const removeOrderItem = (index: number) => {
    if (orderForm.items.length === 1) return;
    setOrderForm({ ...orderForm, items: orderForm.items.filter((_, i) => i !== index) });
  };

  const createOrder = async () => {
    if (!orderForm.customerId || orderForm.items.some(item => !item.productId)) return;

    const total = orderForm.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * parseInt(item.quantity), 0);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: orderForm.customerId,
        total_amount: total,
        status: orderForm.status,
        payment_method: "cod",
        payment_status: orderForm.paymentStatus,
        shipping_address: { full_name: "Admin Order", city: "N/A", state: "N/A", zip_code: "0000", address_line1: "Manual order", country: "Bangladesh" },
      })
      .select()
      .single();

    if (!error && order) {
      const orderItems = orderForm.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId || products.find((product) => product.id === item.productId)?.variants?.[0]?.id,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
      }));
      await supabase.from("order_items").insert(orderItems);
      void fetchOrders();
      setShowAddOrder(false);
      setOrderForm({ customerId: "", items: [{ productId: "", variantId: "", quantity: "1", price: "" }], status: "pending", paymentStatus: "pending" });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = !filterStatus || o.status === filterStatus;
    const matchesSearch = !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.shipping_address?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm mt-1 text-white/55">Manage customer orders</p>
        </div>
        <button
          onClick={() => setShowAddOrder(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 font-semibold text-slate-950 transition-colors hover:bg-white/90"
        >
          <Plus size={18} />
          Add Order
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders..."
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/10"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 space-y-3 backdrop-blur-xl">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded bg-white/10 animate-pulse" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.04] text-white/55 font-medium">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.03]">
                    <td className="px-6 py-4 font-medium text-white">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{order.shipping_address?.full_name || order.profiles?.full_name || "Unknown"}</p>
                        <p className="text-xs text-white/45">{order.profiles?.email || order.shipping_address?.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/55">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-white">${order.total_amount?.toFixed(2) || "0.00"}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        order.payment_status === "paid" && "bg-emerald-500/12 text-emerald-300",
                        order.payment_status === "pending" && "bg-amber-500/12 text-amber-300",
                        order.payment_status === "failed" && "bg-red-500/12 text-red-300"
                      )}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        order.status === "pending" && "bg-amber-500/12 text-amber-300",
                        order.status === "processing" && "bg-blue-500/12 text-blue-300",
                        order.status === "shipped" && "bg-purple-500/12 text-purple-300",
                        order.status === "delivered" && "bg-emerald-500/12 text-emerald-300",
                        order.status === "cancelled" && "bg-red-500/12 text-red-300"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                          value={order.payment_status}
                          onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                          className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white focus:outline-none"
                        >
                          <option value="pending">Payment pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                        </select>
                        <button onClick={() => setSelectedOrder(order)} className="rounded-lg p-2 hover:bg-white/[0.06]">
                          <Eye size={16} className="text-white/72" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-white/45">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#140b20] p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Order #{selectedOrder.id.slice(0, 8)}</h3>
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium">Customer:</span> {selectedOrder.shipping_address?.full_name || selectedOrder.profiles?.full_name}</p>
                <p><span className="font-medium">Phone:</span> {selectedOrder.shipping_address?.phone}</p>
                <p><span className="font-medium">Total:</span> ${selectedOrder.total_amount?.toFixed(2) || "0.00"}</p>
                <p><span className="font-medium">Status:</span> {selectedOrder.status}</p>
                <p><span className="font-medium">Payment:</span> {selectedOrder.payment_status}</p>
                <p><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium mb-2">Items:</p>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg bg-white/[0.04] p-3">
                      <div className="w-12 h-12 bg-[#1a1224] rounded flex-shrink-0 overflow-hidden">
                        <SmartImage
                          src=""
                          alt={item.product?.name || "Order item"}
                          fallbackPrompt={getProductImagePrompt({ name: item.product?.name })}
                          imageSize="square"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-white">{item.product?.name || "Product"}</p>
                        <p className="text-xs text-white/45">
                          {item.variant?.color && `Color: ${item.variant.color}`}
                          {item.variant?.color && item.variant?.size && " / "}
                          {item.variant?.size && `Size: ${item.variant.size}`}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">x{item.quantity}</p>
                      <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="mt-4 w-full rounded-lg border border-white/10 py-2 hover:bg-white/[0.05]">Close</button>
          </div>
        </div>
      )}

      {showAddOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-white/10 bg-[#140b20] p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Create New Order</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/72 mb-1.5">Customer</label>
                <select
                  value={orderForm.customerId}
                  onChange={(e) => setOrderForm({ ...orderForm, customerId: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                >
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/72 mb-1.5">Status</label>
                <select
                  value={orderForm.status}
                  onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/72 mb-1.5">Payment Status</label>
                <select
                  value={orderForm.paymentStatus}
                  onChange={(e) => setOrderForm({ ...orderForm, paymentStatus: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="border-t border-white/8 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Order Items</h4>
                  <button onClick={addOrderItem} className="text-sm text-fuchsia-300 hover:underline">Add Item</button>
                </div>
                <div className="space-y-3">
                  {orderForm.items.map((item, idx) => (
                    <div key={idx} className="grid gap-2 rounded-lg border border-white/10 p-3 sm:grid-cols-4">
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const prod = products.find(p => p.id === e.target.value);
                          updateOrderItem(idx, "productId", e.target.value);
                          updateOrderItem(idx, "price", prod?.variants?.[0]?.price?.toString() || "");
                        }}
                        className="rounded border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white"
                      >
                        <option value="">Product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <select
                        value={item.variantId}
                        onChange={(e) => updateOrderItem(idx, "variantId", e.target.value)}
                        className="rounded border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white"
                        disabled={!item.productId}
                      >
                        <option value="">Variant</option>
                        {item.productId && products.find(p => p.id === item.productId)?.variants?.map(v => (
                          <option key={v.id} value={v.id}>{v.size || v.color || "Default"}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(idx, "quantity", e.target.value)}
                        placeholder="Qty"
                        className="rounded border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white"
                        min="1"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateOrderItem(idx, "price", e.target.value)}
                          placeholder="Price"
                          className="flex-1 rounded border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white"
                        />
                        {orderForm.items.length > 1 && (
                          <button onClick={() => removeOrderItem(idx)} className="rounded p-2 text-rose-300 hover:bg-rose-500/10">
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddOrder(false)} className="flex-1 rounded-lg border border-white/10 py-2 hover:bg-white/[0.05]">Cancel</button>
              <button onClick={createOrder} className="flex-1 rounded-lg bg-white py-2 text-slate-950 hover:bg-white/90">Create Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
