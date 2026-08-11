"use client";

import Link from "next/link";

import { selectIsBuyerOnly } from "@/store/auth/authSelectors";
import { useAppSelector } from "@/store/hooks";
import type { CompanyProfile } from "@/types/profile";

const sellerSteps = [
  { href: "/profile/company", key: "step1_complete", label: "Business Details" },
  { href: "/profile/sites", key: "step2_complete", label: "Operational Sites" },
  { href: "/profile/documents", key: "step3_complete", label: "Compliance & Documents" },
] as const;

const buyerSteps = [
  { href: "/profile/company", key: "step1_complete", label: "Business Details" },
  { href: "/profile/documents", key: "step3_complete", label: "Identity & Declaration" },
] as const;

export function ProfileStepper({
  activeStep,
  profile,
}: {
  activeStep: 1 | 2 | 3;
  profile: CompanyProfile | null;
}) {
  const isBuyerOnly = useAppSelector(selectIsBuyerOnly);
  const steps = isBuyerOnly ? buyerSteps : sellerSteps;
  const completion = profile?.completion_percentage ?? 0;

  // For buyers: step 3 on page = step 2 in the buyer stepper display.
  const displayStep = isBuyerOnly && activeStep === 3 ? 2 : activeStep;

  return (
    <section className="profile-stepper" aria-label="Verification steps">
      <div className="profile-stepper-header">
        <span>Verification workflow</span>
        <strong>{completion}% Complete</strong>
      </div>
      <div className="profile-progress-track">
        <span style={{ width: `${completion}%` }} />
      </div>
      <ol>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = Boolean(profile?.[step.key as keyof CompanyProfile] as boolean);
          const isActive = displayStep === stepNumber;
          const isLocked = isBuyerOnly
            ? stepNumber === 2 && !profile?.step1_complete
            : stepNumber === 2
              ? !profile?.step1_complete
              : stepNumber === 3
                ? !profile?.step2_complete
                : false;

          return (
            <li
              className={[
                isComplete ? "complete" : "",
                isActive ? "active" : "",
                isLocked ? "locked" : "",
              ].join(" ")}
              key={step.href}
            >
              {isLocked ? (
                <span>{step.label}</span>
              ) : (
                <Link href={step.href}>{step.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
