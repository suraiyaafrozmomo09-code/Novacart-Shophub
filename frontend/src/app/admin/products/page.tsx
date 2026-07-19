"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SmartImage } from "@/components/ui/smart-image";
import type { Product, Category } from "@/types";
import { cn } from "@/lib/utils";
import { getProductDisplayId, getProductDisplaySrc, getProductImagePrompt } from "@/lib/product-media";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<(Product & { category?: Category })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchData() {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*, category:categories(*), variants:product_variants(*)"),
      supabase.from("categories").select("*"),
    ]);
    if (prods) setProducts(prods);
    if (cats) setCategories(cats);
    setLoading(false);
  }

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
  }, []);

  const handleDelete = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    await fetchData();
    setDeleteId(null);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm mt-1 text-white/55">Manage your product inventory</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 font-semibold text-slate-950 transition-colors hover:bg-white/90"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/10"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/10"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden backdrop-blur-xl">
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded bg-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.04] text-white/55 font-medium">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Variants</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1a1224] rounded-lg overflow-hidden flex-shrink-0">
                          <SmartImage
                            src={getProductDisplaySrc(product, product.variants?.[0])}
                            alt=""
                            fallbackPrompt={getProductImagePrompt(product, product.variants?.[0])}
                            fallbackSrc={getProductDisplaySrc(product)}
                            imageSize="square"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-white">{product.name}</p>
                          <p className="text-xs text-white/40">UUID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/68 font-medium">{getProductDisplayId(product)}</td>
                    <td className="px-6 py-4 text-white/55">{product.category?.name}</td>
                    <td className="px-6 py-4 text-white/55">{product.sub_type || product.product_type}</td>
                    <td className="px-6 py-4 text-white/55">{product.variants?.length || 0}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold",
                        product.status === "active" ? "bg-emerald-500/12 text-emerald-300" : "bg-red-500/12 text-red-300"
                      )}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors"
                        >
                          <Edit size={16} className="text-fuchsia-300" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-rose-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-white/45">
                      No products found. Add your first product!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#140b20] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4 text-white">
            <h3 className="text-lg font-bold mb-2">Delete Product</h3>
            <p className="mb-6 text-white/55">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-white/10 rounded-lg hover:bg-white/[0.05]">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
