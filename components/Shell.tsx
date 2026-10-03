"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, MapPinned } from "lucide-react";
import { supabase, type Profile } from "@/lib/supabase";

export default function Shell({
  profile, children, wide,
}: { profile: Profile | null; children: React.ReactNode; wide?: boolean }) {
  const router = useRouter();
  const home = profile?.role === "admin" ? "/admin" : "/employee";
  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-slate-200 bg-navy text-white">
        <div className={`mx-auto flex items-center justify-between px-4 py-3 ${wide ? "max-w-7xl" : "max-w-5xl"}`}>
          <Link href={home} className="flex items-center gap-2 text-lg font-extrabold">
            <MapPinned size={22} /> تقارير التقييم الفني للأراضي
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {profile && (
              <span>
                {profile.full_name}
                <span className="mr-2 rounded bg-white/15 px-2 py-0.5 text-xs">
                  {profile.role === "admin" ? "مدير" : "موظف"}
                </span>
              </span>
            )}
            <button
              className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 hover:bg-white/20"
              onClick={async () => { await supabase().auth.signOut(); router.replace("/login"); router.refresh(); }}
            >
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>
      </header>
      <main className={`mx-auto px-4 py-6 ${wide ? "max-w-7xl" : "max-w-5xl"}`}>{children}</main>
    </div>
  );
}
