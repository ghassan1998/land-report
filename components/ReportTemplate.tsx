"use client";
import { useEffect, useRef } from "react";
import {
  AlertTriangle, Building2, Calendar, Check, CheckCircle2, Droplets, FileText, GraduationCap,
  HelpCircle, Home, Hospital, Info, Landmark, MapPin, Mountain, Route, ShoppingCart, Store,
  Trees, User, UserCheck, Waves, Zap,
} from "lucide-react";
import {
  ACCESS_RATINGS, AMENITIES, CONFIDENCE, DISCLAIMER, OVERALL_STATUSES, SOURCES, SUIT_RATINGS,
  UTIL_STATUSES, USES, UTILITIES, toneOf, type ReportData, type Tone,
} from "@/lib/types";

export type ReportMeta = {
  report_no: string; issue_date: string; client_name: string;
  employee_name: string; overall_status: string; overall_note: string;
};

const NAVY = "#0D3B66";
const C: Record<Tone, { bg: string; fg: string; solid: string }> = {
  green: { bg: "#e7f5ee", fg: "#17724a", solid: "#1f9d5c" },
  amber: { bg: "#fdf3dc", fg: "#98640a", solid: "#f0a81c" },
  red: { bg: "#fdeaea", fg: "#ad2222", solid: "#e04646" },
  gray: { bg: "#eef0f3", fg: "#555c66", solid: "#9aa1ab" },
};
const dash = (v: string) => (v && v.trim() ? v : "—");
const clean = (a: string[]) => a.map((s) => s.trim()).filter(Boolean);

function Sec({ n, title, children, className = "" }: {
  n: number; title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`shrink-0 overflow-hidden rounded-md border border-[#cfdceb] bg-white ${className}`}>
      <div className="flex items-center px-4 text-white" style={{ background: NAVY, height: 30, fontSize: 16, fontWeight: 800 }}>
        {n}. {title}
      </div>
      <div className="p-2.5">{children}</div>
    </section>
  );
}

function Img({ src, className, label }: { src: string; className: string; label: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  if (src) return <img src={src} alt="" className={`rounded border border-[#cfdceb] object-cover ${className}`} />;
  return (
    <div className={`flex items-center justify-center rounded border border-dashed border-slate-300 bg-slate-100 text-[12px] text-slate-400 ${className}`}>
      {label}
    </div>
  );
}

function Dot({ tone, size = 20 }: { tone: Tone; size?: number }) {
  const Icon = tone === "green" ? Check : tone === "gray" ? Info : AlertTriangle;
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full text-white"
      style={{ background: C[tone].solid, width: size, height: size }}>
      <Icon size={size * 0.62} strokeWidth={3} />
    </span>
  );
}

function Box({ tone, title, icon, items }: { tone: Tone; title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div className="rounded-md p-2" style={{ background: C[tone].bg }}>
      <div className="mb-1 flex items-center gap-1.5 text-[13.5px] font-extrabold" style={{ color: C[tone].fg }}>
        {icon} {title}
      </div>
      <ul className="grid gap-0.5">
        {(items.length ? items : ["—"]).map((t, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[12px] leading-snug text-slate-800">
            <Dot tone={tone === "green" ? "green" : tone} size={15} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const AMENITY_ICON: Record<string, React.ElementType> = {
  commercial: Building2, schools: GraduationCap, health: Hospital,
  mosque: Landmark, market: ShoppingCart, parks: Trees,
};
const UTIL_ICON: Record<string, React.ElementType> = {
  electricity: Zap, water: Droplets, sewage: Waves, roads: Route,
};

export default function ReportTemplate({ meta, data, onOverflow }: {
  meta: ReportMeta; data: ReportData; onOverflow?: (over: boolean) => void;
}) {
  const colA = useRef<HTMLDivElement>(null);
  const colB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      const over = [colA.current, colB.current].some((el) => el && el.scrollHeight > el.clientHeight + 1);
      onOverflow?.(over);
    };
    check();
    const t = setTimeout(check, 500);
    return () => clearTimeout(t);
  }, [meta, data, onOverflow]);

  const st = toneOf(OVERALL_STATUSES, meta.overall_status);
  const d = data;
  const headline = d.conclusion.headline || meta.overall_status;

  return (
    <div dir="rtl" className="relative overflow-hidden bg-white text-slate-800"
      style={{ width: 1024, height: 1536, fontFamily: "Cairo, Tajawal, sans-serif" }}>

      {/* ===== الهيدر ===== */}
      <div className="absolute inset-x-0 top-0" style={{ height: 92, background: "linear-gradient(100deg,#ffffff 0%,#eaf1f8 45%,#b9cde2 100%)" }}>
        <svg className="absolute bottom-0 left-0" width="520" height="92" viewBox="0 0 520 92" preserveAspectRatio="none" aria-hidden>
          <path d="M0 92 L90 40 L150 66 L240 18 L330 60 L410 30 L520 70 L520 92Z" fill="#8fa9c4" opacity=".55" />
          <path d="M0 92 L120 58 L210 78 L300 44 L400 74 L520 50 L520 92Z" fill="#5f7f9f" opacity=".5" />
        </svg>
        <MapPin className="absolute" size={58} strokeWidth={1.6} style={{ left: 38, top: 16, color: NAVY }} />
        <div className="absolute" style={{ left: 118, top: 14, color: NAVY, textAlign: "right" }}>
          <div style={{ fontSize: 31, fontWeight: 800, lineHeight: 1.2 }}>تقرير التقييم الفني الأولي للأرض</div>
          <div style={{ fontSize: 17, fontWeight: 600 }}>مساعدة في اتخاذ قرار الشراء</div>
        </div>
        <div className="absolute flex items-center gap-2 text-white" style={{ right: 36, top: 36, fontSize: 17, fontWeight: 700 }}>
          <Mountain size={34} /> تحليل شامل .. لقرار أفضل
        </div>
      </div>

      {/* ===== شريط البيانات الوصفية ===== */}
      <div className="absolute flex overflow-hidden rounded-lg border border-[#cfdceb]" style={{ top: 108, right: 14, left: 14, height: 76, background: "#f3f7fb" }}>
        <div className="flex w-[245px] flex-col items-center justify-center text-center" style={{ background: C[st].bg, borderLeft: "1px solid #cfdceb" }}>
          <div className="text-[13px] font-extrabold" style={{ color: NAVY }}>الحالة العامة للتقييم</div>
          <div className="my-0.5 rounded px-5 py-0.5 text-[16px] font-extrabold text-white" style={{ background: C[st].solid }}>{meta.overall_status}</div>
          <div className="px-2 text-[11.5px] leading-tight text-slate-700">{meta.overall_note || " "}</div>
        </div>
        {[
          { icon: UserCheck, label: "الموظف المسؤول", v: meta.employee_name },
          { icon: User, label: "العميل", v: meta.client_name },
          { icon: Calendar, label: "تاريخ الإصدار", v: meta.issue_date },
          { icon: FileText, label: "رقم التقرير", v: meta.report_no },
        ].map((m, i) => (
          <div key={i} className="flex flex-1 flex-col justify-center px-4" style={{ borderLeft: i < 3 ? "1px solid #dbe5f0" : undefined }}>
            <div className="flex items-center gap-1.5 text-[13px] font-extrabold" style={{ color: NAVY }}>
              <m.icon size={16} /> {m.label}
            </div>
            <div className="mt-1 text-center text-[15px] font-semibold text-slate-800" dir="auto">{dash(m.v)}</div>
          </div>
        ))}
      </div>

      {/* ===== الشبكة الرئيسية ===== */}
      <div className="absolute grid grid-cols-2 gap-4" style={{ top: 198, right: 18, left: 18, height: 1176 }}>
        {/* العمود الأيمن: 5–10 */}
        <div ref={colA} className="flex flex-col justify-between overflow-hidden">
          <Sec n={5} title="التنظيم والتخطيط">
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 150px" }}>
              <div>
                <div className="mb-1 text-[11.5px] font-bold text-slate-600">المعلومات التنظيمية (من المخطط المرفق)</div>
                <table className="w-full border-collapse text-[12px]">
                  <tbody>
                    {([
                      ["نوع الاستعمال", d.zoning.use], ["نسبة البناء", d.zoning.buildPct],
                      ["الطوابق المسموحة", d.zoning.floors], ["الارتدادات الأمامية", d.zoning.front],
                      ["الارتدادات الجانبية/الخلفية", d.zoning.side], ["الحد الأدنى للمساحة", d.zoning.minArea],
                      ["الحد الأدنى للواجهة", d.zoning.minFront], ["القيود الخاصة", d.zoning.restrictions],
                    ] as [string, string][]).map(([k, v]) => (
                      <tr key={k} className="border border-[#dbe5f0]">
                        <td className="w-[52%] whitespace-nowrap bg-[#eef4fa] px-1.5 py-[3px] font-bold" style={{ color: NAVY }}>{k}</td>
                        <td className="px-1.5 py-[3px]">{dash(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Img src={d.images.zoningMap} label="مقتطع المخطط التنظيمي" className="h-[216px] w-full" />
            </div>
            <p className="mt-1 text-[10.5px] leading-snug text-slate-500">
              ملاحظة: تم اعتماد المعلومات التنظيمية الظاهرة في المخطط المرفق لأغراض التقييم الأولي، ويجب التحقق من الجهات المختصة قبل القرار النهائي.
            </p>
          </Sec>

          <Sec n={6} title="الوصول والطرق">
            <div className="flex items-center gap-3">
              <div className="flex w-[140px] flex-col items-center rounded-md py-1" style={{ background: C[toneOf(ACCESS_RATINGS, d.access.rating)].bg }}>
                <div className="text-[13px] font-extrabold" style={{ color: NAVY }}>تقييم الوصول</div>
                <div className="text-[24px] font-extrabold leading-tight" style={{ color: C[toneOf(ACCESS_RATINGS, d.access.rating)].fg }}>{d.access.rating}</div>
              </div>
              <Route size={44} style={{ color: NAVY }} />
              <div className="flex-1 text-[12px] leading-snug">
                <div><b>الواجهة على الشارع:</b> {dash(d.access.frontage)}</div>
                <div><b>المسافة إلى الشارع الرئيسي:</b> {dash(d.access.distance)}</div>
              </div>
            </div>
          </Sec>

          <Sec n={7} title="الخدمات والبنية التحتية">
            <div className="grid grid-cols-2 gap-2">
              {UTILITIES.map((u) => {
                const v = d.utilities[u.key];
                const tone = toneOf(UTIL_STATUSES, v.status);
                const Icon = UTIL_ICON[u.key];
                return (
                  <div key={u.key} className="flex items-center gap-2 rounded-md border border-[#dbe5f0] px-2 py-1">
                    <Dot tone={tone} size={26} />
                    <div className="flex-1 text-[12px] leading-tight">
                      <div className="flex items-center gap-1 font-extrabold" style={{ color: NAVY }}><Icon size={14} /> {u.label}</div>
                      <div>يبعد: {dash(v.distance)}</div>
                      <div className="font-bold" style={{ color: C[tone].fg }}>{v.status}</div>
                      {v.note && <div className="text-[10.5px] text-slate-500">{v.note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Sec>

          <Sec n={8} title="المحيط والخدمات والمناطق">
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="rounded-md bg-[#e7f5ee] p-2">
                <div className="mb-1 text-[13px] font-extrabold" style={{ color: NAVY }}>طبيعة المنطقة</div>
                <ul className="grid gap-0.5 text-[12px] leading-snug">
                  {(clean(d.surroundings.character).length ? clean(d.surroundings.character) : ["—"]).map((t, i) => (
                    <li key={i} className="flex gap-1.5"><span style={{ color: C.green.solid }}>•</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {AMENITIES.map((a) => {
                  const Icon = AMENITY_ICON[a.key] ?? Store;
                  return (
                    <div key={a.key} className="flex items-center gap-1.5 text-[12px] leading-tight">
                      <Icon size={20} style={{ color: NAVY }} className="shrink-0" />
                      <div><div className="font-bold" style={{ color: NAVY }}>{a.label}</div>
                        <div className="text-slate-600">{dash(d.surroundings.amenities[a.key])}</div></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Sec>

          <Sec n={9} title="ملاءمة القطعة للاستخدام المقترح">
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 170px" }}>
              <table className="w-full border-collapse text-[12px]">
                <thead><tr style={{ background: "#eef4fa", color: NAVY }}>
                  <th className="border border-[#dbe5f0] px-2 py-1 text-right">نوع الاستخدام</th>
                  <th className="border border-[#dbe5f0] px-2 py-1 text-right">التقييم</th></tr></thead>
                <tbody>{USES.map((u) => {
                  const r = d.suitability.ratings[u.key]; const t = toneOf(SUIT_RATINGS, r);
                  return (<tr key={u.key}>
                    <td className="border border-[#dbe5f0] px-2 py-[3px] font-semibold">{u.label}</td>
                    <td className="border border-[#dbe5f0] px-2 py-[3px] font-bold" style={{ color: C[t].fg }}>
                      <span className="inline-flex items-center gap-1.5"><Dot tone={t} size={16} />{r}</span></td></tr>);
                })}</tbody>
              </table>
              <div className="rounded-md bg-[#eef4fa] p-2 text-[11.5px] leading-snug">
                <div className="mb-1 flex items-center gap-1 font-extrabold" style={{ color: NAVY }}><Info size={14} /> ملاحظات</div>
                {dash(d.suitability.notes)}
              </div>
            </div>
          </Sec>

          <Sec n={10} title="الخلاصة والتوصية">
            <div className="flex items-center gap-3 rounded-md p-2.5" style={{ background: C[st].bg }}>
              <CheckCircle2 size={40} style={{ color: C[st].solid }} className="shrink-0" />
              <div>
                <div className="text-[20px] font-extrabold leading-tight" style={{ color: C[st].fg }}>{headline}</div>
                <div className="text-[12px] leading-snug">{dash(d.conclusion.text)}</div>
              </div>
            </div>
          </Sec>
        </div>

        {/* العمود الأيسر: 1–4 */}
        <div ref={colB} className="flex flex-col justify-between overflow-hidden">
          <Sec n={1} title="ملخص تنفيذي">
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 215px" }}>
              <div className="grid gap-1.5">
                <Box tone="green" title="أبرز الإيجابيات" icon={<Check size={15} />} items={clean(d.positives)} />
                <Box tone="amber" title="نقاط تحتاج إلى تحقق" icon={<HelpCircle size={15} />} items={clean(d.verify)} />
                <Box tone="red" title="مخاطر محتملة" icon={<AlertTriangle size={15} />} items={clean(d.risks)} />
              </div>
              <div className="flex flex-col items-center rounded-md p-2.5 text-center" style={{ background: C[st].bg }}>
                <span className="mb-1.5 inline-flex h-12 w-12 items-center justify-center rounded-full text-white" style={{ background: C[st].solid }}>
                  <Home size={24} />
                </span>
                <div className="mb-1.5 text-[20px] font-extrabold" style={{ color: C[st].fg }}>{meta.overall_status}</div>
                <p className="text-right text-[12.5px] leading-[1.7] text-slate-800">{dash(d.summary)}</p>
              </div>
            </div>
          </Sec>

          <Sec n={2} title="معلومات قطعة الأرض">
            <div className="grid gap-2" style={{ gridTemplateColumns: "170px 1fr" }}>
              <Img src={d.images.parcelMap} label="مخطط القطعة على الخريطة" className="h-[222px] w-full" />
              <table className="w-full border-collapse text-[12px]">
                <tbody>
                  {([
                    ["المحافظة", d.parcel.governorate], ["المديرية", d.parcel.directorate],
                    ["القرية", d.parcel.village], ["الحوض", d.parcel.basin],
                    ["رقم القطعة", d.parcel.parcelNo], ["المساحة", d.parcel.area ? `${d.parcel.area} م²` : ""],
                    ["DLS Key", d.parcel.dlsKey], ["الإحداثيات", d.parcel.coords],
                    ["نظام الإحداثيات", d.parcel.crs],
                  ] as [string, string][]).map(([k, v]) => (
                    <tr key={k} className="border border-[#dbe5f0]">
                      <td className="w-[40%] whitespace-nowrap bg-[#eef4fa] px-1.5 py-[3px] font-bold" style={{ color: NAVY }}>{k}</td>
                      <td className="px-1.5 py-[3px]" dir="auto">{dash(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Sec>

          <Sec n={3} title="الموقع العام">
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1.5fr" }}>
              <div className="rounded-md bg-[#eef4fa] p-2">
                <div className="mb-1.5 text-[13px] font-extrabold" style={{ color: NAVY }}>أهم الملاحظات من الصورة الجوية</div>
                <ul className="grid gap-1 text-[11.5px] leading-snug">
                  {(clean(d.aerial).length ? clean(d.aerial) : ["—"]).map((t, i) => (
                    <li key={i} className="flex gap-1.5"><span style={{ color: NAVY }}>•</span>{t}</li>
                  ))}
                </ul>
              </div>
              <Img src={d.images.aerialMap} label="صورة جوية / Google Earth" className="h-[185px] w-full" />
            </div>
          </Sec>

          <Sec n={4} title="التحليل الطبوغرافي والتضاريس">
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 170px" }}>
              <div className="rounded-md bg-[#eef4fa] p-2">
                <div className="mb-1 text-[13px] font-extrabold" style={{ color: NAVY }}>أهم النتائج</div>
                <ul className="grid gap-0.5 text-[12px] leading-snug">
                  {([
                    ["أعلى منسوب", d.topo.max], ["أقل منسوب", d.topo.min], ["فرق المنسوب", d.topo.diff],
                    ["متوسط الانحدار", d.topo.slope], ["اتجاه الانحدار", d.topo.direction],
                    ["طبيعة التضاريس", d.topo.terrain],
                  ] as [string, string][]).map(([k, v]) => (
                    <li key={k} className="flex gap-1.5"><span style={{ color: NAVY }}>•</span><b>{k}:</b> {dash(v)}</li>
                  ))}
                </ul>
              </div>
              <Img src={d.images.topoMap} label="خريطة الكنتور / المناسيب" className="h-[165px] w-full" />
            </div>
            <div className="mt-1.5 flex items-start gap-2 rounded-md p-1.5 text-[12px] leading-snug" style={{ background: C.amber.bg }}>
              <Info size={18} style={{ color: C.amber.solid }} className="mt-0.5 shrink-0" />
              <div><b>التأثير على البناء:</b> {dash(d.topo.impact)}</div>
            </div>
          </Sec>
        </div>
      </div>

      {/* ===== مستوى الثقة + المصادر ===== */}
      <div className="absolute flex items-center gap-4 rounded-md border border-[#cfdceb] px-4" style={{ top: 1384, right: 18, left: 18, height: 60, background: "#fbfdff" }}>
        <div className="shrink-0 border-l border-[#dbe5f0] pl-4">
          <div className="mb-1 text-[13px] font-extrabold" style={{ color: NAVY }}>مستوى الثقة في البيانات</div>
          <div className="flex gap-3 text-[12px]">
            {CONFIDENCE.map((c) => (
              <span key={c.v} className="flex items-center gap-1" style={{ fontWeight: d.conclusion.confidence === c.v ? 800 : 400, opacity: d.conclusion.confidence === c.v ? 1 : 0.45 }}>
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: C[c.tone].solid }} />{c.v}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-1 items-center gap-4">
          <div className="text-[13px] font-extrabold" style={{ color: NAVY }}>مصادر البيانات</div>
          {SOURCES.map((s) => (
            <div key={s.key} className="flex-1 text-[11.5px] leading-tight" style={{ opacity: d.conclusion.sources[s.key] ? 1 : 0.3 }}>
              <div className="flex items-center gap-1 font-bold">{d.conclusion.sources[s.key] && <Check size={13} style={{ color: C.green.solid }} strokeWidth={3} />}{s.label}</div>
              <div className="text-slate-500">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== التذييل ===== */}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-6 px-8 text-white" style={{ height: 82, background: NAVY }}>
        <div className="shrink-0 text-center">
          <Mountain size={30} className="mx-auto" />
          <div className="text-[13px] font-bold">تقرير مبدئي .. لقرار أفضل</div>
          <div className="text-[8.5px] tracking-wide opacity-80" dir="ltr">LAND PRELIMINARY ASSESSMENT REPORT</div>
        </div>
        <div className="flex-1 text-[10px] leading-[1.6] opacity-90">
          {DISCLAIMER.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
