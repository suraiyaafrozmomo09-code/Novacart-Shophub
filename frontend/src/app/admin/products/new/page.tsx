"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

interface VariantForm {
  size: string;
  color: string;
  price: string;
  quantity: string;
  image: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    brand: "",
    gender: "unisex" as "male" | "female" | "unisex",
    product_type: "",
    sub_type: "",
    status: "active" as "active" | "inactive",
  });
  const [variants, setVariants] = useState<VariantForm[]>([
    { size: "", color: "", price: "", quantity: "", image: "" }
  ]);

  const handleGenderChange = (value: string) => {
    const nextGender = value as "male" | "female" | "unisex";
    setFormData({ ...formData, gender: nextGender });
  };

  useEffect(() => {
    supabase.from("categories").select("*").then(({ data }) => data && setCategories(data));
  }, []);

  const addVariant = () => {
    setVariants([...variants, { size: "", color: "", price: "", quantity: "", image: "" }]);
  };

  const updateVariant = (index: number, field: keyof VariantForm, value: string) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        ...formData,
        average_rating: 0,
        review_count: 0,
      })
      .select()
      .single();

    if (productError || !product) {
      setLoading(false);
      return;
    }

    const variantData = variants
      .filter((v) => v.price && v.quantity)
      .map((v, idx) => ({
        product_id: product.id,
        size: v.size || null,
        color: v.color || null,
        price: parseFloat(v.price),
        quantity: parseInt(v.quantity),
        image: v.image || null,
        sku: `${product.id.slice(0, 8).toUpperCase()}-${String(idx + 1).padStart(3, "0")}`,
      }));

    await supabase.from("product_variants").insert(variantData);
    router.push("/admin/products");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
        <p className="text-slate-600 text-sm mt-1">Create a new product with variants</p>
        <p className="text-sm text-slate-500 mt-2">A unique product code will be assigned automatically when the product is created.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleGenderChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="unisex">Unisex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Type</label>
                  <input
                    type="text"
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    placeholder="e.g., clothing, electronics"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Sub Type</label>
                  <input
                    type="text"
                    value={formData.sub_type}
                    onChange={(e) => setFormData({ ...formData, sub_type: e.target.value })}
                    placeholder="e.g., shirt, t-shirt"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Product Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                <Plus size={16} />
                Add Variant
              </button>
            </div>
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-xl relative">
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="absolute top-2 right-2 p-1 hover:bg-red-50 rounded-md"
                    >
                      <X size={16} className="text-red-500" />
                    </button>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Size</label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariant(index, "size", e.target.value)}
                        placeholder="S, M, L, XL"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Color</label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => updateVariant(index, "color", e.target.value)}
                        placeholder="Red, Blue, Black"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, "price", e.target.value)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={variant.quantity}
                        onChange={(e) => updateVariant(index, "quantity", e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Image URL</label>
                      <input
                        type="url"
                        value={variant.image}
                        onChange={(e) => updateVariant(index, "image", e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Product Options</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-600/20",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Save size={18} />
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
