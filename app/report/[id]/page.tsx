"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Printer } from "lucide-react";
import Shell from "@/components/Shell";
import ReportTemplate, { type ReportMeta } from "@/components/ReportTemplate";
import { Area, Choice, Field, Group, ImageField, ListEditor } from "@/components/Fields";
import { supabase, useProfile } from "@/lib/supabase";
import {
  ACCESS_RATINGS, AMENITIES, CONFIDENCE, OVERALL_STATUSES, SOURCES, SUIT_RATINGS, UTIL_STATUSES,
  USES, UTILITIES, mergeData, type ReportData, type ReportRow,
} from "@/lib/types";
import { getIn, setIn } from "@/lib/utils";

const STEPS = [
  "البيانات الأساسية", "ملخص تنفيذي", "معلومات القطعة", "الموقع العام", "الطبوغرافيا",
  "التنظيم والتخطيط", "الوصول والطرق", "الخدمات", "المحيط", "الملاءمة", "الخلاصة والمصادر", "المراجعة والتصدير",
];

function Scaled({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el); setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const s = w / 1024;
  return (
    <div ref={ref} className="relative w-full overflow-hidden rounded-lg border border-slate-300 bg-white" style={{ height: 1536 * s }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 1024, height: 1536, transform: `scale(${s})`, transformOrigin: "top right" }}>
        {children}
      </div>
    </div>
  );
}

export default function ReportWizard() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useProfile();
  const [meta, setMeta] = useState<ReportMeta | null>(null);
  const [status, setStatus] = useState<"draft" | "completed">("draft");
  const [data, setData] = useState<ReportData | null>(null);
  const [step, setStep] = useState(0);
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [over, setOver] = useState(false);
  const [err, setErr] = useState("");
  const dirty = useRef(false);

  useEffect(() => {
    (async () => {
      const { data: r, error } = await supabase().from("reports").select("*").eq("id", id).single();
      if (error || !r) return setErr("لم يتم العثور على التقرير أو لا تملك صلاحية فتحه.");
      const row = r as ReportRow;
      setMeta({ report_no: row.report_no, issue_date: row.issue_date, client_name: row.client_name,
        employee_name: row.employee_name, overall_status: row.overall_status, overall_note: row.overall_note });
      setStatus(row.status);
      setData(mergeData(row.data));
      const saved = Number(sessionStorage.getItem(`step-${id}`) ?? 0);
      if (saved) setStep(saved);
    })();
  }, [id]);

  const persist = useCallback(async (m: ReportMeta, d: ReportData, extra: Record<string, unknown> = {}) => {
    setSave("saving");
    const { error } = await supabase().from("reports").update({
      client_name: m.client_name, issue_date: m.issue_date, employee_name: m.employee_name,
      overall_status: m.overall_status, overall_note: m.overall_note, data: d, ...extra,
    }).eq("id", id);
    setSave(error ? "error" : "saved");
    return !error;
  }, [id]);

  // حفظ تلقائي بعد توقف الكتابة
  useEffect(() => {
    if (!dirty.current || !meta || !data) return;
    const t = setTimeout(() => persist(meta, data), 1200);
    return () => clearTimeout(t);
  }, [meta, data, persist]);

  const go = (n: number) => { setStep(n); sessionStorage.setItem(`step-${id}`, String(n)); window.scrollTo({ top: 0 }); };
  const up = (path: string, v: unknown) => { dirty.current = true; setData((d) => d && setIn(d, path, v)); };
  const upMeta = (k: keyof ReportMeta, v: string) => { dirty.current = true; setMeta((m) => m && { ...m, [k]: v }); };

  if (err) return <Shell profile={profile}><p className="card text-red-700">{err}</p></Shell>;
  if (!meta || !data) return <Shell profile={profile}><p className="text-slate-500">جارٍ التحميل…</p></Shell>;

  const t = (label: string, path: string, o: { max?: number; ltr?: boolean; placeholder?: string; full?: boolean } = {}) =>
    <Field key={path} label={label} value={getIn(data, path)} onChange={(v) => up(path, v)} {...o} />;
  const img = (label: string, key: keyof ReportData["images"], hint?: string) =>
    <ImageField label={label} hint={hint} value={data.images[key]} reportId={id} name={key}
      onChange={(u) => up(`images.${key}`, u)} />;

  async function complete() {
    if (!meta || !data) return;
    const ok = await persist(meta, data, { status: "completed", completed_at: new Date().toISOString() });
    if (ok) { setStatus("completed"); window.open(`/print/${id}`, "_blank"); }
  }

  const body = [
    // 0
    <Group key={0}>
      <Field label="رقم التقرير (تلقائي)" value={meta.report_no} onChange={() => {}} ltr />
      <Field label="تاريخ الإصدار" type="date" value={meta.issue_date} onChange={(v) => upMeta("issue_date", v)} />
      <Field label="العميل" value={meta.client_name} onChange={(v) => upMeta("client_name", v)} max={40} />
      <Field label="الموظف المسؤول" value={meta.employee_name} onChange={(v) => upMeta("employee_name", v)} max={40} />
      <Choice full label="الحالة العامة للتقييم" value={meta.overall_status} onChange={(v) => upMeta("overall_status", v)} options={OVERALL_STATUSES} />
      <Field full label="ملاحظة الحالة" placeholder="مثال: مع ضرورة التحقق من بعض النقاط" max={70}
        value={meta.overall_note} onChange={(v) => upMeta("overall_note", v)} />
    </Group>,
    // 1
    <Group key={1}>
      <Area label="النص التنفيذي" value={data.summary} max={300} rows={5} onChange={(v) => up("summary", v)} />
      <ListEditor label="أبرز الإيجابيات" items={data.positives} max={3} maxLen={45} onChange={(v) => up("positives", v)} />
      <ListEditor label="نقاط تحتاج إلى تحقق" items={data.verify} max={3} maxLen={45} onChange={(v) => up("verify", v)} />
      <ListEditor label="مخاطر محتملة" items={data.risks} max={3} maxLen={45} onChange={(v) => up("risks", v)} />
    </Group>,
    // 2
    <Group key={2}>
      {t("المحافظة", "parcel.governorate", { max: 25 })}{t("المديرية", "parcel.directorate", { max: 25 })}
      {t("القرية", "parcel.village", { max: 25 })}{t("الحوض", "parcel.basin", { max: 25 })}
      {t("رقم القطعة", "parcel.parcelNo", { max: 15 })}{t("المساحة (م²)", "parcel.area", { max: 15 })}
      {t("DLS Key", "parcel.dlsKey", { max: 20, ltr: true })}
      {t("الإحداثيات التقريبية", "parcel.coords", { max: 35, ltr: true, placeholder: "32.0075° N, 35.8456° E" })}
      {t("نظام الإحداثيات", "parcel.crs", { max: 15, ltr: true })}
      {img("مخطط القطعة على الخريطة", "parcelMap", "صورة مربعة تقريباً تعطي أفضل نتيجة")}
    </Group>,
    // 3
    <Group key={3}>
      {img("صورة جوية / Google Earth مع حدود القطعة", "aerialMap")}
      <ListEditor label="أهم الملاحظات من الصورة الجوية" items={data.aerial} max={4} maxLen={90} onChange={(v) => up("aerial", v)} />
    </Group>,
    // 4
    <Group key={4}>
      {img("خريطة الكنتور / المناسيب", "topoMap")}
      {t("أعلى منسوب", "topo.max", { max: 15 })}{t("أقل منسوب", "topo.min", { max: 15 })}
      {t("فرق المنسوب", "topo.diff", { max: 15 })}{t("متوسط الانحدار (%)", "topo.slope", { max: 15 })}
      {t("اتجاه الانحدار", "topo.direction", { max: 25 })}{t("طبيعة التضاريس", "topo.terrain", { max: 50 })}
      <Area label="التأثير على البناء" value={data.topo.impact} max={160} rows={3} onChange={(v) => up("topo.impact", v)} />
    </Group>,
    // 5
    <Group key={5}>
      {img("مقتطع المخطط التنظيمي الرسمي", "zoningMap")}
      {t("نوع الاستعمال", "zoning.use", { max: 25 })}{t("نسبة البناء", "zoning.buildPct", { max: 15 })}
      {t("عدد الطوابق المسموح", "zoning.floors", { max: 25 })}{t("الارتدادات الأمامية", "zoning.front", { max: 15 })}
      {t("الارتدادات الجانبية والخلفية", "zoning.side", { max: 15 })}{t("الحد الأدنى للمساحة", "zoning.minArea", { max: 15 })}
      {t("الحد الأدنى للواجهة", "zoning.minFront", { max: 15 })}{t("القيود الخاصة", "zoning.restrictions", { max: 40 })}
    </Group>,
    // 6
    <Group key={6}>
      <Choice full label="تقييم الوصول" value={data.access.rating} onChange={(v) => up("access.rating", v)} options={ACCESS_RATINGS} />
      {t("الواجهة على الشارع", "access.frontage", { max: 60 })}
      {t("المسافة إلى الشارع الرئيسي", "access.distance", { max: 30 })}
    </Group>,
    // 7
    <div key={7}>{UTILITIES.map((u) => (
      <Group key={u.key} title={u.label}>
        <Choice full label="الحالة" value={data.utilities[u.key].status} onChange={(v) => up(`utilities.${u.key}.status`, v)} options={UTIL_STATUSES} />
        {t("المسافة", `utilities.${u.key}.distance`, { max: 20, placeholder: "~100 م" })}
        {t("ملاحظة", `utilities.${u.key}.note`, { max: 30, placeholder: "حسب البيانات المتاحة" })}
      </Group>))}</div>,
    // 8
    <Group key={8}>
      <ListEditor label="طبيعة المنطقة" items={data.surroundings.character} max={3} maxLen={80} onChange={(v) => up("surroundings.character", v)} />
      {AMENITIES.map((a) => t(a.label, `surroundings.amenities.${a.key}`, { max: 20, placeholder: "حوالي 800 م" }))}
    </Group>,
    // 9
    <Group key={9}>
      {USES.map((u) => (
        <Choice key={u.key} full label={u.label} value={data.suitability.ratings[u.key]}
          onChange={(v) => up(`suitability.ratings.${u.key}`, v)} options={SUIT_RATINGS} />))}
      <Area label="ملاحظات" value={data.suitability.notes} max={140} rows={3} onChange={(v) => up("suitability.notes", v)} />
    </Group>,
    // 10
    <Group key={10}>
      {t("عنوان التوصية", "conclusion.headline", { max: 40, placeholder: meta.overall_status, full: true })}
      <Area label="الخلاصة والتوصية النهائية" value={data.conclusion.text} max={220} rows={4} onChange={(v) => up("conclusion.text", v)} />
      <div className="md:col-span-2">
        <p className="mb-2 text-sm font-semibold">مصادر البيانات المستخدمة</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SOURCES.map((s) => (
            <label key={s.key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
              <input type="checkbox" className="h-4 w-4 accent-[#0D3B66]" checked={data.conclusion.sources[s.key]}
                onChange={(e) => up(`conclusion.sources.${s.key}`, e.target.checked)} />
              <span className="font-semibold">{s.label}</span><span className="text-xs text-slate-500">{s.sub}</span>
            </label>))}
        </div>
      </div>
      <Choice full label="مستوى الثقة في البيانات" value={data.conclusion.confidence} onChange={(v) => up("conclusion.confidence", v)} options={CONFIDENCE} />
    </Group>,
    // 11
    <div key={11} className="grid gap-4">
      {over && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>المحتوى أطول من مساحة الصفحة، فقد يُقصّ جزء منه في الـ PDF. اختصر النصوص الطويلة أو قلّل البنود، ثم راجع المعاينة.</div>
        </div>
      )}
      <Scaled><ReportTemplate meta={meta} data={data} onOverflow={setOver} /></Scaled>
    </div>,
  ];

  const saveLabel = { idle: "", saving: "جارٍ الحفظ…", saved: "تم الحفظ تلقائياً", error: "تعذّر الحفظ — تحقق من الاتصال" }[save];

  return (
    <Shell profile={profile}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-navy">{meta.report_no}</h1>
          <p className="text-sm text-slate-500">{status === "completed" ? "تقرير مكتمل — يمكنك تعديله وإعادة تصديره" : "مسودة"}</p>
        </div>
        <span className={`text-sm ${save === "error" ? "text-red-600" : "text-slate-500"}`}>{saveLabel}</span>
      </div>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => go(i)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold transition ${
              i === step ? "bg-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-mist"}`}>
            {i < 11 ? `${i}. ` : ""}{s}
          </button>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-4 text-xl font-extrabold text-navy">{STEPS[step]}</h2>
        {body[step]}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button className="btn-ghost" disabled={step === 0} onClick={() => go(step - 1)}><ArrowRight size={18} /> السابق</button>
        {step < 11 ? (
          <button className="btn-primary" onClick={() => go(step + 1)}>التالي <ArrowLeft size={18} /></button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Link className="btn-ghost" href={`/print/${id}`} target="_blank"><Printer size={18} /> تصدير PDF</Link>
            {status === "draft" && (
              <button className="btn-primary" onClick={complete}><CheckCircle2 size={18} /> إنهاء التقرير وتصديره</button>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
