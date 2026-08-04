"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { selectAccessToken } from "@/store/auth/authSelectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectProfile,
  selectProfileError,
  selectProfileOpStatus,
  selectSites,
} from "@/store/profile/profileSelectors";
import {
  addSiteThunk,
  completeStep2Thunk,
} from "@/store/profile/profileThunks";
import type { AddSitePayload, Material, SiteType } from "@/types";

import { materialOptions, siteTypes } from "./profile-options";
import { ProfileShell } from "./ProfileShell";
import { ProfileStepper } from "./ProfileStepper";

const emptySite: AddSitePayload = {
  site_name: "",
  site_type: "recycling",
  is_primary: true,
  street_address: "",
  address_line_2: "",
  postcode: "",
  city: "",
  state_region: "",
  country: "",
  latitude: "",
  longitude: "",
  contact_person: "",
  contact_email: "",
  contact_phone: "",
  operating_hours: "",
  materials_handled: [],
  monthly_capacity: "",
  has_export_capability: false,
};

export function OperationalSitesStep() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector(selectAccessToken);
  const profile = useAppSelector(selectProfile);
  const sites = useAppSelector(selectSites);
  const addStatus = useAppSelector((state) =>
    selectProfileOpStatus(state, "addSite"),
  );
  const completeStatus = useAppSelector((state) =>
    selectProfileOpStatus(state, "completeStep2"),
  );
  const addError = useAppSelector((state) => selectProfileError(state, "addSite"));
  const completeError = useAppSelector((state) =>
    selectProfileError(state, "completeStep2"),
  );
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<AddSitePayload>(emptySite);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const readOnly = profile?.status === "pending" || profile?.status === "verified";

  function updateField<TKey extends keyof AddSitePayload>(
    key: TKey,
    value: AddSitePayload[TKey],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleMaterial(material: Material) {
    setForm((current) => {
      const exists = current.materials_handled.includes(material);
      return {
        ...current,
        materials_handled: exists
          ? current.materials_handled.filter((item) => item !== material)
          : [...current.materials_handled, material],
      };
    });
  }

  async function doReverseGeocode(latitude: number | string, longitude: number | string) {
    updateField("latitude", latitude.toString());
    updateField("longitude", longitude.toString());

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      if (!response.ok) throw new Error("Reverse geocoding failed");
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.pedestrian || addr.street || "";
        const house = addr.house_number || "";
        const streetAddress = `${house} ${street}`.trim();
        const city = addr.city || addr.town || addr.village || addr.county || "";
        const state = addr.state || addr.region || "";
        const postcode = addr.postcode || "";
        const country = addr.country || "";

        setForm(current => ({
          ...current,
          street_address: streetAddress || current.street_address,
          city: city || current.city,
          state_region: state || current.state_region,
          postcode: postcode || current.postcode,
          country: country || current.country,
        }));
      }
    } catch (err) {
      console.error("Geocoding error", err);
    } finally {
      setIsLocating(false);
    }
  }

  function handleLocateMe() {
    setIsLocating(true);
    setLocalError(null);

    const fallbackToIp = async () => {
      try {
        const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
        if (!res.ok) throw new Error("IP Geolocation failed");
        const data = await res.json();
        
        if (data.latitude && data.longitude) {
           await doReverseGeocode(data.latitude, data.longitude);
        } else {
           throw new Error("No coordinates from IP");
        }
      } catch (err) {
        console.error("IP fallback error", err);
        setLocalError("Location access denied. Please enable location permissions in your browser or enter details manually.");
        setIsLocating(false);
      }
    };

    if (!navigator.geolocation) {
      fallbackToIp();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        doReverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Geolocation error", error);
        fallbackToIp();
      }
    );
  }

  async function handleAddSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    if (!token || readOnly) {
      return;
    }

    if (form.materials_handled.length === 0) {
      setLocalError("Select at least one material handled at this site.");
      return;
    }

    try {
      const payload: any = { ...form };
      if (!payload.latitude) delete payload.latitude;
      if (!payload.longitude) delete payload.longitude;
      
      await dispatch(addSiteThunk({ token, ...payload })).unwrap();
      setForm({ ...emptySite, is_primary: sites.length === 0 });
      setDrawerOpen(false);
    } catch {
      setLocalError(null);
    }
  }

  async function completeStep() {
    if (!token || readOnly || sites.length === 0) {
      return;
    }

    try {
      await dispatch(completeStep2Thunk({ token })).unwrap();
      router.push("/profile/documents");
    } catch {
      setLocalError(null);
    }
  }

  return (
    <ProfileShell>
      <main className="profile-main profile-step-page">
        <ProfileStepper activeStep={2} profile={profile} />

        <section className="profile-sites-header">
          <div>
            <p className="profile-eyebrow">Step 2</p>
            <h1>Operational Sites</h1>
            <p>
              Sites represent where materials are collected, processed, stored,
              or recycled. Add at least one site, then explicitly complete setup.
            </p>
          </div>
          <button
            className="profile-primary-button"
            disabled={readOnly}
            onClick={() => setDrawerOpen(true)}
            type="button"
          >
            Add Site
          </button>
        </section>

        {sites.length === 0 ? (
          <section className="profile-empty-state">
            <div aria-hidden="true">SITE_INDEX_V01</div>
            <h2>Add your first operational site</h2>
            <p>
              You must add at least one site before Step 2 can be marked complete.
            </p>
            <button disabled={readOnly} onClick={() => setDrawerOpen(true)} type="button">
              Add Site
            </button>
          </section>
        ) : (
          <section className="profile-site-grid">
            {sites.map((site) => (
              <article className="profile-site-card" key={site.id}>
                <div>
                  <span>{site.is_primary ? "Primary" : site.site_type}</span>
                  <h2>{site.site_name}</h2>
                  <p>
                    {site.city}, {site.country}
                  </p>
                </div>
                <dl>
                  <div>
                    <dt>Materials</dt>
                    <dd>{site.materials_handled.join(", ") || "Not listed"}</dd>
                  </div>
                  <div>
                    <dt>Capacity</dt>
                    <dd>{site.monthly_capacity || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt>Export</dt>
                    <dd>{site.has_export_capability ? "Yes" : "No"}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </section>
        )}

        <div className="profile-sticky-actions">
          <Link href="/profile/company">Back</Link>
          <button
            disabled={completeStatus === "loading" || sites.length === 0 || readOnly}
            onClick={completeStep}
            type="button"
          >
            {completeStatus === "loading" ? "Completing..." : "Complete Site Setup"}
          </button>
        </div>

        {localError || addError || completeError ? (
          <p className="profile-error">{localError ?? addError ?? completeError}</p>
        ) : null}

        {isDrawerOpen ? (
          <div className="profile-drawer-overlay" role="presentation">
            <form className="profile-site-drawer" onSubmit={handleAddSite}>
              <div className="profile-drawer-header">
                <div>
                  <h2>Add New Site</h2>
                  <p>Enter site operational details.</p>
                </div>
                <button onClick={() => setDrawerOpen(false)} type="button">
                  Close
                </button>
              </div>
              <div className="profile-drawer-body">
                <label className="profile-field">
                  <span>Site Name</span>
                  <input
                    onChange={(event) => updateField("site_name", event.target.value)}
                    placeholder="Northern Hub Facility"
                    required
                    value={form.site_name}
                  />
                </label>
                <label className="profile-field">
                  <span>Site Type</span>
                  <select
                    onChange={(event) =>
                      updateField("site_type", event.target.value as SiteType)
                    }
                    value={form.site_type}
                  >
                    {siteTypes.map((siteType) => (
                      <option key={siteType.value} value={siteType.value}>
                        {siteType.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="profile-toggle-row">
                  <input
                    checked={form.is_primary}
                    onChange={(event) => updateField("is_primary", event.target.checked)}
                    type="checkbox"
                  />
                  <span>Set as primary site</span>
                </label>
                <label className="profile-field">
                  <span>Street Address</span>
                  <input
                    onChange={(event) =>
                      updateField("street_address", event.target.value)
                    }
                    required
                    value={form.street_address}
                  />
                </label>
                <div className="profile-two-col">
                  <label className="profile-field">
                    <span>City</span>
                    <input
                      onChange={(event) => updateField("city", event.target.value)}
                      required
                      value={form.city}
                    />
                  </label>
                  <label className="profile-field">
                    <span>Postcode</span>
                    <input
                      onChange={(event) => updateField("postcode", event.target.value)}
                      required
                      value={form.postcode}
                    />
                  </label>
                </div>
                <div className="profile-two-col">
                  <label className="profile-field">
                    <span>State / Region</span>
                    <input
                      onChange={(event) =>
                        updateField("state_region", event.target.value)
                      }
                      required
                      value={form.state_region}
                    />
                  </label>
                  <label className="profile-field">
                    <span>Country</span>
                    <input
                      onChange={(event) => updateField("country", event.target.value)}
                      required
                      value={form.country}
                    />
                  </label>
                </div>
                <div className="profile-field" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                  <button
                    className="profile-primary-button"
                    type="button"
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    style={{ width: "fit-content", padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                  >
                    {isLocating ? "Locating..." : "Use Current Location"}
                  </button>
                  {form.latitude && form.longitude && (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-success, #10b981)" }}>
                      ✓ Location captured
                    </span>
                  )}
                </div>
                <label className="profile-field">
                  <span>Contact Person</span>
                  <input
                    onChange={(event) =>
                      updateField("contact_person", event.target.value)
                    }
                    required
                    value={form.contact_person}
                  />
                </label>
                <div className="profile-two-col">
                  <label className="profile-field">
                    <span>Contact Email</span>
                    <input
                      onChange={(event) =>
                        updateField("contact_email", event.target.value)
                      }
                      required
                      type="email"
                      value={form.contact_email}
                    />
                  </label>
                  <label className="profile-field">
                    <span>Contact Phone</span>
                    <input
                      onChange={(event) =>
                        updateField("contact_phone", event.target.value)
                      }
                      required
                      value={form.contact_phone}
                    />
                  </label>
                </div>
                <label className="profile-field">
                  <span>Operating Hours</span>
                  <input
                    onChange={(event) =>
                      updateField("operating_hours", event.target.value)
                    }
                    placeholder="Mon-Fri, 08:00-18:00"
                    required
                    value={form.operating_hours}
                  />
                </label>
                <label className="profile-field">
                  <span>Monthly Capacity</span>
                  <input
                    onChange={(event) =>
                      updateField("monthly_capacity", event.target.value)
                    }
                    placeholder="500 MT"
                    required
                    value={form.monthly_capacity}
                  />
                </label>
                <div className="profile-field">
                  <span>Materials Handled</span>
                  <div className="profile-chip-grid">
                    {materialOptions.map((material) => (
                      <label key={material.value}>
                        <input
                          checked={form.materials_handled.includes(material.value)}
                          onChange={() => toggleMaterial(material.value)}
                          type="checkbox"
                        />
                        <span>{material.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <label className="profile-toggle-row">
                  <input
                    checked={form.has_export_capability}
                    onChange={(event) =>
                      updateField("has_export_capability", event.target.checked)
                    }
                    type="checkbox"
                  />
                  <span>Has export capability</span>
                </label>
              </div>
              <div className="profile-drawer-footer">
                <button onClick={() => setDrawerOpen(false)} type="button">
                  Cancel
                </button>
                <button disabled={addStatus === "loading"} type="submit">
                  {addStatus === "loading" ? "Registering..." : "Register Site"}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </main>
    </ProfileShell>
  );
}
