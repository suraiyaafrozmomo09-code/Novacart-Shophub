"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface MonthlySales {
  name: string;
  value: number;
}

interface TopProduct {
  name: string;
  units: number;
  revenue: number;
}

export default function AdminReportsPage() {
  const [salesData, setSalesData] = useState<MonthlySales[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [statusData, setStatusData] = useState<Array<{ name: string; count: number }>>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    const [{ data: orders }, { count: customers }, { data: orderItems }] = await Promise.all([
      supabase.from("orders").select("total_amount, created_at, status"),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("order_items").select("quantity, price, product:products(name)"),
    ]);

    setCustomerCount(customers || 0);
    setOrderCount(orders?.length || 0);

    if (orders) {
      const byMonth = orders.reduce<Record<string, number>>((acc, order) => {
        const month = new Date(order.created_at).toLocaleString("en-US", { month: "short" });
        acc[month] = (acc[month] || 0) + order.total_amount;
        return acc;
      }, {});
      const byStatus = orders.reduce<Record<string, number>>((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      setSalesData(Object.entries(byMonth).map(([name, value]) => ({ name, value: Number(value) })));
      setStatusData(
        Object.entries(byStatus)
          .map(([name, count]) => ({ name, count: Number(count) }))
          .sort((a, b) => b.count - a.count)
      );
    }

    if (orderItems) {
      const productTotals = (orderItems as Array<{ quantity: number; price: number; product?: { name?: string } | Array<{ name?: string }> }>).reduce<Record<string, TopProduct>>((acc, item) => {
        const rawProduct = item.product;
        const productName = Array.isArray(rawProduct) ? rawProduct[0]?.name : rawProduct?.name;
        const name = productName || "Unnamed product";
        const current = acc[name] || { name, units: 0, revenue: 0 };
        current.units += item.quantity;
        current.revenue += item.quantity * item.price;
        acc[name] = current;
        return acc;
      }, {});

      setTopProducts(
        Object.values(productTotals)
          .sort((a, b) => b.units - a.units)
          .slice(0, 6)
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };

    void loadData();
  }, []);

  const totalRevenue = salesData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm mt-1 text-white/55">Analytics and sales insights</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "bg-green-500" },
          { label: "Total Orders", value: orderCount, icon: ShoppingBag, color: "bg-blue-500" },
          { label: "Avg Order Value", value: orderCount > 0 ? `$${(totalRevenue / orderCount).toFixed(2)}` : "$0.00", icon: TrendingUp, color: "bg-orange-500" },
          { label: "Customers", value: String(customerCount), icon: Users, color: "bg-purple-500" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon size={20} className="text-white" />
              </div>
              <span className="text-sm text-white/48">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
        <h3 className="font-bold text-white mb-6">Sales Overview</h3>
        {loading ? (
          <div className="h-64 rounded bg-white/10 animate-pulse" />
        ) : salesData.length > 0 ? (
          <div className="h-64 flex items-end gap-4">
            {salesData.map((item) => (
              <div key={item.name} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-fuchsia-600 to-violet-400 transition-all"
                  style={{ height: `${(item.value / Math.max(...salesData.map(d => d.value))) * 200}px` }}
                />
                <span className="text-xs font-medium text-white/45">{item.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-white/45">
            <div className="text-center">
              <BarChart3 size={32} className="mx-auto mb-2 text-white/25" />
              <p>No sales data available</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <h3 className="font-bold text-white mb-4">Order Status Breakdown</h3>
          {statusData.length > 0 ? (
            <div className="space-y-3">
              {statusData.map((status) => (
                <div key={status.name} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3">
                  <span className="text-sm font-medium capitalize text-white/68">{status.name}</span>
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/60">
                    {status.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/45">No order status data yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
          <h3 className="font-bold text-white mb-4">Top Selling Products</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{product.name}</p>
                    <p className="text-xs text-white/45">{product.units} units sold</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">${product.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/45">Top products will appear once customers place orders.</p>
          )}
        </div>
      </div>
    </div>
  );
}
