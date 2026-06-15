"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import {
  fetchTradeThunk,
  completeInspectionThunk,
  draftInspectionThunk,
  uploadInspectionImageThunk,
  deleteInspectionImageThunk,
} from "@/store/bidding/biddingThunks";
import type {
  InspectionRequirement,
  InspectionVerdict,
  InspectionRecommendation,
  RequirementResultPayload,
  TradeInspectionImage,
} from "@/types/bidding";

// ─── Draft State ──────────────────────────────────────────────────────────────

interface DraftResult {
  requirement_id: string;
  is_met: boolean;
  measured_value: string;
  measured_boolean: boolean;
  measured_text: string;
  notes: string;
}

function initDraft(req: InspectionRequirement): DraftResult {
  return {
    requirement_id: req.id,
    is_met: true,
    measured_value: "",
    measured_boolean: false,
    measured_text: "",
    notes: "",
  };
}

function buildPayloadResult(
  draft: DraftResult,
  req: InspectionRequirement,
): RequirementResultPayload {
  const base: RequirementResultPayload = {
    requirement_id: draft.requirement_id,
    is_met: draft.is_met,
    notes: draft.notes || undefined,
  };
  if (req.value_type === "boolean") {
    base.measured_boolean = draft.measured_boolean;
  } else if (req.value_type === "text") {
    if (draft.measured_text) base.measured_text = draft.measured_text;
  } else {
    if (draft.measured_value) base.measured_value = draft.measured_value;
  }
  return base;
}

function operatorLabel(op: string, threshold: string | null, unit: string) {
  if (!threshold) return "";
  const symbols: Record<string, string> = { lt: "<", lte: "≤", gt: ">", gte: "≥", eq: "=", neq: "≠" };
  const sym = symbols[op] ?? op;
  return `${sym} ${threshold} ${unit}`.trim();
}

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Checklist", icon: "checklist" },
  { id: 2, label: "Verdict & Findings", icon: "assignment_turned_in" },
  { id: 3, label: "Review & Submit", icon: "send" },
];

// ─── Requirement Card ─────────────────────────────────────────────────────────

interface ReqCardProps {
  req: InspectionRequirement;
  draft: DraftResult;
  onChange: (id: string, updates: Partial<DraftResult>) => void;
}

function RequirementCard({ req, draft, onChange }: ReqCardProps) {
  const isMet = draft.is_met;
  const cardBg = isMet ? "bg-white border-border-subtle" : "bg-red-50/60 border-error/30";
  const thresholdLabel =
    req.operator === "absent" ? "Must be absent"
      : req.operator === "present" ? "Must be present"
        : req.operator === "between" ? `Between ${req.min_value} – ${req.max_value} ${req.unit}`.trim()
          : operatorLabel(req.operator, req.target_value, req.unit);

  return (
    <div
      className={`rounded-xl border p-6 transition-all duration-200 ${cardBg}`}
      style={{ boxShadow: isMet ? "" : "0 0 0 1px rgba(186,26,26,0.15)" }}
    >
      <div className="flex justify-between items-start mb-5">
        <div>
          <h4 className={`font-bold text-base ${isMet ? "text-ameefar-navy" : "text-error"}`}>
            {req.name}
          </h4>
          {thresholdLabel && (
            <p className="text-xs text-on-surface-variant mt-1">
              Target: <span className="font-bold text-ameefar-navy">{thresholdLabel}</span>
            </p>
          )}
          {req.description && (
            <p className="text-xs text-on-surface-variant mt-1 italic">{req.description}</p>
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={draft.is_met}
            onChange={(e) => onChange(req.id, { is_met: e.target.checked })}
          />
          <div className="w-14 h-7 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary" />
          <span className={`ml-3 text-sm font-bold ${isMet ? "text-secondary" : "text-error"}`}>
            {isMet ? "Req. Met" : "Not Met"}
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {req.value_type === "boolean" ? (
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">Observed Presence</label>
            <div className="flex items-center gap-3 bg-surface-gray border border-border-subtle rounded-lg px-4 py-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`bool-${req.id}`} checked={draft.measured_boolean === true} onChange={() => onChange(req.id, { measured_boolean: true })} className="accent-secondary" />
                <span className="text-sm font-medium text-on-surface-variant">Present</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name={`bool-${req.id}`} checked={draft.measured_boolean === false} onChange={() => onChange(req.id, { measured_boolean: false })} className="accent-secondary" />
                <span className="text-sm font-medium text-on-surface-variant">Absent</span>
              </label>
            </div>
          </div>
        ) : req.value_type === "text" ? (
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">Measured Value</label>
            <input
              type="text"
              placeholder="Enter observed text value..."
              value={draft.measured_text}
              onChange={(e) => onChange(req.id, { measured_text: e.target.value })}
              className={`w-full bg-surface-gray border rounded-lg px-4 py-3 font-label-md text-label-md focus:ring-2 focus:ring-primary focus:outline-none transition-all ${!isMet ? "border-error/50 bg-white text-error" : "border-border-subtle"}`}
            />
          </div>
        ) : (
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">
              Measured Value{req.unit ? ` (${req.unit})` : ""}
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="0.00"
              value={draft.measured_value}
              onChange={(e) => onChange(req.id, { measured_value: e.target.value })}
              className={`w-full border rounded-lg px-4 py-3 font-label-md text-label-md focus:ring-2 focus:ring-primary focus:outline-none transition-all ${!isMet ? "border-error/50 bg-white text-error focus:ring-error" : "bg-surface-gray border-border-subtle"}`}
            />
          </div>
        )}
        <div>
          <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">Inspector Notes</label>
          <textarea
            rows={2}
            placeholder="Add observation details, measurements, equipment used..."
            value={draft.notes}
            onChange={(e) => onChange(req.id, { notes: e.target.value })}
            className="w-full border border-border-subtle rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none bg-surface-gray"
          />
        </div>
      </div>
      {!req.is_mandatory && (
        <p className="mt-3 text-[10px] text-on-surface-variant italic">Optional requirement</p>
      )}
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="bg-white border-b border-border-subtle px-8 py-4">
      <div className="max-w-3xl mx-auto flex items-center gap-0">
        {STEPS.map((step, i) => {
          const done = current > step.id;
          const active = current === step.id;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${done
                    ? "bg-secondary text-white"
                    : active
                      ? "bg-ameefar-navy text-white ring-4 ring-ameefar-navy/20"
                      : "bg-surface-container text-on-surface-variant"
                    }`}
                >
                  {done ? (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold text-center leading-tight ${active ? "text-ameefar-navy" : done ? "text-secondary" : "text-on-surface-variant"
                    }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mb-5 transition-all duration-500 ${done ? "bg-secondary" : "bg-border-subtle"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ─── Post-Submit Photo Upload ─────────────────────────────────────────────────

function PhotoUploadSection({
  tradeId,
  token,
  inspectionImages,
  dispatch,
}: {
  tradeId: string;
  token: string;
  inspectionImages: TradeInspectionImage[];
  dispatch: ReturnType<typeof useAppDispatch>;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    await dispatch(uploadInspectionImageThunk({ token, tradeId, image: file }));
    setIsUploading(false);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);
    await dispatch(deleteInspectionImageThunk({ token, tradeId, imageId }));
    setDeletingId(null);
  };

  return (
    <div className="bg-white border border-border-subtle rounded-xl p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-ameefar-navy flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-secondary">add_a_photo</span>
          Evidence Photos
        </h3>
        <button
          onClick={() => photoInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
        >
          {isUploading ? (
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[16px]">add</span>
          )}
          Add Photo
        </button>
      </div>
      <p className="text-xs text-on-surface-variant mb-4">
        Attach on-site photos to support the published report.
      </p>

      {inspectionImages.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {inspectionImages.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden border border-border-subtle">
              <img src={img.image_url} alt={img.caption || img.image_name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              {img.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-ameefar-navy/80 p-1.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.caption}
                </div>
              )}
              <button
                onClick={() => handleDelete(img.id)}
                disabled={deletingId === img.id}
                className="absolute top-1.5 right-1.5 bg-error text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {deletingId === img.id ? (
                  <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[14px]">close</span>
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center hover:border-primary/50 cursor-pointer transition-colors group mb-0"
          onClick={() => photoInputRef.current?.click()}
        >
          <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover:text-primary transition-colors">cloud_upload</span>
          <p className="text-sm font-bold text-ameefar-navy mt-1">Upload Evidence Photos</p>
          <p className="text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-wide">JPG, PNG up to 10MB</p>
        </div>
      )}

      {inspectionImages.length > 0 && (
        <div
          className="border-2 border-dashed border-border-subtle rounded-xl p-4 text-center hover:border-primary/50 cursor-pointer transition-colors"
          onClick={() => photoInputRef.current?.click()}
        >
          <p className="text-xs font-bold text-on-surface-variant">+ Add another photo</p>
        </div>
      )}

      <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AdminCompleteInspectionPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const { currentTrade, status } = useAppSelector((s) => s.bidding);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 2 fields
  const [verdict, setVerdict] = useState<InspectionVerdict>("passed");
  const [recommendation, setRecommendation] = useState<InspectionRecommendation>("proceed");
  const [summary, setSummary] = useState("");
  const [findings, setFindings] = useState("");
  const [reportFile, setReportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Per-requirement drafts
  const [drafts, setDrafts] = useState<DraftResult[]>([]);

  useEffect(() => {
    if (token && id) dispatch(fetchTradeThunk({ token, tradeId: id }));
  }, [dispatch, token, id]);

  useEffect(() => {
    if (currentTrade?.inspection_requirements?.length && drafts.length === 0) {
      setDrafts(currentTrade.inspection_requirements.map(initDraft));
    }
  }, [currentTrade]);

  const updateDraft = (reqId: string, updates: Partial<DraftResult>) => {
    setDrafts((prev) => prev.map((d) => (d.requirement_id === reqId ? { ...d, ...updates } : d)));
  };

  const requirements: InspectionRequirement[] = currentTrade?.inspection_requirements ?? [];
  const inspectionImages: TradeInspectionImage[] = currentTrade?.inspection_report?.images ?? [];
  const metCount = drafts.filter((d) => d.is_met).length;
  const failedCount = drafts.length - metCount;

  const buildResults = (): RequirementResultPayload[] =>
    drafts.map((draft) => {
      const req = requirements.find((r) => r.id === draft.requirement_id)!;
      return buildPayloadResult(draft, req);
    });

  const handleSaveDraft = async () => {
    if (!token || !id) return;
    const result = await dispatch(
      draftInspectionThunk({
        token, tradeId: id, verdict, summary,
        findings: findings || undefined,
        recommendation,
        report_document: reportFile ?? undefined,
        requirement_results: buildResults().length ? buildResults() : undefined,
      })
    );
    if (draftInspectionThunk.fulfilled.match(result)) {
      router.push(`/bidding/admin/trade/${id}`);
    }
  };

  const handleSubmit = async () => {
    if (!token || !id || summary.trim().length < 10) return;
    const result = await dispatch(
      completeInspectionThunk({
        token, tradeId: id, verdict, summary,
        findings: findings || undefined,
        recommendation,
        report_document: reportFile ?? undefined,
        requirement_results: buildResults().length ? buildResults() : undefined,
      })
    );
    if (completeInspectionThunk.fulfilled.match(result)) {
      setSubmitted(true);
      // Refresh so we get the inspection_report.images list populated
      dispatch(fetchTradeThunk({ token, tradeId: id }));
    }
  };

  const isSubmitting = status.completeInspection === "loading";
  const isDrafting = status.draftInspection === "loading";

  if (status.fetchTrade === "loading" || !currentTrade) {
    return (
      <div className="flex w-full min-h-screen bg-surface-gray">
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="w-10 h-10 border-4 border-ameefar-navy border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant">Loading inspection data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">

      <main className="pt-16 min-h-screen flex flex-col w-full">

        {/* ── Page Header ── */}
        <section className="bg-white border-b border-border-subtle px-8 py-5 sticky top-16 z-30">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <nav className="flex items-center gap-2 text-on-surface-variant text-xs font-medium mb-1.5">
                <button onClick={() => router.push("/bidding/admin/negotiations")} className="hover:text-primary transition-colors">
                  Inspections
                </button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <button onClick={() => router.push(`/bidding/admin/trade/${id}`)} className="hover:text-primary transition-colors">
                  {currentTrade.reference}
                </button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-primary font-bold">Field Report</span>
              </nav>
              <h1 className="font-headline-md text-headline-md text-ameefar-navy">
                {currentTrade.reference} — Inspection Report
              </h1>
              <div className="flex gap-3 items-center mt-1 flex-wrap">
                <span className="bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {currentTrade.listing_name}
                </span>
                <span className="text-on-surface-variant text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">scale</span>
                  {currentTrade.quantity} {currentTrade.unit?.toUpperCase()}
                </span>
              </div>
            </div>
            {!submitted && (
              <button
                onClick={handleSaveDraft}
                disabled={isDrafting || isSubmitting}
                className="shrink-0 flex items-center gap-1.5 text-sm font-bold text-on-surface-variant border border-border-subtle bg-white hover:bg-surface-gray px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                {isDrafting ? (
                  <span className="w-4 h-4 border-2 border-on-surface-variant border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">save</span>
                )}
                Save Draft
              </button>
            )}
          </div>
        </section>

        {/* ── Step Bar ── */}
        {!submitted && <StepBar current={step} />}

        {/* ── Submitted State ── */}
        {submitted ? (
          <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-6">
            {/* Success banner */}
            <div className="bg-trust-green-subtle border border-secondary/30 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-ameefar-navy mb-2">
                Report Published
              </h2>
              <p className="text-on-surface-variant text-sm">
                The inspection report has been submitted and is now visible to the buyer and seller.
              </p>
              <div className="flex gap-2 mt-2 justify-center flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${verdict === "passed" ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}>
                  {verdict === "passed" ? "✓ Passed" : "✗ Failed"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant capitalize">
                  {recommendation}
                </span>
              </div>
            </div>

            {/* Photo upload — now unlocked */}
            <div className="bg-ameefar-navy/5 border border-ameefar-navy/10 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">info</span>
              <div>
                <p className="text-sm font-bold text-ameefar-navy">Add evidence photos (optional)</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Photos can now be attached to the published report. They will appear in the trade timeline.
                </p>
              </div>
            </div>

            <PhotoUploadSection
              tradeId={id}
              token={token!}
              inspectionImages={inspectionImages}
              dispatch={dispatch}
            />

            {/* Done button */}
            <button
              onClick={() => router.push(`/bidding/admin/trade/${id}`)}
              className="w-full bg-ameefar-navy text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Done
            </button>
          </div>
        ) : (
          <div className="flex-1 p-8 max-w-4xl mx-auto w-full">

            {/* ── STEP 1: Checklist ── */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Stats bar */}
                {drafts.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-border-subtle rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-ameefar-navy">{drafts.length}</p>
                      <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wide mt-0.5">Total</p>
                    </div>
                    <div className="bg-trust-green-subtle border border-secondary/20 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-secondary">{metCount}</p>
                      <p className="text-xs text-secondary/70 uppercase font-bold tracking-wide mt-0.5">Met</p>
                    </div>
                    <div className={`rounded-xl p-4 text-center border ${failedCount > 0 ? "bg-red-50 border-error/20" : "bg-white border-border-subtle"}`}>
                      <p className={`text-2xl font-bold ${failedCount > 0 ? "text-error" : "text-on-surface-variant"}`}>{failedCount}</p>
                      <p className={`text-xs uppercase font-bold tracking-wide mt-0.5 ${failedCount > 0 ? "text-error/70" : "text-on-surface-variant"}`}>Not Met</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h2 className="font-headline-md text-headline-md text-ameefar-navy">Inspection Checklist</h2>
                </div>

                {requirements.length === 0 ? (
                  <div className="bg-white border border-border-subtle rounded-xl p-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl block mb-2">checklist</span>
                    No buyer requirements defined for this inspection.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requirements.map((req, i) => {
                      const draft = drafts[i];
                      if (!draft) return null;
                      return <RequirementCard key={req.id} req={req} draft={draft} onChange={updateDraft} />;
                    })}
                  </div>
                )}

                {/* Next */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 bg-ameefar-navy text-white font-bold px-8 py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition-all"
                  >
                    Continue to Verdict
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Verdict & Findings ── */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-headline-md text-headline-md text-ameefar-navy">Verdict &amp; Findings</h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Record your final outcome and detailed observations.
                  </p>
                </div>

                {/* Verdict selector — full width, prominent */}
                <div className="bg-white border border-border-subtle rounded-xl p-6">
                  <h3 className="font-bold text-ameefar-navy mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">gavel</span>
                    Inspection Outcome <span className="text-error ml-1">*</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4">
                    Did the goods meet the buyer's requirements?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setVerdict("passed")}
                      className={`flex flex-col items-center gap-2 py-6 rounded-xl font-bold text-sm transition-all border-2 ${verdict === "passed"
                        ? "border-secondary bg-trust-green-subtle text-secondary shadow-sm"
                        : "border-border-subtle bg-surface-gray hover:border-secondary/40 text-on-surface-variant"
                        }`}
                    >
                      <span className={`material-symbols-outlined text-3xl ${verdict === "passed" ? "text-secondary" : "text-on-surface-variant"}`}>check_circle</span>
                      Passed
                      <span className="text-xs font-normal opacity-70">All critical requirements met</span>
                    </button>
                    <button
                      onClick={() => setVerdict("failed")}
                      className={`flex flex-col items-center gap-2 py-6 rounded-xl font-bold text-sm transition-all border-2 ${verdict === "failed"
                        ? "border-error bg-red-50 text-error shadow-sm"
                        : "border-border-subtle bg-surface-gray hover:border-error/40 text-on-surface-variant"
                        }`}
                    >
                      <span className={`material-symbols-outlined text-3xl ${verdict === "failed" ? "text-error" : "text-on-surface-variant"}`}>cancel</span>
                      Failed
                      <span className="text-xs font-normal opacity-70">One or more requirements unmet</span>
                    </button>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-white border border-border-subtle rounded-xl p-6">
                  <h3 className="font-bold text-ameefar-navy mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">recommend</span>
                    Recommendation <span className="text-error ml-1">*</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-4">What should happen next with this trade?</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["proceed", "renegotiate", "cancel"] as InspectionRecommendation[]).map((r) => {
                      const meta: Record<string, { icon: string; label: string; sub: string; active: string }> = {
                        proceed: { icon: "arrow_forward", label: "Proceed", sub: "Trade continues as agreed", active: "border-secondary bg-trust-green-subtle text-secondary" },
                        renegotiate: { icon: "sync", label: "Renegotiate", sub: "Terms need adjustment", active: "border-amber-500 bg-amber-50 text-amber-700" },
                        cancel: { icon: "block", label: "Cancel Trade", sub: "Trade cannot proceed", active: "border-error bg-red-50 text-error" },
                      };
                      const m = meta[r];
                      return (
                        <button
                          key={r}
                          onClick={() => setRecommendation(r)}
                          className={`flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl font-bold text-xs transition-all border-2 ${recommendation === r ? m.active : "border-border-subtle bg-surface-gray hover:border-slate-300 text-on-surface-variant"
                            }`}
                        >
                          <span className="material-symbols-outlined text-xl">{m.icon}</span>
                          {m.label}
                          <span className="font-normal opacity-70 text-center leading-tight">{m.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-white border border-border-subtle rounded-xl p-6">
                  <h3 className="font-bold text-ameefar-navy mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">summarize</span>
                    Executive Summary <span className="text-error ml-1">*</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3">
                    A concise summary visible to both buyer and seller. Min. 10 characters.
                  </p>
                  <textarea
                    rows={4}
                    placeholder="Summarise the overall inspection outcome and key observations..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none"
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    {summary.trim().length > 0 && summary.trim().length < 10 ? (
                      <p className="text-error text-[11px]">Minimum 10 characters required</p>
                    ) : <span />}
                    <p className="text-[11px] text-on-surface-variant">{summary.length} chars</p>
                  </div>
                </div>

                {/* Detailed Findings */}
                <div className="bg-white border border-border-subtle rounded-xl p-6">
                  <h3 className="font-bold text-ameefar-navy mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                    Detailed Findings
                    <span className="text-xs font-normal text-on-surface-variant ml-1">(optional)</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant mb-3">
                    Full on-site findings — weight verification, packaging condition, equipment used, deviations.
                  </p>
                  <textarea
                    rows={5}
                    placeholder="Describe the full on-site findings..."
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    className="w-full bg-surface-gray border border-border-subtle rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* Nav */}
                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 border border-border-subtle bg-white text-on-surface-variant font-bold px-6 py-3 rounded-xl hover:bg-surface-gray transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to Checklist
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={summary.trim().length < 10}
                    className="flex items-center gap-2 bg-ameefar-navy text-white font-bold px-8 py-3.5 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
                  >
                    Review &amp; Submit
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Review & Submit ── */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-headline-md text-headline-md text-ameefar-navy">Review &amp; Submit</h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Check everything before publishing. This action notifies the buyer and seller.
                  </p>
                </div>

                {/* Summary review card */}
                <div className="bg-white border border-border-subtle rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">preview</span>
                    <h3 className="font-bold text-ameefar-navy">Report Summary</h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wide mb-1">Verdict</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${verdict === "passed" ? "bg-trust-green-subtle text-secondary" : "bg-red-50 text-error"}`}>
                        <span className="material-symbols-outlined text-[16px]">{verdict === "passed" ? "check_circle" : "cancel"}</span>
                        {verdict === "passed" ? "Passed" : "Failed"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wide mb-1">Recommendation</p>
                      <span className="font-bold text-ameefar-navy capitalize">{recommendation}</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wide mb-1">Requirements</p>
                      <span className="font-bold text-ameefar-navy">{metCount}/{drafts.length} met</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wide mb-1">Report Document</p>
                      <span className={`font-medium ${reportFile ? "text-ameefar-navy" : "text-on-surface-variant italic"}`}>
                        {reportFile ? reportFile.name : "None attached"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wide mb-1">Executive Summary</p>
                      <p className="text-ameefar-navy">{summary}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full border-t border-border-subtle py-3 text-xs font-bold text-primary hover:bg-surface-gray transition-all text-center"
                  >
                    Edit findings &amp; verdict
                  </button>
                </div>

                {/* Attach report doc */}
                <div className="bg-white border border-border-subtle rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-ameefar-navy flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">attach_file</span>
                      Report Document
                      <span className="text-xs font-normal text-on-surface-variant">(optional)</span>
                    </h3>
                  </div>
                  <div
                    className="border-2 border-dashed border-border-subtle rounded-xl p-5 text-center hover:border-primary/50 cursor-pointer transition-colors group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="material-symbols-outlined text-2xl text-on-surface-variant group-hover:text-primary transition-colors">cloud_upload</span>
                    {reportFile ? (
                      <>
                        <p className="text-sm font-bold text-ameefar-navy mt-1 break-all">{reportFile.name}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{(reportFile.size / 1024).toFixed(1)} KB</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-ameefar-navy mt-1">Attach Inspection Report</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-wide">PDF, DOCX up to 20MB</p>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setReportFile(e.target.files?.[0] ?? null)} />
                  {reportFile && (
                    <button
                      className="mt-2 text-xs text-error hover:underline w-full text-center"
                      onClick={() => { setReportFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    >
                      Remove file
                    </button>
                  )}
                </div>

                {/* Note about photos */}
                <div className="bg-ameefar-navy/5 border border-ameefar-navy/10 rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-ameefar-navy/60 mt-0.5 text-[20px]">photo_library</span>
                  <div>
                    <p className="text-sm font-bold text-ameefar-navy">Evidence photos are added after submission</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Once the report is published, you'll be taken to a photo upload screen to attach on-site evidence.
                    </p>
                  </div>
                </div>

                {/* Nav */}
                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 border border-border-subtle bg-white text-on-surface-variant font-bold px-6 py-3 rounded-xl hover:bg-surface-gray transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || summary.trim().length < 10}
                    className="flex items-center gap-2 bg-secondary text-white font-bold px-10 py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Publish to Buyer &amp; Seller
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}