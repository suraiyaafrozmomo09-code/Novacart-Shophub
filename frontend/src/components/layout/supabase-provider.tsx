"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildFallbackProfile(authUser: SupabaseAuthUser): UserProfile {
  return {
    id: authUser.id,
    email: authUser.email || "",
    full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || "",
    phone: authUser.user_metadata?.phone || "",
    role: authUser.user_metadata?.role === "admin" ? "admin" : "customer",
    created_at: authUser.created_at || new Date().toISOString(),
  };
}

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveUser = async (authUser: SupabaseAuthUser) => {
      setLoading(true);

      const fallbackProfile = buildFallbackProfile(authUser);
      
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (!error && data) {
          setUser(data);
        } else {
          setUser(fallbackProfile);
        }
      } catch {
        setUser(fallbackProfile);
      }

      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await resolveUser(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await resolveUser(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a SupabaseProvider");
  }
  return context;
}
