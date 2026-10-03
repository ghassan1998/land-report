"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";
import ReportTemplate from "@/components/ReportTemplate";
import { supabase } from "@/lib/supabase";
import { mergeData, type ReportData, type ReportRow } from "@/lib/types";

export default function PrintPage() {
  const { id } = useParams<{ id: string }>();
  const [row, setRow] = useState<ReportRow | null>(null);
  const [data, setData] = useState<ReportData | null>(null);
  const [err, setErr] = useState("");
  const counted = useRef(false);

  useEffect(() => {
    (async () => {
      const { data: r, error } = await supabase().from("reports").select("*").eq("id", id).single();
      if (error || !r) return setErr("لم يتم العثور على التقرير أو لا تملك صلاحية عرضه.");
      setRow(r as ReportRow);
      setData(mergeData((r as ReportRow).data));
      document.title = (r as ReportRow).report_no;
      if (!counted.current) {
        counted.current = true;
        await supabase().rpc("log_export", { rid: id });
      }
    })();
  }, [id]);

  async function printNow() {
    try { await (document as any).fonts?.ready; } catch {}
    const imgs = Array.from(document.images);
    await Promise.all(imgs.map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = i.onerror = () => r(null); }))));
    window.print();
  }

  if (err) return <p className="p-10 text-center text-red-700">{err}</p>;
  if (!row || !data) return <p className="p-10 text-center text-slate-500">جارٍ تجهيز التقرير…</p>;

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <div className="no-print mx-auto flex max-w-[794px] flex-wrap items-center justify-between gap-3 px-2 py-4">
        <div className="text-sm text-slate-700">
          في نافذة الطباعة اختر <b>«حفظ كملف PDF»</b> · الهوامش: <b>بدون</b> · فعّل <b>«الرسومات الخلفية»</b>.
        </div>
        <button className="btn-primary" onClick={printNow}><Printer size={18} /> تنزيل PDF</button>
      </div>
      <div className="overflow-x-auto">
        <div className="sheet mx-auto shadow-lg">
          <div className="sheet-inner">
            <ReportTemplate data={data} meta={row} />
          </div>
        </div>
      </div>
    </div>
  );
}
