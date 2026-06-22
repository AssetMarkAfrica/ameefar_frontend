"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { selectAccessToken } from "@/store/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  approveProfileThunk,
  fetchProfileByIdThunk,
  rejectProfileThunk,
} from "@/store/profile/profileThunks";
import type { CompanyProfile } from "@/types/profile";

export default function AdminProfileDetailsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const token = useAppSelector(selectAccessToken);
  
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const profileId = params?.id as string;

  useEffect(() => {
    async function loadProfile() {
      if (!token || !profileId) return;
      try {
        setIsLoading(true);
        setError(null);
        const result = await dispatch(fetchProfileByIdThunk({ token, profileId })).unwrap();
        setProfile(result.data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [dispatch, token, profileId]);

  const handleApprove = async () => {
    if (!token || !profileId) return;
    setIsProcessing(true);
    try {
      await dispatch(approveProfileThunk({ token, profileId })).unwrap();
      router.push("/profile/pending-verifications");
    } catch (err: any) {
      alert(err.message || "Failed to approve profile");
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!token || !profileId) return;
    setIsProcessing(true);
    try {
      await dispatch(rejectProfileThunk({ token, profileId })).unwrap();
      router.push("/profile/pending-verifications");
    } catch (err: any) {
      alert(err.message || "Failed to reject profile");
      setIsProcessing(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-[#404848]">
        Please log in as an administrator to view this page.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[400px] max-w-5xl items-center justify-center p-6 lg:p-8">
        <div className="flex flex-col items-center gap-3 text-[#404848]">
          <svg className="h-8 w-8 animate-spin text-[#006d40]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-medium">Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-5xl p-6 lg:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-sm">
          <strong className="block font-semibold">Error loading profile</strong>
          <span className="text-sm">{error || "Profile not found."}</span>
        </div>
        <div className="mt-4">
          <Link href="/profile/pending-verifications" className="text-sm font-semibold text-[#006d40] hover:underline">
            &larr; Back to pending profiles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/profile/pending-verifications" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#002627] transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to pending
        </Link>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-[var(--font-hanken)] text-4xl font-semibold text-[#002627]">
                {profile.banking?.account_name || `Company Reg: ${profile.company_registration_no}`}
              </h1>
              <span className={`rounded-full px-3 py-1 font-[var(--font-jetbrains)] text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                profile.status === 'pending' 
                  ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
                  : profile.status === 'verified'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                  : profile.status === 'rejected'
                  ? 'bg-red-50 text-red-700 ring-red-600/20'
                  : 'bg-slate-50 text-slate-700 ring-slate-600/20'
              }`}>
                {profile.status}
              </span>
            </div>
            {profile.company_website && (
              <a href={profile.company_website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#006d40] hover:text-[#004d2d] hover:underline">
                {profile.company_website}
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            <p className="mt-3 text-slate-600 max-w-3xl leading-relaxed">
              {profile.company_description}
            </p>
          </div>

          {profile.status === "pending" && (
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex min-h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-5 font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex min-h-11 items-center justify-center rounded-xl bg-[#002627] px-5 font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Approve Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Company Info & Banking */}
        <div className="space-y-6 lg:col-span-2">
          {/* Company Details */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-[var(--font-hanken)] text-xl font-semibold text-[#002627]">Company Details</h2>
            <div className="grid gap-y-4 gap-x-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Registration Number</dt>
                <dd className="mt-1 font-medium text-[#002627]">{profile.company_registration_no || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">VAT Region</dt>
                <dd className="mt-1 font-medium uppercase text-[#002627]">{profile.vat_region || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">VAT Number</dt>
                <dd className="mt-1 font-medium text-[#002627]">{profile.vat_registration_no || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Company Size</dt>
                <dd className="mt-1 font-medium text-[#002627]">{profile.company_size || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Year Established</dt>
                <dd className="mt-1 font-medium text-[#002627]">{profile.year_established || "N/A"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Primary Address</dt>
                <dd className="mt-1 font-medium text-[#002627]">
                  {profile.street_address}
                  {profile.address_line_2 && `, ${profile.address_line_2}`}
                  <br />
                  {profile.city}, {profile.state_region} {profile.postcode}
                  <br />
                  {profile.country}
                </dd>
              </div>
            </div>
          </section>

          {/* Sites */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-[var(--font-hanken)] text-xl font-semibold text-[#002627]">Operating Sites ({profile.sites?.length || 0})</h2>
            <div className="grid gap-4">
              {profile.sites?.map((site) => (
                <div key={site.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-[#002627]">{site.site_name}</h3>
                      <p className="mt-1 text-sm text-slate-600 capitalize">{site.site_type} {site.is_primary && "(Primary)"}</p>
                    </div>
                    {site.has_export_capability && (
                      <span className="rounded-full bg-[#eff4ff] px-2 py-1 text-xs font-semibold text-[#002627]">
                        Export Capable
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <span className="font-medium text-slate-500">Location:</span> {site.city}, {site.country}
                    </div>
                    <div>
                      <span className="font-medium text-slate-500">Capacity:</span> {site.monthly_capacity}
                    </div>
                    <div>
                      <span className="font-medium text-slate-500">Contact:</span> {site.contact_person}
                    </div>
                    <div>
                      <span className="font-medium text-slate-500">Materials:</span> {site.materials_handled?.join(", ")}
                    </div>
                  </div>
                </div>
              ))}
              {(!profile.sites || profile.sites.length === 0) && (
                <p className="text-sm text-slate-500">No sites added.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Banking & Documents */}
        <div className="space-y-6">
          {/* Banking */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-[var(--font-hanken)] text-xl font-semibold text-[#002627]">Banking Details</h2>
            {profile.banking ? (
              <div className="space-y-3">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Bank Name</dt>
                  <dd className="font-medium text-[#002627]">{profile.banking.bank_name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Account Name</dt>
                  <dd className="font-medium text-[#002627]">{profile.banking.account_name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Account Number</dt>
                  <dd className="font-medium text-[#002627]">{profile.banking.account_number}</dd>
                </div>
                {/* Note: some banks use sort_code or swift_code, we just show what's there */}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No banking details provided.</p>
            )}
          </section>

          {/* Documents */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-[var(--font-hanken)] text-xl font-semibold text-[#002627]">Documents</h2>
            <div className="grid gap-3">
              {profile.documents?.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.file}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 transition hover:border-[#006d40] hover:bg-[#ecfdf5]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#002627]">{doc.doc_type.replace(/_/g, ' ')}</p>
                    <p className="truncate text-xs text-slate-500">{doc.file_name}</p>
                  </div>
                  <svg className="ml-3 h-5 w-5 shrink-0 text-[#006d40]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
              {(!profile.documents || profile.documents.length === 0) && (
                <p className="text-sm text-slate-500">No documents uploaded.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
