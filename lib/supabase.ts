"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

let client: ReturnType<typeof createBrowserClient> | null = null;
export function supabase() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}

export type Profile = { id: string; full_name: string; role: "employee" | "admin" };

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase().auth.getUser();
      if (u.user) {
        const { data } = await supabase()
          .from("profiles").select("id, full_name, role").eq("id", u.user.id).single();
        setProfile((data as Profile) ?? null);
      }
      setLoading(false);
    })();
  }, []);
  return { profile, loading };
}
