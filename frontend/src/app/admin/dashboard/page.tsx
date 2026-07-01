"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { DollarSign, ShoppingBag, Users, Package, ArrowUpRight, Boxes, Tags, AlertTriangle, TrendingUp, BadgePercent } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Product, ProductVariant, Category } from "@/types";

interface StatsCard {
  title: string;
  value: string | number;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsCard[]>([]);
  const [recentOrders, setRecentOrders] = useState<Array<{
    id: string;
    total_amount: number;
    created_at: string;
    status: string;
  }>>([]);
const [lowStockProducts, setLowStockProducts] = useState<Array<
    Partial<Product> & {
      category?: Category | Category[];
      variants?: Array<Partial<ProductVariant>>;
    }
  >>([]);
  const [categoryOverview, setCategoryOverview] = useState<Array<{ name: string; count: number }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{ name: string; units: number; revenue: number }>>([]);
  const [statusOverview, setStatusOverview] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const [ordersResult, usersResult, productsResult, categoriesResult, orderItemsResult] = await Promise.all([
        supabase
          .from("orders")
          .select("id, total_amount, created_at, status", { count: "exact" })
          .order("created_at", { ascending: false }),
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("id, name, category:categories(*), variants:product_variants(quantity)", { count: "exact" }),
        supabase.from("categories").select("id, name"),
        supabase.from("order_items").select("quantity, price, product:products(name)"),
      ]);

      const totalRevenue = (ordersResult.data || []).reduce((sum, order) => sum + order.total_amount, 0);
      const totalOrders = ordersResult.count || 0;
      const totalCustomers = usersResult.count || 0;
      const totalProducts = productsResult.count || 0;
      const pendingOrders = (ordersResult.data || []).filter((order) =>
        ["pending", "processing"].includes(order.status)
      ).length;
      const categoryCount = categoriesResult.data?.length || 0;
      const lowStock = ((productsResult.data || []) as unknown as Array<{
        id: string;
        name?: string;
        variants?: Array<{ quantity?: number }>;
        category?: Category | Category[];
      }>).filter((product) => {
        const stock = (product.variants || []).reduce((sum, variant) => sum + (variant.quantity || 0), 0);
        return stock > 0 && stock <= 10;
      });
      const categoryCounts = new Map<string, number>();
      const topProductMap = new Map<string, { units: number; revenue: number }>();
      const statusMap = new Map<string, number>();

      for (const product of productsResult.data || []) {
        const cat = product.category;
        const categoryName = cat && !Array.isArray(cat) && "name" in cat
          ? (cat as Category).name
          : Array.isArray(cat) && cat[0] && "name" in cat[0]
            ? cat[0].name
            : "Uncategorized";
        categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
      }

      for (const order of ordersResult.data || []) {
        statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1);
      }

      for (const item of (orderItemsResult.data || []) as Array<{ quantity: number; price: number; product?: { name?: string } | { name?: string }[] }>) {
        const productName = Array.isArray(item.product) ? item.product[0]?.name : item.product?.name;
        const name = productName || "Unnamed product";
        const current = topProductMap.get(name) || { units: 0, revenue: 0 };
        current.units += item.quantity;
        current.revenue += item.quantity * item.price;
        topProductMap.set(name, current);
      }

      setStats([
        {
          title: "Total Revenue",
          value: `$${totalRevenue.toFixed(2)}`,
          subtitle: `${totalOrders} completed and active orders tracked`,
          href: "/admin/reports",
          icon: DollarSign,
          color: "from-emerald-500 to-green-600",
        },
        {
          title: "Total Orders",
          value: totalOrders,
          subtitle: `${pendingOrders} orders need attention`,
          href: "/admin/orders",
          icon: ShoppingBag,
          color: "from-sky-500 to-blue-600",
        },
        {
          title: "Total Customers",
          value: totalCustomers,
          subtitle: "Registered shoppers in your store",
          href: "/admin/customers",
          icon: Users,
          color: "from-orange-500 to-amber-600",
        },
        {
          title: "Total Products",
          value: totalProducts,
          subtitle: `${lowStock.length} low-stock products to review`,
          href: "/admin/products",
          icon: Package,
          color: "from-violet-500 to-purple-600",
        },
        {
          title: "Categories",
          value: categoryCount,
          subtitle: "Catalog sections currently configured",
          href: "/admin/categories",
          icon: Tags,
          color: "from-fuchsia-500 to-pink-600",
        },
        {
          title: "Inventory Alerts",
          value: lowStock.length,
          subtitle: "Products running low on stock",
          href: "/admin/products",
          icon: AlertTriangle,
          color: "from-rose-500 to-red-600",
        },
        {
          title: "Avg Order Value",
          value: `$${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00"}`,
          subtitle: "Average revenue per placed order",
          href: "/admin/reports",
          icon: BadgePercent,
          color: "from-cyan-500 to-sky-600",
        },
      ]);

      setRecentOrders((ordersResult.data || []).slice(0, 5));
      setLowStockProducts((lowStock as unknown as Array<Partial<Product> & { category?: Category | Category[]; variants?: Array<Partial<ProductVariant>> }>));
      setCategoryOverview(
        Array.from(categoryCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );
      setTopProducts(
        Array.from(topProductMap.entries())
          .map(([name, values]) => ({ name, units: values.units, revenue: values.revenue }))
          .sort((a, b) => b.units - a.units)
          .slice(0, 5)
      );
      setStatusOverview(
        Array.from(statusMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      );

      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-fuchsia-400 border-t-transparent" /></div>;
  }

  const monthlyRevenue = recentOrders.reduce<Record<string, number>>((acc, order) => {
    const month = new Date(order.created_at).toLocaleDateString("en-US", { month: "short" });
    acc[month] = (acc[month] || 0) + order.total_amount;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 text-white/55">Track revenue, catalog health, orders, and inventory from one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-all hover:border-white/18 hover:shadow-[0_24px_70px_rgba(3,2,10,0.34)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white/48">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-white/48">{stat.subtitle}</p>
              </div>
              <div className={cn("p-3 rounded-2xl bg-gradient-to-br text-white shadow-lg", stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-fuchsia-300">
              Open
              <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1.6fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Recent Orders</h3>
              <Link href="/admin/orders" className="text-sm font-semibold text-fuchsia-300 hover:text-fuchsia-200">
                View all
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-white/48">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-white/8 py-3 last:border-0">
                    <div>
                      <p className="font-medium text-white">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-white/45">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">${order.total_amount.toFixed(2)}</p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        order.status === "pending" && "bg-amber-500/12 text-amber-300",
                        order.status === "processing" && "bg-blue-500/12 text-blue-300",
                        order.status === "delivered" && "bg-emerald-500/12 text-emerald-300",
                      )}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Revenue Overview</h3>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            {Object.keys(monthlyRevenue).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(monthlyRevenue).map(([month, amount]) => (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/68">{month}</span>
                    <span className="font-semibold text-emerald-600">${(amount as number).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/48">No revenue data yet</p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Top Products</h3>
              <Link href="/admin/reports" className="text-sm font-semibold text-fuchsia-300 hover:text-fuchsia-200">
                Analyze
              </Link>
            </div>
            {topProducts.length === 0 ? (
              <p className="text-sm text-white/48">Sales data will appear here after orders are placed.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product) => (
                  <div key={product.name} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3">
                    <div>
                      <p className="font-medium text-white">{product.name}</p>
                      <p className="text-xs text-white/45">{product.units} units sold</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">${product.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Quick Actions</h3>
              <Boxes size={18} className="text-white/40" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Add New Product", href: "/admin/products/new", desc: "Add a new product to inventory" },
                { title: "Manage Categories", href: "/admin/categories", desc: "Organize product categories" },
                { title: "View All Orders", href: "/admin/orders", desc: "Track and manage orders" },
                { title: "Sales Reports", href: "/admin/reports", desc: "View analytics and reports" },
              ].map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-xl border border-white/10 p-4 transition-all hover:border-white/18 hover:bg-white/[0.05]"
                >
                  <h4 className="font-semibold text-white group-hover:text-fuchsia-200">{action.title}</h4>
                  <p className="mt-1 text-xs text-white/45">{action.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Low Stock</h3>
              <Link href="/admin/products" className="text-sm font-semibold text-fuchsia-300 hover:text-fuchsia-200">
                Manage
              </Link>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-white/48">Inventory levels look healthy.</p>
            ) : (
              <div className="space-y-3">
{lowStockProducts.map((product) => {
                   const stock = (product.variants || []).reduce((sum, variant) => sum + (variant.quantity || 0), 0);
                   const cat = product.category;
                   const categoryName = cat && !Array.isArray(cat) && "name" in cat
                     ? (cat as Category).name
                     : Array.isArray(cat) && cat[0] && "name" in cat[0]
                       ? cat[0].name
                       : "Uncategorized";

                   return (
                     <div key={product.id} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-4 py-3">
                       <div>
                         <p className="font-medium text-white">{product.name}</p>
                         <p className="text-xs text-white/45">{categoryName}</p>
                       </div>
                       <span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-xs font-semibold text-amber-300">
                         {stock} left
                       </span>
                     </div>
                   );
                 })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Order Status Mix</h3>
              <Link href="/admin/orders" className="text-sm font-semibold text-fuchsia-300 hover:text-fuchsia-200">
                Review
              </Link>
            </div>
            {statusOverview.length === 0 ? (
              <p className="text-sm text-white/48">Status breakdown will appear after orders are placed.</p>
            ) : (
              <div className="space-y-3">
                {statusOverview.map((status) => (
                  <div key={status.name} className="flex items-center justify-between">
                    <p className="text-sm font-medium capitalize text-white/68">{status.name}</p>
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/60">
                      {status.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Catalog Overview</h3>
              <Link href="/admin/categories" className="text-sm font-semibold text-fuchsia-300 hover:text-fuchsia-200">
                Edit
              </Link>
            </div>
            {categoryOverview.length === 0 ? (
              <p className="text-sm text-white/48">No categories available yet.</p>
            ) : (
              <div className="space-y-3">
                {categoryOverview.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white/68">{category.name}</p>
                    <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/60">
                      {category.count} products
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
