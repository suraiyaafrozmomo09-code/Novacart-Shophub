"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("*").order("name");
    if (data) setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    const loadCategories = async () => {
      await fetchCategories();
    };

    void loadCategories();
  }, []);

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || "");
    } else {
      setEditingCategory(null);
      setName("");
      setSlug("");
      setDescription("");
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      await supabase.from("categories").update({ name, slug, description }).eq("id", editingCategory.id);
    } else {
      await supabase.from("categories").insert({ name, slug, description });
    }
    setShowModal(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    fetchCategories();
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-600 text-sm mt-1">Manage product categories</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold shadow-lg shadow-orange-600/20 transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                  <td className="px-6 py-4 text-slate-600">{cat.slug}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{cat.description || "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(cat)} className="p-2 hover:bg-orange-50 rounded-lg transition-colors">
                        <Edit size={16} className="text-orange-600" />
                      </button>
                      <button onClick={() => setDeleteId(cat.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editingCategory ? "Edit Category" : "New Category"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Slug</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700">{editingCategory ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Category</h3>
            <p className="text-slate-600 mb-6">Are you sure? Products in this category will be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
