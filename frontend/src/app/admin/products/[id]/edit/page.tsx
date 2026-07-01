"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, X, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Category, ProductVariant } from "@/types";
import { cn } from "@/lib/utils";

interface VariantForm {
  id?: string;
  size: string;
  color: string;
  price: string;
  quantity: string;
  image: string;
  sku: string;
}

const createEmptyVariant = (): VariantForm => ({
  size: "",
  color: "",
  price: "",
  quantity: "",
  image: "",
  sku: "",
});

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCode, setProductCode] = useState("");
  const [initialVariantIds, setInitialVariantIds] = useState<string[]>([]);
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
  const [variants, setVariants] = useState<VariantForm[]>([]);

  const fetchData = useCallback(async () => {
    const productId = typeof params.id === "string" ? params.id : params.id?.[0];
    if (!productId) {
      setLoadError("Unable to load this product.");
      setLoading(false);
      return;
    }

    setLoadError("");

    const [
      { data: product, error: productError },
      { data: cats, error: categoriesError },
      { data: variantRows, error: variantsError },
    ] = await Promise.all([
      supabase.from("products").select("*").eq("id", productId).maybeSingle(),
      supabase.from("categories").select("*").order("name"),
      supabase.from("product_variants").select("*").eq("product_id", productId).order("created_at"),
    ]);

    if (categoriesError) {
      setLoadError(categoriesError.message);
    }
    if (cats) {
      setCategories(cats);
    }

    if (productError || !product) {
      setLoadError(productError?.message || "Product details could not be loaded.");
      setLoading(false);
      return;
    }

    if (variantsError) {
      setLoadError(variantsError.message);
    }

    setProductCode(product.product_code || "");
    setFormData({
      name: product.name || "",
      description: product.description || "",
      category_id: product.category_id || "",
      brand: product.brand || "",
      gender: product.gender || "unisex",
      product_type: product.product_type || "",
      sub_type: product.sub_type || "",
      status: product.status || "active",
    });

    const mappedVariants = (variantRows || []).map((v: ProductVariant) => ({
      id: v.id,
      size: v.size || "",
      color: v.color || "",
      price: v.price?.toString?.() || "",
      quantity: v.quantity?.toString?.() || "",
      image: v.image || "",
      sku: v.sku || "",
    }));

    setInitialVariantIds(mappedVariants.map((variant) => variant.id!).filter(Boolean));
    setVariants(mappedVariants.length > 0 ? mappedVariants : [createEmptyVariant()]);
    setLoading(false);
  }, [params.id]);

  const handleGenderChange = (value: string) => {
    const nextGender = value as "male" | "female" | "unisex";
    setFormData({ ...formData, gender: nextGender });
  };

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
  }, [fetchData]);

  const addVariant = () => {
    setVariants([...variants, createEmptyVariant()]);
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
    setSaving(true);
    const productId = typeof params.id === "string" ? params.id : params.id?.[0];

    if (!productId) {
      setLoadError("Unable to save this product.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase.from("products").update(formData).eq("id", productId);
    if (updateError) {
      setLoadError(updateError.message);
      setSaving(false);
      return;
    }

    const existingVariants = variants.filter((v) => v.id);
    const currentVariantIds = new Set(existingVariants.map((v) => v.id!));

    for (const variant of existingVariants) {
      const { error } = await supabase.from("product_variants").update({
        size: variant.size || null,
        color: variant.color || null,
        price: parseFloat(variant.price) || 0,
        quantity: parseInt(variant.quantity) || 0,
        image: variant.image || null,
        sku: variant.sku,
      }).eq("id", variant.id);

      if (error) {
        setLoadError(error.message);
        setSaving(false);
        return;
      }
    }

    const newVariants = variants.filter((v) => !v.id && (v.price || v.quantity || v.size || v.color || v.image || v.sku));
    for (let i = 0; i < newVariants.length; i++) {
      const variant = newVariants[i];
      const insertData = {
        product_id: productId,
        size: variant.size || null,
        color: variant.color || null,
        price: parseFloat(variant.price) || 0,
        quantity: parseInt(variant.quantity) || 0,
        image: variant.image || null,
        sku: variant.sku || `${productId.slice(0, 8).toUpperCase()}-${String(existingVariants.length + i + 1).padStart(3, "0")}`,
      };
      const { error } = await supabase.from("product_variants").insert(insertData);
      if (error) {
        setLoadError(error.message);
        setSaving(false);
        return;
      }
    }

    const deletedIds = initialVariantIds.filter((id) => !currentVariantIds.has(id));
    for (const id of deletedIds) {
      const { error } = await supabase.from("product_variants").delete().eq("id", id);
      if (error) {
        setLoadError(error.message);
        setSaving(false);
        return;
      }
    }

    router.push("/admin/products");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
        <p className="text-slate-600 text-sm mt-1">Update product information and variants</p>
        {productCode && <p className="text-sm text-slate-500 mt-2">Product code: <span className="font-semibold text-slate-900">{productCode}</span></p>}
      </div>

      {loadError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {loadError}
        </div>
      )}

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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                  <input
                    type="text"
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Sub Type</label>
                  <input
                    type="text"
                    value={formData.sub_type}
                    onChange={(e) => setFormData({ ...formData, sub_type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">Variants</h3>
              <button type="button" onClick={addVariant} className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium">
                <Plus size={16} /> Add Variant
              </button>
            </div>
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="p-4 border border-slate-200 rounded-xl relative">
                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(index)} className="absolute top-2 right-2 p-1 hover:bg-red-50 rounded-md">
                      <X size={16} className="text-red-500" />
                    </button>
                  )}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Size</label>
                      <input type="text" value={variant.size} onChange={(e) => updateVariant(index, "size", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Color</label>
                      <input type="text" value={variant.color} onChange={(e) => updateVariant(index, "color", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Price</label>
                      <input type="number" step="0.01" value={variant.price} onChange={(e) => updateVariant(index, "price", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Qty</label>
                      <input type="number" value={variant.quantity} onChange={(e) => updateVariant(index, "quantity", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Image</label>
                      <input type="url" value={variant.image} onChange={(e) => updateVariant(index, "image", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">SKU</label>
                      <input type="text" value={variant.sku} onChange={(e) => updateVariant(index, "sku", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Status</h3>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-orange-600/20",
                saving && "opacity-50 cursor-not-allowed"
              )}
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
