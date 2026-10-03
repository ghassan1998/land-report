"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilePlus2, Pencil, Printer, Trash2 } from "lucide-react";
import Shell from "@/components/Shell";
import { supabase, useProfile } from "@/lib/supabase";
import { defaultData, type ReportRow } from "@/lib/types";

export default function EmployeeHome() {
  const { profile } = useProfile();
  const router = useRouter();
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase().from("reports").select("*").order("updated_at", { ascending: false });
    setRows((data as ReportRow[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!profile) return;
    setBusy(true);
    const { data, error } = await supabase().from("reports")
      .insert({ employee_name: profile.full_name, data: defaultData() }).select("id").single();
    setBusy(false);
    if (error || !data) return alert("تعذّر إنشاء التقرير: " + error?.message);
    router.push(`/report/${data.id}`);
  }

  async function remove(id: string) {
    if (!confirm("حذف هذا التقرير نهائياً؟")) return;
    await supabase().from("reports").delete().eq("id", id);
    load();
  }

  return (
    <Shell profile={profile}>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy">تقاريري</h1>
        <button className="btn-primary" onClick={create} disabled={busy || !profile}>
          <FilePlus2 size={18} /> تقرير جديد
        </button>
      </div>

      {rows === null ? <p className="text-slate-500">جارٍ التحميل…</p> :
        rows.length === 0 ? (
          <div className="card text-center text-slate-500">
            لا توجد تقارير بعد. اضغط «تقرير جديد» لبدء أول تقرير.
          </div>
        ) : (
          <div className="grid gap-3">
            {rows.map((r) => (
              <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy">{r.report_no}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {r.status === "completed" ? "مكتمل" : "مسودة"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    العميل: {r.client_name || "—"} · {r.issue_date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link className="btn-ghost" href={`/report/${r.id}`}><Pencil size={16} /> {r.status === "completed" ? "تعديل" : "متابعة"}</Link>
                  <Link className="btn-ghost" href={`/print/${r.id}`} target="_blank"><Printer size={16} /> PDF</Link>
                  {r.status === "draft" && (
                    <button className="btn-danger" onClick={() => remove(r.id)} aria-label="حذف"><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </Shell>
  );
}
