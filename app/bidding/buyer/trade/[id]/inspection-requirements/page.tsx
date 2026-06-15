"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAccessToken } from "@/store/auth/authSelectors";
import { fetchTradeThunk, createInspectionRequirementsThunk, setInspectionRequirementsThunk } from "@/store/bidding/biddingThunks";
import type { InspectionRequirementInput, InspectionValueType, InspectionOperator } from "@/types/bidding";

interface DraftRequirement extends InspectionRequirementInput {
  ui_id: string; // Internal UI ID for mapping
}

const DEFAULT_REQUIREMENTS: DraftRequirement[] = [
  {
    ui_id: "default-1",
    name: "Contamination Concentration",
    description: "Maximum allowable non-PET debris (paper, adhesives, other plastics).",
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
    target_boolean: true,
    is_mandatory: true,
  },
  {
    ui_id: "default-4",
    name: "Material Purity",
    description: "Minimum required percentage of prime PET polymer.",
    value_type: "percent",
    operator: "gt",
    target_value: "98.5",
    unit: "%",
    is_mandatory: true,
  },
];

export default function TradeInspectionRequirementsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const { currentTrade, status } = useAppSelector((state) => state.bidding);

  const [requirements, setRequirements] = useState<DraftRequirement[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (token && id) {
      dispatch(fetchTradeThunk({ token, tradeId: id }));
    }
  }, [dispatch, token, id]);

  // Initialize from draft if available, otherwise use defaults
  useEffect(() => {
    if (currentTrade?.inspection_requirements && currentTrade.inspection_requirements.length > 0) {
      setRequirements(
        currentTrade.inspection_requirements.map((req) => ({
          ui_id: req.id,
          name: req.name,
          description: req.description,
          value_type: req.value_type,
          operator: req.operator,
          target_value: req.target_value ?? undefined,
          target_boolean: req.target_boolean ?? undefined,
          unit: req.unit,
          is_mandatory: req.is_mandatory,
        }))
      );
    } else if (currentTrade && requirements.length === 0) {
      setRequirements(DEFAULT_REQUIREMENTS);
    }
  }, [currentTrade]);

  const updateRequirement = (ui_id: string, updates: Partial<DraftRequirement>) => {
    setRequirements((prev) =>
      prev.map((req) => (req.ui_id === ui_id ? { ...req, ...updates } : req))
    );
  };

  const removeRequirement = (ui_id: string) => {
    setRequirements((prev) => prev.filter((req) => req.ui_id !== ui_id));
  };

  const addCustomRequirement = () => {
    setRequirements([
      ...requirements,
      {
        ui_id: `custom-${Date.now()}`,
        name: "Custom Parameter",
        description: "Describe the custom parameter.",
        value_type: "percent",
        operator: "lte",
        target_value: "0",
        unit: "%",
        is_mandatory: true,
      },
    ]);
  };

  const buildPayload = () => {
    return {
      requirements: requirements.map((req, index) => {
        const base: any = {
          name: req.name,
          description: req.description,
          value_type: req.value_type,
          operator: req.operator,
          is_mandatory: req.is_mandatory,
          sort_order: index,
        };

        if (req.unit) base.unit = req.unit;

        if (req.operator === "between") {
          base.min_value = req.min_value || "0";
          base.max_value = req.max_value || "0";
        } else if (req.operator === "absent" || req.operator === "present") {
          // No target needed
        } else if (req.value_type === "boolean") {
          base.target_boolean = req.target_boolean ?? false;
        } else if (req.value_type === "text") {
          base.target_text = req.target_text || "";
        } else {
          base.target_value = req.target_value || "0";
        }

        return base;
      }),
    };
  };

  const handleSaveDraft = async () => {
    if (!token || !id) return;
    setIsSaving(true);
    const payload = buildPayload();
    await dispatch(setInspectionRequirementsThunk({ token, tradeId: id, ...payload }));
    setIsSaving(false);
  };

  const handleSaveAndProceed = async () => {
    if (!token || !id) return;
    setIsSaving(true);
    const payload = buildPayload();
    const result = await dispatch(createInspectionRequirementsThunk({ token, tradeId: id, ...payload }));

    if (createInspectionRequirementsThunk.fulfilled.match(result)) {
      const paymentInfo = result.payload.data.inspection_fee_payment;
      if (paymentInfo && paymentInfo.paystack_authorization_url) {
        window.open(paymentInfo.paystack_authorization_url, "_blank");
        router.push(`/bidding/buyer/trade/${id}`);
      } else {
        router.push(`/bidding/buyer/trade/${id}`);
      }
    }
    setIsSaving(false);
  };

  if (!currentTrade || status.fetchTrade === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-gray">
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 border-4 border-ameefar-navy border-t-transparent rounded-full animate-spin" />
          <p className="text-on-surface-variant font-body-md">Loading trade details...</p>
        </div>
      </div>
    );
  }

  const getOperatorSymbol = (op: string) => {
    switch (op) {
      case "lt": return "<";
      case "lte": return "≤";
      case "gt": return ">";
      case "gte": return "≥";
      case "eq": return "=";
      default: return "";
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-surface-gray font-body-md text-on-surface">
      <main className="flex-1 flex flex-col min-h-screen pt-16">

        {/* Page Content */}
        <div className="flex-1 px-margin-desktop py-10 max-w-container-max mx-auto w-full">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-8 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
            <button onClick={() => router.push("/bidding/buyer/negotiations")} className="hover:text-primary">Trades</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <button onClick={() => router.push(`/bidding/buyer/trade/${id}`)} className="hover:text-primary">{currentTrade.reference}</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">Inspection Parameters</span>
          </nav>

          <div className="grid grid-cols-12 gap-gutter">
            {/* Header & Intro */}
            <div className="col-span-12 lg:col-span-8">
              <h2 className="font-display-lg text-headline-lg text-primary mb-2">Trade Inspection Parameters</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Define the precise technical thresholds that the material must adhere to. These parameters will be used by the third-party inspector to certify the batch for acceptance.
              </p>
            </div>

            {/* Trade Context Summary Card */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white border border-border-subtle p-6 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-tighter">Trade Context</span>
                  <span className="bg-primary-container text-on-primary-container px-2 py-0.5 font-label-md text-[10px] font-bold rounded">INSPECTION PENDING</span>
                </div>
                <div>
                  <div className="font-display-lg text-headline-md text-primary">{currentTrade.reference}</div>
                  <div className="font-body-md text-body-md font-semibold text-on-surface">{currentTrade.listing_name}</div>
                </div>
                <div className="flex justify-between border-t border-border-subtle pt-4">
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-label-md uppercase">Quantity</p>
                    <p className="font-label-md text-body-md font-bold text-primary">{currentTrade.quantity} {currentTrade.unit.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-on-surface-variant font-label-md uppercase">Location</p>
                    <p className="font-label-md text-body-md font-bold text-primary">{currentTrade.delivery_address || "TBD"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Parameters Form */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white border border-border-subtle p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-border-subtle">
                  <h3 className="font-headline-md text-headline-md text-primary">Define Acceptance Criteria</h3>
                  <button
                    onClick={addCustomRequirement}
                    className="text-primary flex items-center gap-2 font-body-md text-body-md font-semibold hover:underline"
                  >
                    <span className="material-symbols-outlined">add_circle</span>
                    Add Custom Parameter
                  </button>
                </div>

                <div className="space-y-6">
                  {requirements.map((req) => (
                    <div key={req.ui_id} className="parameter-card group grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border border-border-subtle transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
                      <div>
                        {req.ui_id.startsWith("custom-") ? (
                          <input
                            value={req.name}
                            onChange={(e) => updateRequirement(req.ui_id, { name: e.target.value })}
                            className="font-headline-md text-body-lg font-bold text-ameefar-navy mb-1 uppercase tracking-tight bg-transparent border-b border-dashed border-border-subtle outline-none focus:border-primary w-full"
                          />
                        ) : (
                          <h4 className="font-headline-md text-body-lg font-bold text-ameefar-navy mb-1 uppercase tracking-tight">{req.name}</h4>
                        )}

                        {req.ui_id.startsWith("custom-") ? (
                          <input
                            value={req.description}
                            onChange={(e) => updateRequirement(req.ui_id, { description: e.target.value })}
                            className="text-on-surface-variant font-body-sm text-body-sm bg-transparent border-b border-dashed border-border-subtle outline-none focus:border-primary w-full"
                          />
                        ) : (
                          <p className="text-on-surface-variant font-body-sm text-body-sm">{req.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        {req.value_type === "boolean" ? (
                          <div className="flex items-center justify-end flex-1">
                            <div className="flex items-center bg-surface-gray p-1 rounded-sm w-full max-w-[200px]">
                              <button
                                onClick={() => updateRequirement(req.ui_id, { target_boolean: true, operator: "absent" })}
                                className={`flex-1 py-2 font-label-md text-label-md ${req.target_boolean ? 'bg-white shadow-sm text-primary font-bold' : 'text-on-surface-variant opacity-50'}`}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => updateRequirement(req.ui_id, { target_boolean: false, operator: "eq" })}
                                className={`flex-1 py-2 font-label-md text-label-md ${!req.target_boolean ? 'bg-white shadow-sm text-primary font-bold' : 'text-on-surface-variant opacity-50'}`}
                              >
                                Tolerated
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative flex-1 flex gap-2">
                            {req.ui_id.startsWith("custom-") && (
                              <select
                                value={req.operator}
                                onChange={(e) => updateRequirement(req.ui_id, { operator: e.target.value as InspectionOperator })}
                                className="bg-surface-gray border-none focus:ring-2 focus:ring-primary font-label-md text-primary rounded-md"
                              >
                                <option value="lt">&lt;</option>
                                <option value="lte">≤</option>
                                <option value="gt">&gt;</option>
                                <option value="gte">≥</option>
                                <option value="eq">=</option>
                              </select>
                            )}
                            <div className="relative flex-[2]">
                              {!req.ui_id.startsWith("custom-") && (
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                  <span className="text-on-surface-variant font-label-md">{getOperatorSymbol(req.operator)}</span>
                                </div>
                              )}
                              <input
                                className={`w-full ${!req.ui_id.startsWith("custom-") ? 'pl-8' : 'pl-3'} py-3 bg-surface-gray border-none focus:ring-2 focus:ring-primary font-label-md text-body-lg text-primary text-right rounded-md`}
                                style={{ fontFamily: "'JetBrains Mono'" }}
                                type="text"
                                value={req.target_value || ""}
                                onChange={(e) => updateRequirement(req.ui_id, { target_value: e.target.value.replace(/[^0-9.]/g, '') })}
                                placeholder="Value"
                              />
                            </div>
                            <input
                              list="unit-options"
                              className="w-24 bg-surface-gray border-none focus:ring-2 focus:ring-primary font-label-md text-primary rounded-md px-3 py-3"
                              value={req.unit || ""}
                              onChange={(e) => updateRequirement(req.ui_id, { unit: e.target.value })}
                              placeholder="Unit"
                            />
                          </div>
                        )}

                        <button
                          onClick={() => removeRequirement(req.ui_id)}
                          className="text-on-surface-variant hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined">delete_outline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {requirements.length === 0 && (
                    <div className="text-center py-8 text-on-surface-variant">
                      No parameters defined. Add a custom parameter to continue.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Inspection Workflow Sidebar */}
            <div className="col-span-12 lg:col-span-4">
              <div className="space-y-gutter sticky top-24">
                <div className="bg-white border border-border-subtle p-6 shadow-sm">
                  <h4 className="font-headline-md text-body-md font-bold text-primary mb-6">Inspection Progress</h4>
                  <div className="space-y-8 relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-border-subtle" style={{ background: "repeating-linear-gradient(to bottom, #E2E8F0, #E2E8F0 4px, transparent 4px, transparent 8px)" }}></div>

                    <div className="relative flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center z-10">
                        <span className="material-symbols-outlined text-white text-[14px]">check</span>
                      </div>
                      <div>
                        <p className="font-body-sm text-body-sm font-bold text-primary">Inspection Requested</p>
                        <p className="text-[12px] text-on-surface-variant">Completed</p>
                      </div>
                    </div>

                    <div className="relative flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      <div>
                        <p className="font-body-sm text-body-sm font-bold text-primary">Define Parameters</p>
                        <p className="text-[12px] text-on-surface-variant font-medium">Active - Awaiting Input</p>
                      </div>
                    </div>

                    <div className="relative flex gap-4 items-start opacity-50">
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white z-10"></div>
                      <div>
                        <p className="font-body-sm text-body-sm font-bold text-slate-500">Inspector Assignment</p>
                        <p className="text-[12px] text-slate-400">Pending parameter save</p>
                      </div>
                    </div>

                    <div className="relative flex gap-4 items-start opacity-50">
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white z-10"></div>
                      <div>
                        <p className="font-body-sm text-body-sm font-bold text-slate-500">Final Verification</p>
                        <p className="text-[12px] text-slate-400">Locked</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Reference Card */}
                <div className="bg-primary p-6 shadow-sm overflow-hidden relative">
                  <div className="relative z-10">
                    <h4 className="font-headline-md text-body-md font-bold text-white mb-4">Parameter Guidelines</h4>
                    <ul className="space-y-3">
                      <li className="flex gap-3 text-white/80 text-body-sm">
                        <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">info</span>
                        <span>Industry standard for High-Grade PET is &lt;0.7% contamination.</span>
                      </li>
                      <li className="flex gap-3 text-white/80 text-body-sm">
                        <span className="material-symbols-outlined text-[18px] text-tertiary-fixed-dim">info</span>
                        <span>Exceeding 5% moisture may lead to structural degradation during transport.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="absolute -right-8 -bottom-8 opacity-10">
                    <span className="material-symbols-outlined text-[120px] text-white">science</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Action Bar */}
        <footer className="mt-auto w-full bg-white border-t border-border-subtle py-6 px-margin-desktop shadow-[0_-10px_20px_rgba(15,23,42,0.04)] sticky bottom-0 z-40">
          <div className="max-w-container-max mx-auto flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant font-label-md uppercase tracking-wider">Parameters Set</span>
                <span className="font-body-md text-body-md font-bold text-primary">{requirements.length.toString().padStart(2, '0')} Critical Criteria</span>
              </div>
              <div className="h-8 w-[1px] bg-border-subtle"></div>
              <p className="text-on-surface-variant font-body-sm text-body-sm max-w-sm">
                Saving will notify the seller of the required inspection thresholds.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="px-8 py-3 font-body-md text-body-md font-semibold text-primary hover:bg-surface-gray transition-colors disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                onClick={handleSaveAndProceed}
                disabled={isSaving || requirements.length === 0}
                className="px-10 py-3 font-body-md text-body-md font-bold bg-primary text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                Save & Proceed to Inspection
              </button>
            </div>
          </div>
        </footer>

        <datalist id="unit-options">
          <option value="%" />
          <option value="MT" />
          <option value="kg" />
          <option value="ppm" />
          <option value="mg/kg" />
          <option value="g/10min" />
          <option value="g/cm³" />
        </datalist>
      </main>
    </div>
  );
}
