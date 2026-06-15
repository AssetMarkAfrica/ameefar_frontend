"use client";
import React, { useState } from "react";
import type { InspectionReport, InspectionRequirementResult } from "@/types/bidding";

const VERDICT_CONFIG = {
  passed: {
    label: "Passed",
    icon: "check_circle",
    bg: "bg-trust-green-subtle",
    border: "border-secondary/30",
    text: "text-secondary",
    iconFill: true,
  },
  failed: {
    label: "Failed",
    icon: "cancel",
    bg: "bg-red-50",
    border: "border-error/30",
    text: "text-error",
    iconFill: true,
  },
  conditional: {
    label: "Conditional",
    icon: "warning",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    iconFill: false,
  },
};

const RECOMMENDATION_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  proceed: { label: "Proceed with Trade", icon: "thumb_up", color: "text-secondary" },
  reject: { label: "Reject Shipment", icon: "thumb_down", color: "text-error" },
  renegotiate: { label: "Renegotiate Terms", icon: "sync", color: "text-amber-700" },
  cancel: { label: "Cancel Trade", icon: "cancel", color: "text-error" },
};

function RequirementResultRow({ result }: { result: InspectionRequirementResult }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${result.passed ? "bg-trust-green-subtle border-secondary/20" : "bg-red-50 border-error/20"}`}>
      <span
        className={`material-symbols-outlined text-[18px] shrink-0 ${result.passed ? "text-secondary" : "text-error"}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {result.passed ? "check_circle" : "cancel"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-ameefar-navy">{result.requirement_name}</p>
        {result.actual_value && (
          <p className="text-xs text-on-surface-variant mt-0.5">
            Measured: <span className="font-mono font-semibold">{result.actual_value}</span>
          </p>
        )}
        {result.notes && (
          <p className="text-xs text-on-surface-variant mt-0.5">{result.notes}</p>
        )}
      </div>
      <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${result.passed ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}>
        {result.passed ? "Met" : "Failed"}
      </span>
    </div>
  );
}

interface InspectionReportCardProps {
  report: InspectionReport;
  /** If true, shows approve/reject actions (buyer context) */
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  isActionLoading?: boolean;
}

export default function InspectionReportCard({
  report,
  showActions = false,
  onApprove,
  onReject,
  isActionLoading,
}: InspectionReportCardProps) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const verdict = VERDICT_CONFIG[report.verdict] ?? VERDICT_CONFIG.conditional;
  const recommendation = report.recommendation ? RECOMMENDATION_CONFIG[report.recommendation] : null;

  return (
    <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className={`p-5 border-b ${verdict.border} ${verdict.bg} flex items-center gap-4`}>
        <span
          className={`material-symbols-outlined text-[36px] ${verdict.text}`}
          style={{ fontVariationSettings: verdict.iconFill ? "'FILL' 1" : "'FILL' 0" }}
        >
          {verdict.icon}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-headline-md text-headline-md text-primary">Inspection Report</h3>
            <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${verdict.bg} ${verdict.text} border ${verdict.border}`}>
              {verdict.label}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Completed by <span className="font-semibold">{report.created_by_name}</span>
            {" · "}
            {new Date(report.created_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
        {/* Document download */}
        {report.report_document_url && (
          <a
            href={report.report_document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border-subtle rounded-lg text-sm font-semibold text-ameefar-navy hover:bg-surface-gray transition-colors shrink-0"
            title={report.report_document_name || "Download Report"}
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline truncate max-w-[140px]">
              {report.report_document_name || "Report"}
            </span>
          </a>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* ── Recommendation ── */}
        {recommendation && (
          <div className="flex items-center gap-3 p-3 bg-surface-gray rounded-lg border border-border-subtle">
            <span className={`material-symbols-outlined text-[20px] ${recommendation.color}`}>
              {recommendation.icon}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Recommendation</p>
              <p className={`font-bold text-sm ${recommendation.color}`}>{recommendation.label}</p>
            </div>
          </div>
        )}

        {/* ── Summary ── */}
        <div>
          <h4 className="font-bold text-sm text-ameefar-navy uppercase tracking-wide mb-2">Summary</h4>
          <p className="text-sm text-on-surface leading-relaxed bg-surface-gray rounded-lg p-3 border border-border-subtle">
            {report.summary || "No summary provided."}
          </p>
        </div>

        {/* ── Findings ── */}
        {report.findings && (
          <div>
            <h4 className="font-bold text-sm text-ameefar-navy uppercase tracking-wide mb-2">Findings</h4>
            <p className="text-sm text-on-surface leading-relaxed bg-surface-gray rounded-lg p-3 border border-border-subtle">
              {report.findings}
            </p>
          </div>
        )}

        {/* ── Requirement Results ── */}
        {report.requirement_results.length > 0 && (
          <div>
            <h4 className="font-bold text-sm text-ameefar-navy uppercase tracking-wide mb-3">
              Requirement Results
              <span className="ml-2 font-normal text-on-surface-variant normal-case tracking-normal">
                ({report.requirement_results.filter(r => r.passed).length}/{report.requirement_results.length} met)
              </span>
            </h4>
            <div className="space-y-2">
              {report.requirement_results.map((result) => (
                <RequirementResultRow key={result.requirement_id} result={result} />
              ))}
            </div>
          </div>
        )}

        {/* ── Photo Gallery ── */}
        {report.images.length > 0 && (
          <div>
            <h4 className="font-bold text-sm text-ameefar-navy uppercase tracking-wide mb-3">
              Inspection Photos
              <span className="ml-2 font-normal text-on-surface-variant normal-case tracking-normal">
                ({report.images.length})
              </span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {report.images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setLightboxImg(img.image_url)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-border-subtle bg-surface-gray hover:shadow-md transition-all"
                  title={img.image_name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={img.image_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[28px] opacity-0 group-hover:opacity-100 transition-opacity">
                      zoom_in
                    </span>
                  </div>
                  {img.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">
                      <p className="text-white text-[10px] truncate">{img.caption}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Buyer Actions ── */}
        {showActions && (
          <div className="pt-4 border-t border-border-subtle space-y-3">
            <p className="text-sm text-on-surface-variant text-center">
              Review the report above and confirm your decision to proceed with the trade.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onApprove}
                disabled={isActionLoading}
                className="flex items-center justify-center gap-2 py-3 bg-secondary text-on-secondary font-bold rounded-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                Approve
              </button>
              <button
                onClick={() => onReject?.("Failed quality standards")}
                disabled={isActionLoading}
                className="flex items-center justify-center gap-2 py-3 bg-white border border-error text-error font-bold rounded-lg hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">thumb_down</span>
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors text-white"
            onClick={() => setLightboxImg(null)}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg}
            alt="Inspection photo"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
