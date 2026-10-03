"use client";
import { useState } from "react";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/utils";
import type { Tone } from "@/lib/types";

const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <label className="mb-1 block text-sm font-semibold text-slate-700">
    {children}
    {hint && <span className="mr-2 text-xs font-normal text-slate-400">{hint}</span>}
  </label>
);

export function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      {title && <h3 className="mb-3 border-b border-slate-200 pb-1 font-bold text-navy">{title}</h3>}
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

export function Field(p: {
  label: string; value: string; onChange: (v: string) => void;
  max?: number; placeholder?: string; ltr?: boolean; type?: string; full?: boolean;
}) {
  return (
    <div className={p.full ? "md:col-span-2" : ""}>
      <Label hint={p.max ? `${p.value.length}/${p.max}` : undefined}>{p.label}</Label>
      <input className="field" type={p.type ?? "text"} dir={p.ltr ? "ltr" : undefined}
        value={p.value} maxLength={p.max} placeholder={p.placeholder}
        onChange={(e) => p.onChange(e.target.value)} />
    </div>
  );
}

export function Area(p: {
  label: string; value: string; onChange: (v: string) => void; max?: number; rows?: number;
}) {
  return (
    <div className="md:col-span-2">
      <Label hint={p.max ? `${p.value.length}/${p.max}` : undefined}>{p.label}</Label>
      <textarea className="field" rows={p.rows ?? 4} value={p.value} maxLength={p.max}
        onChange={(e) => p.onChange(e.target.value)} />
    </div>
  );
}

const toneCls: Record<Tone, string> = {
  green: "border-emerald-600 bg-emerald-600 text-white",
  amber: "border-amber-500 bg-amber-500 text-white",
  red: "border-red-600 bg-red-600 text-white",
  gray: "border-slate-500 bg-slate-500 text-white",
};

export function Choice(p: {
  label: string; value: string; onChange: (v: string) => void;
  options: { v: string; tone: Tone }[]; full?: boolean;
}) {
  return (
    <div className={p.full ? "md:col-span-2" : ""}>
      <Label>{p.label}</Label>
      <div className="flex flex-wrap gap-2">
        {p.options.map((o) => (
          <button type="button" key={o.v} onClick={() => p.onChange(o.v)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-bold transition ${
              p.value === o.v ? toneCls[o.tone] : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}>
            {o.v}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ListEditor(p: {
  label: string; items: string[]; onChange: (v: string[]) => void;
  max?: number; maxLen?: number; placeholder?: string;
}) {
  const max = p.max ?? 4;
  const set = (i: number, v: string) => p.onChange(p.items.map((x, j) => (j === i ? v : x)));
  return (
    <div className="md:col-span-2">
      <Label hint={`حتى ${max} بنود`}>{p.label}</Label>
      <div className="grid gap-2">
        {p.items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input className="field" value={it} maxLength={p.maxLen ?? 80} placeholder={p.placeholder}
              onChange={(e) => set(i, e.target.value)} />
            <button type="button" className="btn-ghost !px-2" aria-label="حذف البند"
              onClick={() => p.onChange(p.items.length > 1 ? p.items.filter((_, j) => j !== i) : [""])}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {p.items.length < max && (
          <button type="button" className="btn-ghost w-fit" onClick={() => p.onChange([...p.items, ""])}>
            <Plus size={16} /> إضافة بند
          </button>
        )}
      </div>
    </div>
  );
}

export function ImageField(p: {
  label: string; value: string; onChange: (url: string) => void;
  reportId: string; name: string; hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function pick(file?: File) {
    if (!file) return;
    setBusy(true); setErr("");
    try {
      const blob = await compressImage(file);
      const path = `${p.reportId}/${p.name}-${Date.now()}.jpg`;
      const { error } = await supabase().storage.from("report-images")
        .upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;
      const { data } = supabase().storage.from("report-images").getPublicUrl(path);
      p.onChange(data.publicUrl);
    } catch (e: any) {
      setErr("تعذّر رفع الصورة: " + (e?.message ?? "خطأ غير معروف"));
    }
    setBusy(false);
  }

  return (
    <div className="md:col-span-2">
      <Label hint={p.hint}>{p.label}</Label>
      {p.value ? (
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.value} alt={p.label} className="max-h-56 rounded-lg border border-slate-200" />
          <button type="button" aria-label="إزالة الصورة" onClick={() => p.onChange("")}
            className="absolute left-2 top-2 rounded-full bg-white p-1 shadow hover:bg-red-50">
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-8 text-sm text-slate-500 hover:border-brand hover:bg-mist">
          <ImagePlus size={26} />
          {busy ? "جارٍ الرفع…" : "اضغط لاختيار صورة (أو التقط صورة من الجوال)"}
          <input type="file" accept="image/*" className="hidden" disabled={busy}
            onChange={(e) => pick(e.target.files?.[0])} />
        </label>
      )}
      {err && <p className="mt-1 text-sm text-red-600">{err}</p>}
    </div>
  );
}
