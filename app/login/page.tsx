"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPinned } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setErr("");
    const { error } = await supabase().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr("البريد أو كلمة المرور غير صحيحة.");
    router.replace("/"); router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-navy p-3 text-white"><MapPinned size={26} /></div>
          <div>
            <h1 className="text-xl font-extrabold text-navy">تسجيل الدخول</h1>
            <p className="text-sm text-slate-500">تقارير التقييم الفني للأراضي</p>
          </div>
        </div>
        <label className="mb-1 block text-sm font-semibold">البريد الإلكتروني</label>
        <input className="field mb-4" dir="ltr" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <label className="mb-1 block text-sm font-semibold">كلمة المرور</label>
        <input className="field mb-4" dir="ltr" type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
        {err && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
        <button className="btn-primary w-full" disabled={busy || !email || !password} onClick={submit}>
          {busy ? "جارٍ الدخول…" : "دخول"}
        </button>
      </div>
    </div>
  );
}
