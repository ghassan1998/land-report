export type Tone = "green" | "amber" | "red" | "gray";

export const OVERALL_STATUSES: { v: string; tone: Tone }[] = [
  { v: "مناسب مبدئياً", tone: "green" },
  { v: "يحتاج تحقق", tone: "amber" },
  { v: "غير مناسب", tone: "red" },
];
export const ACCESS_RATINGS: { v: string; tone: Tone }[] = [
  { v: "جيد", tone: "green" },
  { v: "متوسط", tone: "amber" },
  { v: "سيء", tone: "red" },
];
export const UTIL_STATUSES: { v: string; tone: Tone }[] = [
  { v: "متوفر", tone: "green" },
  { v: "غير مؤكد", tone: "amber" },
  { v: "غير متوفر", tone: "red" },
];
export const SUIT_RATINGS: { v: string; tone: Tone }[] = [
  { v: "مناسب جداً", tone: "green" },
  { v: "مناسب", tone: "green" },
  { v: "متوسط", tone: "amber" },
  { v: "غير مناسب", tone: "red" },
];
export const CONFIDENCE: { v: string; tone: Tone }[] = [
  { v: "عالٍ", tone: "green" },
  { v: "متوسط", tone: "amber" },
  { v: "منخفض", tone: "red" },
  { v: "غير متوفر", tone: "gray" },
];
export const toneOf = (list: { v: string; tone: Tone }[], v: string): Tone =>
  list.find((x) => x.v === v)?.tone ?? "gray";

export const UTILITIES = [
  { key: "electricity", label: "الكهرباء" },
  { key: "water", label: "المياه" },
  { key: "sewage", label: "الصرف الصحي" },
  { key: "roads", label: "الطرق المعبّدة" },
] as const;

export const AMENITIES = [
  { key: "commercial", label: "مراكز تجارية" },
  { key: "schools", label: "مدارس" },
  { key: "health", label: "مراكز صحية" },
  { key: "mosque", label: "مسجد" },
  { key: "market", label: "سوق / بقالة" },
  { key: "parks", label: "حدائق وترفيه" },
] as const;

export const USES = [
  { key: "house", label: "بناء منزل" },
  { key: "residentialInv", label: "استثمار سكني" },
  { key: "commercial", label: "تجاري" },
  { key: "agri", label: "زراعي" },
  { key: "devInv", label: "استثمار تطوير" },
] as const;

export const SOURCES = [
  { key: "googleEarth", label: "Google Earth", sub: "(صور جوية وإحداثيات)" },
  { key: "gis", label: "GIS خرائط", sub: "(الأرض وقطعة الأرض)" },
  { key: "zoningMap", label: "المخطط التنظيمي", sub: "(من المرفق)" },
  { key: "local", label: "معلومات محلية", sub: "(خدمات ومرافق)" },
] as const;

type Util = { status: string; distance: string; note: string };

export type ReportData = {
  summary: string;
  positives: string[];
  verify: string[];
  risks: string[];
  parcel: {
    governorate: string; directorate: string; village: string; basin: string;
    parcelNo: string; dlsKey: string; coords: string; crs: string; area: string;
  };
  aerial: string[];
  topo: {
    max: string; min: string; diff: string; slope: string;
    direction: string; terrain: string; impact: string;
  };
  zoning: {
    use: string; buildPct: string; floors: string; front: string; side: string;
    minArea: string; minFront: string; restrictions: string;
  };
  access: { rating: string; frontage: string; distance: string };
  utilities: Record<string, Util>;
  surroundings: { character: string[]; amenities: Record<string, string> };
  suitability: { ratings: Record<string, string>; notes: string };
  conclusion: {
    headline: string; text: string;
    sources: Record<string, boolean>; confidence: string;
  };
  images: { parcelMap: string; aerialMap: string; topoMap: string; zoningMap: string };
};

export const defaultData = (): ReportData => ({
  summary: "",
  positives: [""], verify: [""], risks: [""],
  parcel: {
    governorate: "", directorate: "", village: "", basin: "",
    parcelNo: "", dlsKey: "", coords: "", crs: "WGS84", area: "",
  },
  aerial: [""],
  topo: { max: "", min: "", diff: "", slope: "", direction: "", terrain: "", impact: "" },
  zoning: {
    use: "", buildPct: "", floors: "", front: "", side: "",
    minArea: "", minFront: "", restrictions: "",
  },
  access: { rating: "جيد", frontage: "", distance: "" },
  utilities: Object.fromEntries(
    UTILITIES.map((u) => [u.key, { status: "غير مؤكد", distance: "", note: "" }])
  ),
  surroundings: {
    character: [""],
    amenities: Object.fromEntries(AMENITIES.map((a) => [a.key, ""])),
  },
  suitability: {
    ratings: Object.fromEntries(USES.map((u) => [u.key, "متوسط"])),
    notes: "",
  },
  conclusion: {
    headline: "", text: "",
    sources: Object.fromEntries(SOURCES.map((s) => [s.key, false])),
    confidence: "متوسط",
  },
  images: { parcelMap: "", aerialMap: "", topoMap: "", zoningMap: "" },
});

// يدمج بيانات محفوظة مع القيم الافتراضية حتى لا ينهار القالب إذا نقص حقل
export function mergeData(saved: unknown): ReportData {
  const base = defaultData() as any;
  const merge = (b: any, s: any): any => {
    if (Array.isArray(b)) return Array.isArray(s) && s.length ? s : b;
    if (b && typeof b === "object") {
      const out: any = {};
      for (const k of Object.keys(b)) out[k] = merge(b[k], s?.[k]);
      return out;
    }
    return s === undefined || s === null ? b : s;
  };
  return merge(base, saved) as ReportData;
}

export type ReportRow = {
  id: string; report_no: string; status: "draft" | "completed";
  employee_id: string; employee_name: string; client_name: string;
  issue_date: string; overall_status: string; overall_note: string;
  data: unknown; export_count: number; last_exported_at: string | null;
  created_at: string; updated_at: string; completed_at: string | null;
};

export const DISCLAIMER = [
  "هذا التقرير هو تقييم فني أولي يعتمد على البيانات والمصادر المتاحة والمعلومات المقدمة من العميل.",
  "ولا يُغني عن إجراء زيارة ميدانية أو رفع مساحي أو أعمال فحص التربة أو التحقق من الخدمات مبدئياً.",
  "وعليه، فإن النتائج والتوصيات الواردة في التقرير هي لأغراض الاسترشاد واتخاذ القرار الأولي فقط.",
  "ولا تعتبر بديلاً عن المخططات الرسمية أو الرفع المساحي أو الدراسات الهندسية أو التحقق من الجهات المختصة.",
];
