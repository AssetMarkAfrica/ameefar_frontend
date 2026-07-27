"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAuthError, selectAuthStatus } from "@/store/auth/authSelectors";
import { registerThunk } from "@/store/auth/authThunks";
import type { CompanyType, Material, Prefix, ReferralSource, UserRole } from "@/types/auth";

import { AuthFooter } from "./AuthFooter";
import { AuthHeader } from "./AuthHeader";
import {
  companyTypes,
  materials,
  prefixes,
  referralSources,
  roles,
} from "./auth-constants";
import { StatusMessage } from "./StatusMessage";

type RegisterFormState = {
  email: string;
  password: string;
  password_confirm: string;
  prefix: Prefix;
  first_name: string;
  last_name: string;
  job_title: string;
  mobile: string;
  company_name: string;
  company_type: CompanyType;
  company_type_other: string;
  role: UserRole;
  materials_of_interest: Material[];
  material_other: string;
  referral_source: ReferralSource;
  terms_accepted: boolean;
};

const initialForm: RegisterFormState = {
  email: "",
  password: "",
  password_confirm: "",
  prefix: "Mr",
  first_name: "",
  last_name: "",
  job_title: "",
  mobile: "",
  company_name: "",
  company_type: "recycler",
  company_type_other: "",
  role: "buyer",
  materials_of_interest: [],
  material_other: "",
  referral_source: "google_search",
  terms_accepted: false,
};

// ─── Benefit icons ────────────────────────────────────────────────────────────

function IconVerified() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      width="22"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield with a checkmark */}
      <path d="M12 2 L20 5.5 V12 C20 16.4 16.4 20.4 12 22 C7.6 20.4 4 16.4 4 12 V5.5 Z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconSecure() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      width="22"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Padlock */}
      <rect height="11" rx="2" ry="2" width="14" x="5" y="11" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" fill="currentColor" r="1" stroke="none" />
    </svg>
  );
}

function IconRealtime() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
      width="22"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Activity / pulse line */}
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ArrowForwardIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const status = useAppSelector((state) => selectAuthStatus(state, "register"));
  const error = useAppSelector((state) => selectAuthError(state, "register"));
  const [form, setForm] = useState<RegisterFormState>(initialForm);
  const [localError, setLocalError] = useState<string | null>(null);

  const isLoading = status === "loading";
  const hasOtherMaterial = form.materials_of_interest.includes("other");

  function updateField<TKey extends keyof RegisterFormState>(
    key: TKey,
    value: RegisterFormState[TKey],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleMaterial(material: Material) {
    setForm((current) => {
      const exists = current.materials_of_interest.includes(material);
      const nextMaterials = exists
        ? current.materials_of_interest.filter((item) => item !== material)
        : [...current.materials_of_interest, material];

      return {
        ...current,
        materials_of_interest: nextMaterials,
        material_other: nextMaterials.includes("other") ? current.material_other : "",
      };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (form.password !== form.password_confirm) {
      setLocalError("Passwords must match.");
      return;
    }

    if (form.materials_of_interest.length === 0) {
      setLocalError("Select at least one material of interest.");
      return;
    }

    try {
      await dispatch(registerThunk(form)).unwrap();
      router.push("/auth/verify-otp");
    } catch {
      // The slice stores and renders the backend error message.
    }
  }

  return (
    <div className="auth-register-page">
      <AuthHeader />
      <main className="auth-register-main">
        <section className="auth-register-intro">
          <div className="auth-register-intro-inner">
            <span className="auth-register-badge">Recycling Marketplace</span>
            <h1>Empower Your Energy Future</h1>
            <p>
              Join the enterprise network reshaping the industrial recycling supply
              chain with precision and transparency.
            </p>

            <div className="auth-benefit-list">
              <AuthBenefit
                icon={<IconVerified />}
                title="Verified Enterprise Network"
                text="Only vetted high-stakes buyers and sellers participate."
              />
              <AuthBenefit
                icon={<IconSecure />}
                title="Secure Escrow Trades"
                text="Financial protection built into every transaction flow."
              />
              <AuthBenefit
                icon={<IconRealtime />}
                title="Real-time Analytics"
                text="Live market data to inform your procurement strategy."
              />
            </div>

            <blockquote className="auth-quote">
              <div className="auth-quote-author">
                <Image
                  alt="Abdulai Pascal Mohammed"
                  height={48}
                  src="https://res.cloudinary.com/dqwub0fhb/image/upload/v1782219057/pascal_nsd1sq.jpg"
                  width={48}
                  className="object-cover rounded-full border-2 border-[#a3cfcf]"
                />
                <span>
                  <a
                    href="https://www.linkedin.com/in/abdulai-pascal-mohammed-222059345/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    <strong>Abdulai Pascal Mohammed</strong>
                  </a>
                  <small>CEO · Sustainability | rPET | Recycling</small>
                </span>
              </div>
              <p>
                &ldquo;We are building more than a marketplace; we are creating the
                infrastructure for a sustainable industrial future.&rdquo;
              </p>
            </blockquote>
          </div>
        </section>

        <section className="auth-register-card" aria-label="Registration form">
          <div className="auth-register-form-header">
            <h2>Create Your Account</h2>
            <p>
              Complete the fields below to start trading on the professional
              exchange.
            </p>
          </div>
          <form className="auth-form auth-register-form" onSubmit={handleSubmit}>
            <FormSection title="Account Credentials">
              <label className="auth-field auth-span-2">
                <span>Email Address</span>
                <input
                  autoComplete="email"
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="corporate@company.com"
                  required
                  type="email"
                  value={form.email}
                />
              </label>
              <label className="auth-field">
                <span>Password</span>
                <input
                  autoComplete="new-password"
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="********"
                  required
                  type="password"
                  value={form.password}
                />
              </label>
              <label className="auth-field">
                <span>Confirm Password</span>
                <input
                  autoComplete="new-password"
                  onChange={(event) =>
                    updateField("password_confirm", event.target.value)
                  }
                  placeholder="********"
                  required
                  type="password"
                  value={form.password_confirm}
                />
              </label>
            </FormSection>

            <FormSection title="Professional Identity" columns={3}>
              <label className="auth-field">
                <span>Prefix</span>
                <select
                  onChange={(event) => updateField("prefix", event.target.value as Prefix)}
                  value={form.prefix}
                >
                  {prefixes.map((prefix) => (
                    <option key={prefix} value={prefix}>
                      {prefix}
                    </option>
                  ))}
                </select>
              </label>
              <label className="auth-field">
                <span>First Name</span>
                <input
                  autoComplete="given-name"
                  onChange={(event) => updateField("first_name", event.target.value)}
                  placeholder="John"
                  required
                  type="text"
                  value={form.first_name}
                />
              </label>
              <label className="auth-field">
                <span>Last Name</span>
                <input
                  autoComplete="family-name"
                  onChange={(event) => updateField("last_name", event.target.value)}
                  placeholder="Doe"
                  required
                  type="text"
                  value={form.last_name}
                />
              </label>
              <label className="auth-field auth-span-2">
                <span>Job Title</span>
                <input
                  autoComplete="organization-title"
                  onChange={(event) => updateField("job_title", event.target.value)}
                  placeholder="Head of Procurement"
                  required
                  type="text"
                  value={form.job_title}
                />
              </label>
              <label className="auth-field">
                <span>Mobile Number</span>
                <input
                  autoComplete="tel"
                  onChange={(event) => updateField("mobile", event.target.value)}
                  placeholder="+1 (555) 000-0000"
                  required
                  type="tel"
                  value={form.mobile}
                />
              </label>
            </FormSection>

            <FormSection title="Company Profile">
              <label className="auth-field auth-span-2">
                <span>Company Name</span>
                <input
                  autoComplete="organization"
                  onChange={(event) => updateField("company_name", event.target.value)}
                  placeholder="Enter full legal entity name"
                  required
                  type="text"
                  value={form.company_name}
                />
              </label>
              <label className="auth-field">
                <span>Company Type</span>
                <select
                  onChange={(event) =>
                    updateField("company_type", event.target.value as CompanyType)
                  }
                  value={form.company_type}
                >
                  {companyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="auth-field">
                <span>Trading Role</span>
                <select
                  onChange={(event) => updateField("role", event.target.value as UserRole)}
                  value={form.role}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              {form.company_type === "other" ? (
                <label className="auth-field auth-span-2">
                  <span>Other Company Type</span>
                  <input
                    onChange={(event) =>
                      updateField("company_type_other", event.target.value)
                    }
                    placeholder="Specify company type"
                    required
                    type="text"
                    value={form.company_type_other}
                  />
                </label>
              ) : null}
              <div className="auth-field auth-span-2">
                <span>Materials of Interest</span>
                <div className="auth-checkbox-grid">
                  {materials.map((material) => (
                    <label key={material.value}>
                      <input
                        checked={form.materials_of_interest.includes(material.value)}
                        onChange={() => toggleMaterial(material.value)}
                        type="checkbox"
                      />
                      <span>{material.label}</span>
                    </label>
                  ))}
                </div>
                {hasOtherMaterial ? (
                  <input
                    className="auth-nested-input"
                    onChange={(event) => updateField("material_other", event.target.value)}
                    placeholder="Specify other materials"
                    required
                    type="text"
                    value={form.material_other}
                  />
                ) : null}
              </div>
            </FormSection>

            <div className="auth-form-single">
              <label className="auth-field">
                <span>Referral Source</span>
                <select
                  onChange={(event) =>
                    updateField("referral_source", event.target.value as ReferralSource)
                  }
                  value={form.referral_source}
                >
                  {referralSources.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="auth-register-actions">
                <label className="auth-terms auth-terms-register">
                  <input
                    checked={form.terms_accepted}
                    onChange={(event) =>
                      updateField("terms_accepted", event.target.checked)
                    }
                    required
                    type="checkbox"
                  />
                  <span>
                    I agree to the Ameefar Energy{" "}
                    <Link href="#">Terms of Service</Link> and{" "}
                    <Link href="#">Privacy Policy</Link>. I understand that my
                    company profile will be subject to identity verification.
                  </span>
                </label>

                {localError ? <StatusMessage>{localError}</StatusMessage> : null}
                {error ? <StatusMessage>{error}</StatusMessage> : null}

                <div className="auth-register-submit-bar">
                  <button
                    className="auth-primary-button"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? (
                      "Processing Verification..."
                    ) : (
                      <>
                        Complete Registration
                        <ArrowForwardIcon />
                      </>
                    )}
                  </button>
                </div>

                <p className="auth-form-note auth-form-note-desktop">
                  Already have an account? <Link href="/auth/login">Log in</Link>
                </p>
              </div>
            </div>
          </form>
        </section>
      </main>
      <AuthFooter />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AuthBenefit({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="auth-benefit">
      <span className="auth-benefit-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function FormSection({
  children,
  columns = 2,
  title,
}: {
  children: React.ReactNode;
  columns?: 2 | 3;
  title: string;
}) {
  return (
    <fieldset className="auth-form-section">
      <legend>{title}</legend>
      <div
        className={
          columns === 3 ? "auth-form-grid auth-form-grid-3" : "auth-form-grid"
        }
      >
        {children}
      </div>
    </fieldset>
  );
}