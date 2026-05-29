"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { selectAccessToken } from "@/store/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectProfile,
  selectProfileError,
  selectProfileOpStatus,
} from "@/store/profile/profileSelectors";
import {
  saveStep1DraftThunk,
  saveStep1Thunk,
} from "@/store/profile/profileThunks";
import type { CompanySize, Step1SavePayload, VatRegion } from "@/types";

import { companySizes, vatRegions } from "./profile-options";
import { ProfileShell } from "./ProfileShell";
import { ProfileStepper } from "./ProfileStepper";

const emptyStep1: Step1SavePayload = {
  vat_region: "uk",
  company_registration_no: "",
  vat_registration_no: "",
  company_size: "1_10",
  company_website: "",
  company_description: "",
  year_established: new Date().getFullYear(),
  street_address: "",
  address_line_2: "",
  postcode: "",
  city: "",
  state_region: "",
  country: "",
};

export function CompanyVerificationStep() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectAccessToken);
  const profile = useAppSelector(selectProfile);
  const saveStatus = useAppSelector((state) =>
    selectProfileOpStatus(state, "saveStep1"),
  );
  const draftStatus = useAppSelector((state) =>
    selectProfileOpStatus(state, "saveStep1Draft"),
  );
  const error = useAppSelector((state) => selectProfileError(state, "saveStep1"));
  const draftError = useAppSelector((state) =>
    selectProfileError(state, "saveStep1Draft"),
  );
  const [form, setForm] = useState<Step1SavePayload>(emptyStep1);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const readOnly = profile?.status === "pending" || profile?.status === "verified";

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      vat_region: profile.vat_region || "uk",
      company_registration_no: profile.company_registration_no,
      vat_registration_no: profile.vat_registration_no,
      company_size: profile.company_size || "1_10",
      company_website: profile.company_website,
      company_description: profile.company_description,
      year_established: profile.year_established ?? new Date().getFullYear(),
      street_address: profile.street_address,
      address_line_2: profile.address_line_2,
      postcode: profile.postcode,
      city: profile.city,
      state_region: profile.state_region,
      country: profile.country,
    });
  }, [profile]);

  function updateField<TKey extends keyof Step1SavePayload>(
    key: TKey,
    value: Step1SavePayload[TKey],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveDraft() {
    if (!token || readOnly) {
      return;
    }

    setLocalMessage(null);
    try {
      await dispatch(saveStep1DraftThunk({ token, ...form })).unwrap();
      setLocalMessage("Your company information draft has been saved.");
    } catch {
      setLocalMessage(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || readOnly) {
      return;
    }

    try {
      await dispatch(saveStep1Thunk({ token, ...form })).unwrap();
      router.push("/profile/sites");
    } catch {
      setLocalMessage(null);
    }
  }

  return (
    <ProfileShell>
      <main className="profile-main profile-step-page">
        <ProfileStepper activeStep={1} profile={profile} />
        <form className="profile-step-layout" onSubmit={handleSubmit}>
          <div className="profile-form-stack">
            <FormSection title="Company Details">
              <label className="profile-field">
                <span>VAT Region</span>
                <select
                  disabled={readOnly}
                  onChange={(event) =>
                    updateField("vat_region", event.target.value as VatRegion)
                  }
                  value={form.vat_region}
                >
                  {vatRegions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="profile-field">
                <span>Registration Number</span>
                <input
                  disabled={readOnly}
                  onChange={(event) =>
                    updateField("company_registration_no", event.target.value)
                  }
                  placeholder="e.g. 12345678"
                  required
                  value={form.company_registration_no}
                />
              </label>
              <label className="profile-field">
                <span>VAT Registration Number</span>
                <input
                  disabled={readOnly}
                  onChange={(event) =>
                    updateField("vat_registration_no", event.target.value)
                  }
                  placeholder="GB123456789"
                  required
                  value={form.vat_registration_no}
                />
              </label>
              <label className="profile-field">
                <span>Year Established</span>
                <input
                  disabled={readOnly}
                  min={1800}
                  onChange={(event) =>
                    updateField("year_established", Number(event.target.value))
                  }
                  required
                  type="number"
                  value={form.year_established}
                />
              </label>
              <div className="profile-field profile-span-2">
                <span>Company Size</span>
                <div className="profile-choice-grid">
                  {companySizes.map((size) => (
                    <label key={size.value}>
                      <input
                        checked={form.company_size === size.value}
                        disabled={readOnly}
                        name="company_size"
                        onChange={() =>
                          updateField("company_size", size.value as CompanySize)
                        }
                        type="radio"
                      />
                      <span>{size.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </FormSection>

            <FormSection title="Business Identity">
              <label className="profile-field profile-span-2">
                <span>Company Website</span>
                <input
                  disabled={readOnly}
                  onChange={(event) =>
                    updateField("company_website", normalizeWebsite(event.target.value))
                  }
                  placeholder="https://www.yourcompany.com"
                  required
                  type="url"
                  value={form.company_website}
                />
              </label>
              <label className="profile-field profile-span-2">
                <span>Business Description</span>
                <textarea
                  disabled={readOnly}
                  onChange={(event) =>
                    updateField("company_description", event.target.value)
                  }
                  placeholder="Briefly describe your recycling, manufacturing, or material trading operations."
                  required
                  rows={5}
                  value={form.company_description}
                />
              </label>
            </FormSection>

            <FormSection title="Registered Address">
              <label className="profile-field profile-span-2">
                <span>Street Address</span>
                <input
                  disabled={readOnly}
                  onChange={(event) => updateField("street_address", event.target.value)}
                  required
                  value={form.street_address}
                />
              </label>
              <label className="profile-field profile-span-2">
                <span>Address Line 2</span>
                <input
                  disabled={readOnly}
                  onChange={(event) => updateField("address_line_2", event.target.value)}
                  value={form.address_line_2}
                />
              </label>
              <label className="profile-field">
                <span>Postcode</span>
                <input
                  disabled={readOnly}
                  onChange={(event) => updateField("postcode", event.target.value)}
                  required
                  value={form.postcode}
                />
              </label>
              <label className="profile-field">
                <span>City</span>
                <input
                  disabled={readOnly}
                  onChange={(event) => updateField("city", event.target.value)}
                  required
                  value={form.city}
                />
              </label>
              <label className="profile-field">
                <span>State / Region</span>
                <input
                  disabled={readOnly}
                  onChange={(event) => updateField("state_region", event.target.value)}
                  required
                  value={form.state_region}
                />
              </label>
              <label className="profile-field">
                <span>Country</span>
                <input
                  disabled={readOnly}
                  onChange={(event) => updateField("country", event.target.value)}
                  required
                  value={form.country}
                />
              </label>
            </FormSection>
          </div>

          <aside className="profile-help-panel">
            <h2>Why this matters</h2>
            <p>
              Corporate verification ensures legitimate enterprise actors can
              participate in high-value recycling and materials trades.
            </p>
            <ul>
              <li>Supports anti-money laundering checks.</li>
              <li>Unlocks marketplace trade limits.</li>
              <li>Improves trust with verified counterparties.</li>
            </ul>
            {readOnly ? (
              <p className="profile-lock-note">Editing is locked while this profile is {profile?.status}.</p>
            ) : null}
          </aside>

          <div className="profile-sticky-actions">
            <Link href="/profile">Cancel</Link>
            <button
              disabled={draftStatus === "loading" || readOnly}
              onClick={saveDraft}
              type="button"
            >
              {draftStatus === "loading" ? "Saving..." : "Save Draft"}
            </button>
            <button disabled={saveStatus === "loading" || readOnly} type="submit">
              {saveStatus === "loading" ? "Saving..." : "Continue"}
            </button>
          </div>

          {localMessage ? <p className="profile-success">{localMessage}</p> : null}
          {error || draftError ? (
            <p className="profile-error">{error ?? draftError}</p>
          ) : null}
        </form>
      </main>
    </ProfileShell>
  );
}

function FormSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="profile-form-section">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function normalizeWebsite(value: string) {
  if (!value || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}
