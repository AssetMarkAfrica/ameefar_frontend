"use client";

import { useEffect, useState } from "react";

import { selectAccessToken } from "@/store/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  approveProfileThunk,
  fetchPendingProfilesThunk,
  rejectProfileThunk,
} from "@/store/profile/profileThunks";
import type { CompanyProfile } from "@/types/profile";

export default function AdminProfileApprovalsPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfiles() {
      if (!token) return;
      try {
        setIsLoading(true);
        setError(null);
        const result = await dispatch(fetchPendingProfilesThunk({ token })).unwrap();
        setProfiles(result.data);
      } catch (err: any) {
        setError(err.message || "Failed to load pending profiles.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfiles();
  }, [dispatch, token]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    setProcessingId(id);
    try {
      await dispatch(approveProfileThunk({ token, profileId: id })).unwrap();
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to approve profile");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    setProcessingId(id);
    try {
      await dispatch(rejectProfileThunk({ token, profileId: id })).unwrap();
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to reject profile");
    } finally {
      setProcessingId(null);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-[#404848]">
        Please log in as an administrator to view this page.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-[var(--font-jetbrains)] text-xs font-bold uppercase tracking-wide text-[#006d40]">
            Administration
          </p>
          <h1 className="mt-2 font-[var(--font-hanken)] text-4xl font-semibold text-[#002627]">
            Pending Profiles
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Review and approve or reject newly submitted company profiles. Approving a profile allows the company to participate in the marketplace.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
          <strong className="block font-semibold">Error loading profiles</strong>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Main Content */}
      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 text-[#404848]">
            <svg className="h-8 w-8 animate-spin text-[#006d40]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-medium">Loading pending profiles...</p>
          </div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="rounded-full bg-emerald-50 p-4 text-[#006d40]">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div>
            <h3 className="font-[var(--font-hanken)] text-xl font-semibold text-[#002627]">All caught up!</h3>
            <p className="mt-1 text-slate-500">There are no pending profiles waiting for approval.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md md:flex-row"
            >
              <div className="flex-1 p-6 lg:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-[#eff4ff] px-3 py-1 font-[var(--font-jetbrains)] text-[10px] font-bold uppercase tracking-wide text-[#002627] ring-1 ring-inset ring-[#002627]/10">
                    Pending Review
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    Submitted: {new Date(profile.submitted_at || profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <h2 className="font-[var(--font-hanken)] text-2xl font-semibold text-[#002627]">
                  {profile.banking?.account_name || `Company Reg: ${profile.company_registration_no}`}
                </h2>
                {profile.company_website && (
                  <a
                    href={profile.company_website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[#006d40] hover:text-[#004d2d] hover:underline"
                  >
                    {profile.company_website}
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}

                <p className="mt-4 text-sm leading-relaxed text-[#404848]">
                  {profile.company_description || "No description provided."}
                </p>

                <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Size</dt>
                    <dd className="mt-1 font-semibold text-[#002627]">{profile.company_size || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">VAT Reg</dt>
                    <dd className="mt-1 font-semibold text-[#002627]">{profile.vat_registration_no || "N/A"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Location</dt>
                    <dd className="mt-1 font-semibold text-[#002627]">{profile.city}, {profile.country}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Sites</dt>
                    <dd className="mt-1 font-semibold text-[#002627]">{profile.sites?.length || 0}</dd>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 border-t border-slate-100 bg-slate-50/50 p-6 md:w-64 md:border-l md:border-t-0">
                <button
                  onClick={() => handleApprove(profile.id)}
                  disabled={processingId !== null}
                  className="flex w-full min-h-11 items-center justify-center rounded-xl bg-[#002627] px-4 font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processingId === profile.id ? "Processing..." : "Approve Profile"}
                </button>
                <button
                  onClick={() => handleReject(profile.id)}
                  disabled={processingId !== null}
                  className="flex w-full min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 font-semibold text-red-600 shadow-sm transition hover:bg-red-50 hover:border-red-200 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processingId === profile.id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
