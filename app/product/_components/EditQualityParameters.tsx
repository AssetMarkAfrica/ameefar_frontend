"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import { selectProductOpStatus, selectProductError } from "@/store/product/productSelectors";
import {
  listQualityParametersThunk,
  updateQualityParameterThunk,
  addQualityParameterThunk,
  deleteQualityParameterThunk,
} from "@/store/product/productThunks";
import type {
  CreateQualityParameterPayload,
  QualityParameterOperator,
  QualityParameterValueType,
  QualityParameter,
} from "@/types/product";

import { QualityParameterUnitDatalist } from "./AddQualityParametersStep";

// ─── Local draft type ────────────────────────────────────────────────────────

interface EditDraftParam extends CreateQualityParameterPayload {
  ui_id: string;
  id?: string; // Presence of id means it exists on the server
  is_active?: boolean;
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

function makeDefaultParam(): EditDraftParam {
  return {
    ui_id: `param-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "New Parameter",
    description: "",
    value_type: "decimal",
    operator: "lte",
    target_value: "",
    unit: "",
    is_mandatory: true,
    is_active: true,
  };
}

function mapApiToDraft(apiParam: QualityParameter): EditDraftParam {
  return {
    ui_id: apiParam.id,
    id: apiParam.id,
    name: apiParam.name,
    description: apiParam.description,
    value_type: apiParam.value_type,
    operator: apiParam.operator,
    target_value: apiParam.target_value ?? undefined,
    min_value: apiParam.min_value ?? undefined,
    max_value: apiParam.max_value ?? undefined,
    target_text: apiParam.target_text,
    target_boolean: apiParam.target_boolean ?? undefined,
    unit: apiParam.unit,
    is_mandatory: apiParam.is_mandatory,
    is_active: apiParam.is_active,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EditQualityParameters({ listingId }: { listingId: string }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectAccessToken);

  const fetchStatus = useAppSelector((s) => selectProductOpStatus(s, "listQualityParameters"));
  const addStatus = useAppSelector((s) => selectProductOpStatus(s, "addQualityParameter"));
  const updateStatus = useAppSelector((s) => selectProductOpStatus(s, "updateQualityParameter"));
  const deleteStatus = useAppSelector((s) => selectProductOpStatus(s, "deleteQualityParameter"));
  
  const fetchError = useAppSelector((s) => selectProductError(s, "listQualityParameters"));

  const [params, setParams] = useState<EditDraftParam[]>([]);
  const [initialParams, setInitialParams] = useState<EditDraftParam[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load the parameters
  useEffect(() => {
    if (token && listingId) {
      dispatch(listQualityParametersThunk({ token, listingId }))
        .unwrap()
        .then((res) => {
          const drafts = res.results.map(mapApiToDraft);
          setParams(drafts);
          setInitialParams(drafts);
        })
        .catch(() => {
          // Error handled by redux slice
        });
    }
  }, [dispatch, token, listingId]);

  // ── param helpers ──────────────────────────────────────────────────────────

  function addParam() {
    setParams((prev) => [...prev, makeDefaultParam()]);
  }

  function removeParam(ui_id: string) {
    setParams((prev) => prev.filter((p) => p.ui_id !== ui_id));
  }

  function updateParam(ui_id: string, patch: Partial<EditDraftParam>) {
    setParams((prev) =>
      prev.map((p) => (p.ui_id === ui_id ? { ...p, ...patch } : p)),
    );
  }

  // ── build API payload for one param ────────────────────────────────────────

  function buildPayload(p: EditDraftParam) {
    const base: any = {
      name: p.name.trim(),
      description: p.description?.trim() || undefined,
      value_type: p.value_type,
      operator: p.operator,
      unit: p.unit?.trim() || undefined,
      is_mandatory: p.is_mandatory,
      is_active: p.is_active,
    };

    if (p.operator === "absent" || p.operator === "present") {
      base.target_value = null;
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
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const initialIds = new Set(initialParams.map((p) => p.id).filter(Boolean));
      const currentIds = new Set(params.map((p) => p.id).filter(Boolean));

      // 1. Delete removed parameters
      const toDelete = [...initialIds].filter((id) => !currentIds.has(id));
      for (const id of toDelete) {
        await dispatch(
          deleteQualityParameterThunk({ token, listingId, parameterId: id as string })
        ).unwrap();
      }

      // 2. Add or Update parameters
      for (const p of params) {
        const payload = buildPayload(p);
        if (p.id) {
          // Update
          await dispatch(
            updateQualityParameterThunk({
              token,
              listingId,
              parameterId: p.id,
              ...payload,
            })
          ).unwrap();
        } else {
          // Add new
          await dispatch(
            addQualityParameterThunk({
              token,
              listingId,
              ...payload,
            })
          ).unwrap();
        }
      }

      setSuccessMessage("Inspection requirements updated successfully.");
      
      // Reload fresh state
      const freshParams = await dispatch(listQualityParametersThunk({ token, listingId })).unwrap();
      const freshDrafts = freshParams.results.map(mapApiToDraft);
      setParams(freshDrafts);
      setInitialParams(freshDrafts);

      // Navigate back after a brief moment so the user sees the success banner
      setTimeout(() => {
        router.push(`/product/${listingId}`);
      }, 1200);

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
    updateStatus === "loading" ||
    deleteStatus === "loading";

  if (fetchStatus === "loading") {
    return (
      <div className="grid min-h-64 place-items-center rounded-xl border border-slate-200 bg-white">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#002627] border-t-transparent" />
      </div>
    );
  }

  if (fetchStatus === "failed") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
        <p className="font-semibold">Failed to load inspection requirements.</p>
        <p className="text-sm mt-1">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8">
      <section>
        <h1 className="font-[var(--font-hanken)] text-3xl font-semibold text-[#002627]">
          Manage Inspection Requirements
        </h1>
        <p className="mt-2 text-[#404848]">
          Update the quality thresholds that the Ameefar team will inspect against.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {(globalError) && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {globalError}
          </div>
        )}
        
        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            {successMessage}
          </div>
        )}

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
                />
              ))}
            </div>
          )}
        </StepSection>

        <div className="sticky bottom-0 z-20 flex justify-end gap-3 border-t border-slate-200 bg-white/95 p-4 backdrop-blur">
          <button
            type="button"
            onClick={() => router.push(`/product/${listingId}`)}
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-5 font-semibold text-[#404848] transition hover:bg-slate-50"
          >
            Back to listing
          </button>
          <button
            className="min-h-11 rounded-xl bg-[#002627] px-6 font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting && (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            {isSubmitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
      <QualityParameterUnitDatalist />
    </div>
  );
}

// ─── ParameterCard ────────────────────────────────────────────────────────────

function ParameterCard({
  index,
  param,
  onChange,
  onRemove,
}: {
  index: number;
  param: EditDraftParam;
  onChange: (patch: Partial<EditDraftParam>) => void;
  onRemove: () => void;
}) {
  const isBooleanLike =
    param.operator === "absent" || param.operator === "present" || param.value_type === "boolean";
  const isText = param.value_type === "text";
  const isBetween = param.operator === "between";

  return (
    <div className={`group overflow-hidden rounded-xl border transition shadow-sm ${param.is_active ? 'border-slate-200 bg-white hover:shadow-md' : 'border-slate-200 bg-slate-50 opacity-75'}`}>
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
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#404848]">
            <input
              checked={param.is_active}
              className="accent-[#002627]"
              onChange={(e) => onChange({ is_active: e.target.checked })}
              type="checkbox"
            />
            Active
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#404848]">
            <input
              checked={param.is_mandatory}
              className="accent-[#002627]"
              onChange={(e) => onChange({ is_mandatory: e.target.checked })}
              type="checkbox"
            />
            Mandatory
          </label>
          <button
            onClick={onRemove}
            type="button"
            className="text-slate-400 transition hover:text-red-600 ml-2"
            aria-label="Remove parameter"
          >
            <svg fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
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
