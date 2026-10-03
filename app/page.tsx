"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/supabase";

export default function Home() {
  const { profile, loading } = useProfile();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    router.replace(profile?.role === "admin" ? "/admin" : "/employee");
  }, [loading, profile, router]);
  return <p className="p-10 text-center text-slate-500">جارٍ التحميل…</p>;
}
