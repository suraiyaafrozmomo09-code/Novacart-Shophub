"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCustomers() {
    const { data } = await supabase.from("users").select("*").eq("role", "customer").order("created_at", { ascending: false });
    if (data) setCustomers(data as UserProfile[]);
    setLoading(false);
  }

  useEffect(() => {
    const loadCustomers = async () => {
      await fetchCustomers();
    };

    void loadCustomers();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-sm mt-1 text-white/55">Manage registered customers</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 space-y-3 backdrop-blur-xl">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded bg-white/10 animate-pulse" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/[0.04] text-white/55 font-medium">
                <tr>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white text-slate-950 rounded-full flex items-center justify-center font-bold text-xs">
                          {customer.full_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-white">{customer.full_name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/55">{customer.email}</td>
                    <td className="px-6 py-4 text-white/55">{customer.phone || "—"}</td>
                    <td className="px-6 py-4 text-white/55">{new Date(customer.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-white/40">{customer.id.slice(0, 8)}</td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-white/45">No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-white/8 p-4">
            <span className="text-sm text-white/45">{customers.length} total customers</span>
          </div>
        </div>
      )}
    </div>
  );
}
