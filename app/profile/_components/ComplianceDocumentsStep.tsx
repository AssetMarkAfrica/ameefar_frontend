"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { selectAccessToken } from "@/store/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectDocuments,
  selectProfile,
  selectProfileError,
  selectProfileOpStatus,
} from "@/store/profile/profileSelectors";
import {
  saveStep3Thunk,
  submitProfileThunk,
  uploadDocumentThunk,
} from "@/store/profile/profileThunks";
import type { DocType } from "@/types";

import { requiredDocuments } from "./profile-options";
import { ProfileShell } from "./ProfileShell";
import { ProfileStepper } from "./ProfileStepper";

type BankingForm = {
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
};

const emptyBanking: BankingForm = {
  account_name: "",
  account_number: "",
  bank_code: "",
  bank_name: "",
};

export function ComplianceDocumentsStep() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAccessToken);
  const profile = useAppSelector(selectProfile);
  const documents = useAppSelector(selectDocuments);
  const uploadStatus = useAppSelector((state) =>
    selectProfileOpStatus(state, "uploadDocument"),
  );
  const saveStatus = useAppSelector((state) =>
    selectProfileOpStatus(state, "saveStep3"),
  );
  const submitStatus = useAppSelector((state) =>
    selectProfileOpStatus(state, "submitProfile"),
  );
  const uploadError = useAppSelector((state) =>
    selectProfileError(state, "uploadDocument"),
  );
  const saveError = useAppSelector((state) => selectProfileError(state, "saveStep3"));
  const submitError = useAppSelector((state) =>
    selectProfileError(state, "submitProfile"),
  );
  const [banking, setBanking] = useState<BankingForm>(emptyBanking);
  const [banks, setBanks] = useState<{ name: string, code: string, country: string }[]>([]);
  const [declarationAccepted, setDeclarationAccepted] = useState(
    Boolean(profile?.declaration_accepted),
  );
  const readOnly = profile?.status === "pending" || profile?.status === "verified";
  const uploadedRequiredCount = requiredDocuments.filter((requiredDocument) =>
    documents.some((document) => document.doc_type === requiredDocument.type),
  ).length;
  const hasAllDocuments = uploadedRequiredCount === requiredDocuments.length;
  const isBankingComplete = Object.values(banking).every(Boolean);

  useEffect(() => {
    async function fetchBanks() {
      try {
        const countries = ["nigeria", "ghana", "kenya", "south africa"];
        const requests = countries.map(country => 
          fetch(`https://api.paystack.co/bank?country=${country}`).then(res => res.json())
        );
        
        const responses = await Promise.all(requests);
        const allBanks = responses.flatMap(res => res.status ? res.data : []);
        
        const uniqueBanks = Array.from(new Map(allBanks.map(b => [`${b.country}-${b.code}`, b])).values()) as any[];
        uniqueBanks.sort((a, b) => a.name.localeCompare(b.name));
        
        setBanks(uniqueBanks.map(b => ({ name: b.name, code: b.code, country: b.country })));
      } catch (err) {
        console.error("Failed to fetch banks", err);
      }
    }
    fetchBanks();
  }, []);

  async function uploadFile(type: DocType, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!token || !file || readOnly) {
      return;
    }

    try {
      await dispatch(uploadDocumentThunk({ doc_type: type, file, token })).unwrap();
    } catch {
      // The slice stores and renders the backend error message.
    } finally {
      event.target.value = "";
    }
  }

  function updateBanking<TKey extends keyof BankingForm>(
    key: TKey,
    value: BankingForm[TKey],
  ) {
    setBanking((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || readOnly || !hasAllDocuments || !declarationAccepted || !isBankingComplete) {
      return;
    }

    try {
      await dispatch(
        saveStep3Thunk({
          token,
          declaration_accepted: true,
          banking,
        }),
      ).unwrap();
      await dispatch(submitProfileThunk({ token })).unwrap();
    } catch {
      // The slice stores and renders the backend error message.
    }
  }

  return (
    <ProfileShell>
      <main className="profile-main profile-step-page">
        <ProfileStepper activeStep={3} profile={profile} />
        <form className="profile-documents-layout" onSubmit={handleSubmit}>
          <section className="profile-doc-header">
            <p className="profile-eyebrow">Step 3</p>
            <h1>Compliance & Documents</h1>
            <p>
              Upload each required document separately, complete your banking details,
              then submit your profile for review.
            </p>
          </section>

          <section className="profile-document-grid">
            {requiredDocuments.map((requiredDocument) => {
              const document = documents.find(
                (item) => item.doc_type === requiredDocument.type,
              );

              return (
                <article className="profile-document-card" key={requiredDocument.type}>
                  <div className="profile-document-card-header">
                    <span>{document ? document.status : "missing"}</span>
                    <strong>{requiredDocument.label}</strong>
                  </div>
                  <p>{requiredDocument.description}</p>
                  {document ? (
                    <div className="profile-uploaded-file">
                      <strong>{document.file_name}</strong>
                      <span>{document.uploaded_at ? "Uploaded" : "Stored"}</span>
                      {document.rejection_reason ? <p>{document.rejection_reason}</p> : null}
                    </div>
                  ) : null}
                  <label className="profile-upload-zone">
                    <input
                      disabled={readOnly || uploadStatus === "loading"}
                      onChange={(event) => uploadFile(requiredDocument.type, event)}
                      type="file"
                    />
                    <span>{document ? "Replace file" : "Drag or click to upload"}</span>
                  </label>
                </article>
              );
            })}
          </section>

          <section className="profile-form-section">
            <div className="profile-panel-heading">
              <h2>Banking Details</h2>
              <span style={{ color: "var(--color-primary, #2563eb)" }}>Required</span>
            </div>
            <div className="profile-form-grid">
              <label className="profile-field">
                <span>Bank</span>
                <select
                  disabled={readOnly || banks.length === 0}
                  required
                  onChange={(event) => {
                    const [country, code] = event.target.value.split("::");
                    const selectedBank = banks.find(b => b.code === code && b.country === country);
                    updateBanking("bank_code", code);
                    updateBanking("bank_name", selectedBank?.name || "");
                  }}
                  value={
                    banks.find(b => b.code === banking.bank_code && b.name === banking.bank_name)
                      ? `${banks.find(b => b.code === banking.bank_code && b.name === banking.bank_name)!.country}::${banking.bank_code}`
                      : ""
                  }
                >
                  <option value="" disabled>Select your bank</option>
                  {banks.map((bank) => (
                    <option key={`${bank.country}::${bank.code}`} value={`${bank.country}::${bank.code}`}>
                      {bank.name} ({bank.country})
                    </option>
                  ))}
                </select>
              </label>
              <label className="profile-field">
                <span>Account Name</span>
                <input
                  disabled={readOnly}
                  required
                  onChange={(event) =>
                    updateBanking("account_name", event.target.value)
                  }
                  value={banking.account_name}
                />
              </label>
              <label className="profile-field">
                <span>Account Number</span>
                <input
                  disabled={readOnly}
                  required
                  onChange={(event) =>
                    updateBanking("account_number", event.target.value)
                  }
                  value={banking.account_number}
                />
              </label>
            </div>
          </section>

          <section className="profile-declaration-card">
            <label>
              <input
                checked={declarationAccepted}
                disabled={readOnly}
                onChange={(event) => setDeclarationAccepted(event.target.checked)}
                required
                type="checkbox"
              />
              <span>
                I confirm that all information submitted is accurate and that I
                am authorized to represent this company.
              </span>
            </label>
          </section>

          <section className="profile-review-summary">
            <h2>Submission Checklist</h2>
            <ul>
              <li className={profile?.step1_complete ? "complete" : ""}>Company information complete</li>
              <li className={profile?.step2_complete ? "complete" : ""}>At least one site confirmed</li>
              <li className={hasAllDocuments ? "complete" : ""}>All required documents uploaded</li>
              <li className={isBankingComplete ? "complete" : ""}>Banking details provided</li>
              <li className={declarationAccepted ? "complete" : ""}>Declaration accepted</li>
            </ul>
          </section>

          <div className="profile-sticky-actions">
            <Link href="/profile/sites">Back</Link>
            <button
              disabled={
                readOnly ||
                !hasAllDocuments ||
                !declarationAccepted ||
                !isBankingComplete ||
                saveStatus === "loading" ||
                submitStatus === "loading"
              }
              type="submit"
            >
              {saveStatus === "loading" || submitStatus === "loading"
                ? "Submitting..."
                : "Submit for Review"}
            </button>
          </div>

          {uploadError || saveError || submitError ? (
            <p className="profile-error">{uploadError ?? saveError ?? submitError}</p>
          ) : null}
        </form>
      </main>
    </ProfileShell>
  );
}
