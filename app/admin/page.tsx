"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Printer } from "lucide-react";
import Shell from "@/components/Shell";
import { supabase, useProfile } from "@/lib/supabase";
import type { ReportRow } from "@/lib/types";

type Row = Omit<ReportRow, "data">;

export default function AdminHome() {
  const { profile, loading } = useProfile();
  const router = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [emp, setEmp] = useState("");

  useEffect(() => {
    if (!loading && profile && profile.role !== "admin") router.replace("/employee");
  }, [loading, profile, router]);

  useEffect(() => {
    if (profile?.role !== "admin") return;
    supabase().from("reports")
      .select("id, report_no, status, employee_id, employee_name, client_name, issue_date, overall_status, export_count, last_exported_at, created_at, updated_at, completed_at, overall_note")
      .order("issue_date", { ascending: false })
      .then(({ data }) => setRows((data as Row[]) ?? []));
  }, [profile]);

  const filtered = useMemo(() => (rows ?? []).filter((r) =>
    (!from || r.issue_date >= from) && (!to || r.issue_date <= to) && (!emp || r.employee_id === emp)
  ), [rows, from, to, emp]);

  const employees = useMemo(() => {
    const m = new Map<string, string>();
    (rows ?? []).forEach((r) => m.set(r.employee_id, r.employee_name || "—"));
    return Array.from(m, ([id, name]) => ({ id, name }));
  }, [rows]);

  const stats = useMemo(() => {
    const per = new Map<string, { name: string; total: number; done: number; exports: number }>();
    filtered.forEach((r) => {
      const s = per.get(r.employee_id) ?? { name: r.employee_name || "—", total: 0, done: 0, exports: 0 };
      s.total++; if (r.status === "completed") s.done++; s.exports += r.export_count;
      per.set(r.employee_id, s);
    });
    return {
      total: filtered.length,
      done: filtered.filter((r) => r.status === "completed").length,
      drafts: filtered.filter((r) => r.status === "draft").length,
      exports: filtered.reduce((a, r) => a + r.export_count, 0),
      per: Array.from(per.values()).sort((a, b) => b.total - a.total),
    };
  }, [filtered]);

  const Stat = ({ label, value }: { label: string; value: number }) => (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-extrabold text-navy">{value}</p>
    </div>
  );

  return (
    <Shell profile={profile} wide>
      <h1 className="mb-4 text-2xl font-extrabold text-navy">لوحة المدير</h1>

      <div className="card mb-4 flex flex-wrap items-end gap-3">
        <div><label className="mb-1 block text-sm font-semibold">من تاريخ</label>
          <input type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><label className="mb-1 block text-sm font-semibold">إلى تاريخ</label>
          <input type="date" className="field" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div><label className="mb-1 block text-sm font-semibold">الموظف</label>
          <select className="field" value={emp} onChange={(e) => setEmp(e.target.value)}>
            <option value="">الكل</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select></div>
        {(from || to || emp) && (
          <button className="btn-ghost" onClick={() => { setFrom(""); setTo(""); setEmp(""); }}>مسح الفلاتر</button>
        )}
      </div>

      {rows === null ? <p className="text-slate-500">جارٍ التحميل…</p> : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="إجمالي التقارير" value={stats.total} />
            <Stat label="تقارير مكتملة" value={stats.done} />
            <Stat label="مسودات قيد العمل" value={stats.drafts} />
            <Stat label="مرات تصدير PDF" value={stats.exports} />
          </div>

          <div className="mb-4 grid gap-4 lg:grid-cols-3">
            <div className="card lg:col-span-1">
              <h2 className="mb-3 font-bold text-navy">التقارير حسب الموظف</h2>
              {stats.per.length === 0 ? <p className="text-sm text-slate-500">لا توجد بيانات.</p> : (
                <table className="w-full text-sm">
                  <thead className="text-slate-500"><tr>
                    <th className="pb-2 text-right">الموظف</th><th className="pb-2">الكل</th>
                    <th className="pb-2">مكتمل</th><th className="pb-2">تصدير</th></tr></thead>
                  <tbody>{stats.per.map((p) => (
                    <tr key={p.name} className="border-t border-slate-100 text-center">
                      <td className="py-2 text-right font-semibold">{p.name}</td>
                      <td>{p.total}</td><td>{p.done}</td><td>{p.exports}</td></tr>))}</tbody>
                </table>
              )}
            </div>

            <div className="card overflow-x-auto lg:col-span-2">
              <h2 className="mb-3 font-bold text-navy">سجل التقارير</h2>
              {filtered.length === 0 ? <p className="text-sm text-slate-500">لا توجد تقارير ضمن هذه الفلاتر.</p> : (
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="text-slate-500"><tr className="text-right">
                    <th className="pb-2">الرقم</th><th className="pb-2">العميل</th><th className="pb-2">الموظف</th>
                    <th className="pb-2">التاريخ</th><th className="pb-2">الحالة</th><th className="pb-2">التصدير</th><th /></tr></thead>
                  <tbody>{filtered.map((r) => (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="py-2 font-bold text-navy">{r.report_no}</td>
                      <td>{r.client_name || "—"}</td><td>{r.employee_name}</td><td>{r.issue_date}</td>
                      <td><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {r.status === "completed" ? "مكتمل" : "مسودة"}</span></td>
                      <td>{r.export_count}</td>
                      <td className="flex justify-end gap-1 py-1.5">
                        <Link className="btn-ghost !px-2 !py-1" href={`/report/${r.id}`}><Pencil size={14} /> تعديل</Link>
                        <Link className="btn-ghost !px-2 !py-1" href={`/print/${r.id}`} target="_blank"><Printer size={14} /> PDF</Link>
                      </td></tr>))}</tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}
