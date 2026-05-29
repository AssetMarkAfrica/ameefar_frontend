"use client";

import Link from "next/link";

import type { CompanyProfile } from "@/types";

const steps = [
  { href: "/profile/company", key: "step1_complete", label: "Company Information" },
  { href: "/profile/sites", key: "step2_complete", label: "Operational Sites" },
  { href: "/profile/documents", key: "step3_complete", label: "Compliance & Documents" },
] as const;

export function ProfileStepper({
  activeStep,
  profile,
}: {
  activeStep: 1 | 2 | 3;
  profile: CompanyProfile | null;
}) {
  const completion = profile?.completion_percentage ?? 0;

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
          const isComplete = Boolean(profile?.[step.key]);
          const isActive = activeStep === stepNumber;
          const isLocked =
            stepNumber === 2
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
