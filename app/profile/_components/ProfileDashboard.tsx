"use client";

import Link from "next/link";

import { selectIsBuyerOnly } from "@/store/auth/authSelectors";
import { useAppSelector } from "@/store/hooks";
import {
  selectDocuments,
  selectPrimarySite,
  selectProfile,
  selectSites,
} from "@/store/profile/profileSelectors";

import { getEarliestAllowedPath, ProfileShell } from "./ProfileShell";
import { buyerRequiredDocuments, requiredDocuments } from "./profile-options";

export function ProfileDashboard() {
  const isBuyerOnly = useAppSelector(selectIsBuyerOnly);
  const profile = useAppSelector(selectProfile);
  const sites = useAppSelector(selectSites);
  const primarySite = useAppSelector(selectPrimarySite);
  const documents = useAppSelector(selectDocuments);
  const status = profile?.status ?? "incomplete";
  const completion = profile?.completion_percentage ?? 0;
  const nextPath = profile
    ? getEarliestAllowedPath(profile, isBuyerOnly)
    : "/profile/company";

  // Use the correct required doc list for the role.
  const docList = isBuyerOnly ? buyerRequiredDocuments : requiredDocuments;
  const uploadedRequiredCount = docList.filter((requiredDocument) =>
    documents.some((document) => document.doc_type === requiredDocument.type),
  ).length;

  return (
    <ProfileShell>
      <main className="profile-main profile-dashboard">
        <section className={`profile-status-card status-${status}`}>
          <div className="profile-progress-ring" style={{ "--progress": completion } as React.CSSProperties}>
            <span>{completion}%</span>
          </div>
          <div>
            <p className="profile-eyebrow">Profile Dashboard</p>
            <h1>Verification: {formatStatus(status)}</h1>
            <p>
              {status === "pending"
                ? "Your profile is under review. Editing is locked while our team verifies your submission."
                : status === "verified"
                  ? "Your company profile is verified and ready for marketplace activity."
                  : status === "rejected"
                    ? profile?.rejection_reason || "Your submission needs updates before it can be approved."
                    : "Complete the verification steps below to unlock full trading access."}
            </p>
            {status === "incomplete" || status === "rejected" ? (
              <Link className="profile-primary-button" href={nextPath}>
                {status === "rejected" ? "Fix & Resubmit" : "Continue Verification"}
              </Link>
            ) : null}
          </div>
        </section>

        <section className="profile-dashboard-grid">
          <div className="profile-panel profile-wide-panel">
            <div className="profile-panel-heading">
              <h2>Missing Requirements</h2>
              <span>{completion === 100 ? "Ready" : "Action Needed"}</span>
            </div>
            <div className="profile-requirements">
              {/* Step 1 — always shown */}
              <RequirementRow
                complete={Boolean(profile?.step1_complete)}
                href="/profile/company"
                text={
                  isBuyerOnly
                    ? "Provide your company name, country, and a registration or VAT number."
                    : "Complete company identity, VAT, registration, and address details."
                }
                title="Business Details"
              />

              {/* Step 2 — Operational Sites (sellers/both only) */}
              {!isBuyerOnly && (
                <RequirementRow
                  complete={Boolean(profile?.step2_complete)}
                  href="/profile/sites"
                  locked={!profile?.step1_complete}
                  text="Add at least one operational site, then confirm site setup."
                  title="Operational Sites"
                />
              )}

              {/* Step 3 — Documents / Declaration */}
              <RequirementRow
                complete={Boolean(profile?.step3_complete)}
                href="/profile/documents"
                locked={isBuyerOnly ? !profile?.step1_complete : !profile?.step2_complete}
                text={
                  isBuyerOnly
                    ? "Upload your government-issued ID and accept the declaration."
                    : "Upload all required documents and accept the final declaration."
                }
                title={isBuyerOnly ? "Identity & Declaration" : "Compliance & Documents"}
              />
            </div>
          </div>

          {/* Company Info card — always shown */}
          <OverviewCard
            cta="Edit"
            href="/profile/company"
            label={profile?.step1_complete ? "Complete" : "Incomplete"}
            text={`Registration: ${profile?.company_registration_no || profile?.vat_registration_no || "Not provided"}`}
            title="Company Info"
          />

          {/* Facilities & Sites — sellers/both only */}
          {!isBuyerOnly && (
            <OverviewCard
              cta="Manage Sites"
              href="/profile/sites"
              label={`${sites.length} Registered`}
              text={primarySite ? `${primarySite.site_name}, ${primarySite.city}` : "No primary site yet"}
              title="Facilities & Sites"
            />
          )}

          {/* Documents card */}
          <OverviewCard
            cta="Manage Documents"
            href="/profile/documents"
            label={`${uploadedRequiredCount}/${docList.length} Uploaded`}
            text={
              isBuyerOnly
                ? "Government-issued ID for the authorised representative."
                : "Business registration, representative ID, and proof of authority."
            }
            title="Documents"
          />

          {/* Banking — sellers/both only */}
          {!isBuyerOnly && (
            <OverviewCard
              cta="Update Banking"
              href="/profile/documents"
              label={profile?.banking?.is_verified ? "Verified" : "Optional"}
              text={profile?.banking ? maskAccount(profile.banking.account_number) : "Banking can be added before submission."}
              title="Banking"
            />
          )}
        </section>
      </main>
    </ProfileShell>
  );
}

function RequirementRow({
  complete,
  href,
  locked,
  text,
  title,
}: {
  complete: boolean;
  href: string;
  locked?: boolean;
  text: string;
  title: string;
}) {
  return (
    <div className={complete ? "complete" : ""}>
      <span>{complete ? "Done" : locked ? "Locked" : "Open"}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      {locked ? <strong>Complete previous step</strong> : <Link href={href}>{complete ? "Review" : "Start"}</Link>}
    </div>
  );
}

function OverviewCard({
  cta,
  href,
  label,
  text,
  title,
}: {
  cta: string;
  href: string;
  label: string;
  text: string;
  title: string;
}) {
  return (
    <article className="profile-overview-card">
      <span>{label}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link href={href}>{cta}</Link>
    </article>
  );
}

function formatStatus(status: string) {
  return status.replace("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

function maskAccount(accountNumber: string) {
  if (accountNumber.length <= 4) {
    return "Account linked";
  }

  return `Account ending ${accountNumber.slice(-4)}`;
}
