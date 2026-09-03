"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import {
  selectCurrentProductListing,
  selectProductError,
  selectProductOpStatus,
} from "@/store/product/productSelectors";
import {
  addQualityParameterThunk,
  fetchProductListingThunk,
  uploadProductImageThunk,
  uploadProductImageAndActivateThunk,
} from "@/store/product/productThunks";
import type {
  CreateQualityParameterPayload,
  QualityParameterOperator,
  QualityParameterValueType,
} from "@/types/product";

// ─── Local draft type ────────────────────────────────────────────────────────

interface DraftParam extends CreateQualityParameterPayload {
  ui_id: string;
}

const OPERATOR_LABELS: Record<QualityParameterOperator, string> = {
  lt: "<",
  lte: "≤",
  gt: ">",
  gte: "≥",
  eq: "=",
  neq: "≠",
  between: "between",
  absent: "Absent",
  present: "Present",
};

const VALUE_TYPE_OPTIONS: { value: QualityParameterValueType; label: string }[] = [
  { value: "decimal", label: "Decimal" },
  { value: "percent", label: "Percent (%)" },
  { value: "integer", label: "Integer" },
  { value: "text", label: "Text" },
  { value: "boolean", label: "Boolean" },
];

function makeDefaultParam(): DraftParam {
  return {
    ui_id: `param-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "Custom Parameter",
    description: "",
    value_type: "decimal",
    operator: "lte",
    target_value: "",
    unit: "",
    is_mandatory: true,
  };
}

/** Pre-populated with industry-standard thresholds sellers commonly commit to. */
const DEFAULT_PARAMS: DraftParam[] = [
  {
    ui_id: "default-1",
    name: "Contamination Concentration",
    description: "Maximum allowable non-target debris (paper, adhesives, other plastics).",
    value_type: "percent",
    operator: "lt",
    target_value: "0.5",
    unit: "%",
    is_mandatory: true,
  },
  {
    ui_id: "default-2",
    name: "Moisture Level",
    description: "Cumulative water content relative to total batch weight.",
    value_type: "percent",
    operator: "lte",
    target_value: "4",
    unit: "%",
    is_mandatory: true,
  },
  {
    ui_id: "default-3",
    name: "Hazardous Material",
    description: "Presence of heavy metals, toxic chemical residues, or prohibited substances.",
    value_type: "boolean",
    operator: "absent",
    is_mandatory: true,
  },
  {
    ui_id: "default-4",
    name: "Material Purity",
    description: "Minimum required percentage of prime target polymer.",
    value_type: "percent",
    operator: "gt",
    target_value: "98.5",
    unit: "%",
    is_mandatory: true,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function AddQualityParametersStep({ listingId }: { listingId: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectAccessToken);
  const listing = useAppSelector(selectCurrentProductListing);

  const addStatus = useAppSelector((s) => selectProductOpStatus(s, "addQualityParameter"));
  const uploadStatus = useAppSelector((s) => selectProductOpStatus(s, "uploadImage"));
  const uploadAndActivateStatus = useAppSelector((s) =>
    selectProductOpStatus(s, "uploadImageAndActivate"),
  );
  const addError = useAppSelector((s) => selectProductError(s, "addQualityParameter"));
  const uploadError = useAppSelector((s) => selectProductError(s, "uploadImage"));

  const [params, setParams] = useState<DraftParam[]>(DEFAULT_PARAMS);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Load the listing so we know its material name etc.
  useEffect(() => {
    if (token && listingId) {
      void dispatch(fetchProductListingThunk({ token, listingId }));
    }
  }, [dispatch, token, listingId]);

  // ── param helpers ──────────────────────────────────────────────────────────

  function addParam() {
    setParams((prev) => [...prev, makeDefaultParam()]);
  }

  function removeParam(ui_id: string) {
    setParams((prev) => prev.filter((p) => p.ui_id !== ui_id));
  }

  function updateParam(ui_id: string, patch: Partial<DraftParam>) {
    setParams((prev) =>
      prev.map((p) => (p.ui_id === ui_id ? { ...p, ...patch } : p)),
    );
  }

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    setImageFiles(Array.from(e.target.files ?? []));
  }

  // ── build API payload for one param ────────────────────────────────────────

  function buildPayload(p: DraftParam): CreateQualityParameterPayload {
    const base: CreateQualityParameterPayload = {
      name: p.name.trim(),
      description: p.description?.trim() || undefined,
      value_type: p.value_type,
      operator: p.operator,
      unit: p.unit?.trim() || undefined,
      is_mandatory: p.is_mandatory,
    };

    if (p.operator === "absent" || p.operator === "present") {
      // no target needed
    } else if (p.operator === "between") {
      base.min_value = p.min_value || "0";
      base.max_value = p.max_value || "0";
    } else if (p.value_type === "boolean") {
      base.target_boolean = p.target_boolean ?? false;
    } else if (p.value_type === "text") {
      base.target_text = p.target_text || "";
    } else {
      base.target_value = p.target_value || "0";
    }

    return base;
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setGlobalError(null);
    setIsSaving(true);

    try {
      // 1. Save quality parameters sequentially
      for (const p of params) {
        await dispatch(
          addQualityParameterThunk({
            token,
            listingId,
            ...buildPayload(p),
          }),
        ).unwrap();
      }

      // 2. Upload images (first image activates listing via uploadImageAndActivate)
      if (imageFiles.length > 0) {
        const [primary, ...rest] = imageFiles;

        await dispatch(
          uploadProductImageAndActivateThunk({
            token,
            listingId,
            image: primary,
            caption: "Primary material photo",
            is_primary: true,
            sort_order: 0,
          }),
        ).unwrap();

        await Promise.all(
          rest.map((img, idx) =>
            dispatch(
              uploadProductImageThunk({
                token,
                listingId,
                image: img,
                caption: `Material photo ${idx + 2}`,
                sort_order: idx + 1,
              }),
            ).unwrap(),
          ),
        );
      }

      // 3. Redirect to the listing detail
      router.push(`/product/${listingId}`);
    } catch (err: unknown) {
      setGlobalError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const isSubmitting =
    isSaving ||
    addStatus === "loading" ||
    uploadStatus === "loading" ||
    uploadAndActivateStatus === "loading";

  const materialName = listing?.material_name ?? "your listing";

  return (
    <div className="mx-auto grid max-w-5xl gap-8">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <section>
        {/* Step breadcrumb */}
        <nav className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#006d40]">
          <span className="opacity-50">New listing</span>
          <span className="opacity-50">/</span>
          <span>Inspection requirements</span>
        </nav>

        {/* Step pills */}
        <div className="mb-6 flex items-center gap-0">
          {["Listing details", "Inspection requirements & Images"].map((step, i) => (
            <div key={step} className="flex items-center">
              {i > 0 && <div className="h-px w-10 bg-slate-200" />}
              <div
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
                  i === 0
                    ? "bg-[#ecfdf5] text-[#006d40]"
                    : "bg-[#002627] text-white"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    i === 0 ? "bg-[#006d40] text-white" : "bg-white text-[#002627]"
                  }`}
                >
                  {i === 0 ? "✓" : "2"}
                </span>
                {step}
              </div>
            </div>
          ))}
        </div>

        <h1 className="font-[var(--font-hanken)] text-4xl font-semibold text-[#002627]">
          Define Inspection Requirements
        </h1>
        <p className="mt-3 max-w-2xl text-[#404848]">
          For <strong className="text-[#002627]">{materialName}</strong>. These are the precise
          quality thresholds the{" "}
          <strong className="text-[#002627]">Ameefar team will inspect against</strong> before
          certifying the material. Buyers will also see these criteria before deciding to request an
          inspection — so be accurate and truthful about what you are committing to.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* ── Global error ──────────────────────────────────────────────── */}
        {(globalError || addError || uploadError) && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {globalError ?? addError ?? uploadError}
          </div>
        )}

        {/* ── Info banner ───────────────────────────────────────────────── */}
        <div className="flex gap-4 rounded-xl border border-[#d3e4fe] bg-[#eff4ff] p-5">
          <span className="mt-0.5 shrink-0 text-[#002627]">
            <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </span>
          <p className="text-sm leading-relaxed text-[#002627]">
            Parameters you define here will be copied to every trade inspection for this listing.
            Only <strong>active</strong> requirements are enforced during inspection. You can manage
            them later from the listing detail page.
          </p>
        </div>

        {/* ── Parameters ────────────────────────────────────────────────── */}
        <StepSection
          title="Quality Parameters"
          badge={`${params.length} defined`}
          action={
            <button
              type="button"
              onClick={addParam}
              className="flex items-center gap-1.5 text-sm font-semibold text-[#002627] transition hover:text-[#006d40]"
            >
              <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="16" />
                <line x1="8" x2="16" y1="12" y2="12" />
              </svg>
              Add Parameter
            </button>
          }
        >
          {params.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-[#404848]">
              No parameters defined yet. Add at least one to proceed.
            </div>
          ) : (
            <div className="grid gap-4">
              {params.map((p, idx) => (
                <ParameterCard
                  key={p.ui_id}
                  index={idx}
                  param={p}
                  onChange={(patch) => updateParam(p.ui_id, patch)}
                  onRemove={() => removeParam(p.ui_id)}
                  canRemove={params.length > 1}
                />
              ))}
            </div>
          )}
        </StepSection>

        {/* ── Images ────────────────────────────────────────────────────── */}
        <StepSection
          title="Material Photos"
          badge="Activates listing"
        >
          <p className="mb-4 text-sm text-[#404848]">
            Upload at least one image. The first image will activate the listing automatically. You
            can add more photos from the listing page later.
          </p>
          <label className="relative grid min-h-40 cursor-pointer place-items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-[#002627] hover:bg-[#eff4ff]">
            <input
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              multiple
              onChange={handleFiles}
              type="file"
            />
            {imageFiles.length > 0 ? (
              <div className="grid gap-3">
                <div className="flex flex-wrap justify-center gap-2">
                  {imageFiles.map((file, i) => (
                    <img
                      alt={file.name}
                      className="h-20 w-20 rounded-lg object-cover shadow-sm"
                      key={i}
                      src={URL.createObjectURL(file)}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-[#002627]">
                  {imageFiles.length} file{imageFiles.length === 1 ? "" : "s"} selected · click to change
                </span>
              </div>
            ) : (
              <div className="grid gap-2">
                <svg className="mx-auto text-slate-300" fill="none" height="40" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="40">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                <strong className="font-[var(--font-hanken)] text-lg text-[#002627]">Upload material images</strong>
                <span className="text-sm text-[#404848]">PNG, JPG, GIF, or WebP</span>
              </div>
            )}
          </label>
          {imageFiles.length === 0 && (
            <p className="mt-2 text-xs font-medium text-amber-700">
              ⚠ At least one image is required to activate the listing.
            </p>
          )}
        </StepSection>

        {/* ── Footer action bar ─────────────────────────────────────────── */}
        <div className="sticky bottom-0 z-20 -mx-4 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 p-4 backdrop-blur md:-mx-10 md:px-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#404848]">
              Step 2 of 2
            </span>
            <span className="text-sm font-semibold text-[#002627]">
              {params.length} parameter{params.length === 1 ? "" : "s"} ·{" "}
              {imageFiles.length} image{imageFiles.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(`/product/${listingId}`)}
              className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-5 font-semibold text-[#404848] transition hover:bg-slate-50"
            >
              Skip for now
            </button>
            <button
              className="min-h-11 rounded-xl bg-[#002627] px-6 font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
              disabled={isSubmitting || params.length === 0 || imageFiles.length === 0}
              type="submit"
            >
              {isSubmitting && (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              )}
              {isSubmitting ? "Saving…" : "Submit & Activate Listing"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── ParameterCard ────────────────────────────────────────────────────────────

function ParameterCard({
  index,
  param,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  param: DraftParam;
  onChange: (patch: Partial<DraftParam>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const isBooleanLike =
    param.operator === "absent" || param.operator === "present" || param.value_type === "boolean";
  const isText = param.value_type === "text";
  const isBetween = param.operator === "between";

  return (
    <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#002627] text-[11px] font-bold text-white">
            {index + 1}
          </span>
          <input
            className="bg-transparent font-[var(--font-hanken)] text-base font-semibold text-[#002627] outline-none transition focus:underline"
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Parameter name"
            value={param.name}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#404848]">
            <input
              checked={param.is_mandatory}
              className="accent-[#002627]"
              onChange={(e) => onChange({ is_mandatory: e.target.checked })}
              type="checkbox"
            />
            Mandatory
          </label>
          {canRemove && (
            <button
              onClick={onRemove}
              type="button"
              className="text-slate-400 transition hover:text-red-600"
              aria-label="Remove parameter"
            >
              <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="grid gap-5 p-5 md:grid-cols-2">
        {/* Left: name + description */}
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span className={labelClass}>Description</span>
            <textarea
              className={textareaClass}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Describe what this parameter measures and why it matters."
              rows={3}
              value={param.description ?? ""}
            />
          </label>
        </div>

        {/* Right: type + operator + value */}
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5">
              <span className={labelClass}>Value type</span>
              <select
                className={selectClass}
                onChange={(e) =>
                  onChange({ value_type: e.target.value as QualityParameterValueType })
                }
                value={param.value_type}
              >
                {VALUE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className={labelClass}>Operator</span>
              <select
                className={selectClass}
                onChange={(e) =>
                  onChange({ operator: e.target.value as QualityParameterOperator })
                }
                value={param.operator}
              >
                {(
                  Object.entries(OPERATOR_LABELS) as [QualityParameterOperator, string][]
                ).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Value inputs */}
          {isBooleanLike ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-lg">{param.operator === "absent" ? "🚫" : "✅"}</span>
              <span className="text-sm font-semibold text-[#002627]">
                {param.operator === "absent"
                  ? "Must be absent from the batch"
                  : "Must be present in the batch"}
              </span>
            </div>
          ) : isText ? (
            <label className="grid gap-1.5">
              <span className={labelClass}>Target text</span>
              <input
                className={inputClass}
                onChange={(e) => onChange({ target_text: e.target.value })}
                placeholder="Expected text value"
                type="text"
                value={param.target_text ?? ""}
              />
            </label>
          ) : isBetween ? (
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1.5">
                <span className={labelClass}>Min value</span>
                <input
                  className={inputClass}
                  onChange={(e) =>
                    onChange({ min_value: e.target.value.replace(/[^0-9.]/g, "") })
                  }
                  placeholder="0.00"
                  type="text"
                  value={param.min_value ?? ""}
                />
              </label>
              <label className="grid gap-1.5">
                <span className={labelClass}>Max value</span>
                <input
                  className={inputClass}
                  onChange={(e) =>
                    onChange({ max_value: e.target.value.replace(/[^0-9.]/g, "") })
                  }
                  placeholder="0.00"
                  type="text"
                  value={param.max_value ?? ""}
                />
              </label>
            </div>
          ) : (
            <label className="grid gap-1.5">
              <span className={labelClass}>Target value</span>
              <input
                className={inputClass}
                onChange={(e) =>
                  onChange({ target_value: e.target.value.replace(/[^0-9.]/g, "") })
                }
                placeholder="e.g. 2.5"
                type="text"
                value={param.target_value ?? ""}
              />
            </label>
          )}

          {/* Unit (shown for numeric types) */}
          {!isBooleanLike && !isText && (
            <label className="grid gap-1.5">
              <span className={labelClass}>Unit</span>
              <input
                className={inputClass}
                list="unit-options-qp"
                onChange={(e) => onChange({ unit: e.target.value })}
                placeholder="%, MT, ppm…"
                type="text"
                value={param.unit ?? ""}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── StepSection ─────────────────────────────────────────────────────────────

function StepSection({
  badge,
  children,
  title,
  action,
}: {
  badge?: string;
  children: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <h2 className="font-[var(--font-hanken)] text-xl font-semibold text-[#002627]">
            {title}
          </h2>
          {badge && (
            <span className="rounded-full bg-[#eff4ff] px-3 py-1 font-[var(--font-jetbrains)] text-[10px] font-bold uppercase tracking-wide text-[#002627]">
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

// ─── Shared classes ──────────────────────────────────────────────────────────

const labelClass =
  "font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#404848]";

const inputClass =
  "min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20";

const selectClass =
  "min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20";

const textareaClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[#0b1c30] outline-none transition focus:border-[#002627] focus:ring-2 focus:ring-[#002627]/20 resize-none";

// ─── Datalist ────────────────────────────────────────────────────────────────

function UnitDatalist() {
  return (
    <datalist id="unit-options-qp">
      <option value="%" />
      <option value="MT" />
      <option value="kg" />
      <option value="ppm" />
      <option value="mg/kg" />
      <option value="g/10min" />
      <option value="g/cm³" />
    </datalist>
  );
}

// re-export datalist so the page can render it at root
export { UnitDatalist as QualityParameterUnitDatalist };
