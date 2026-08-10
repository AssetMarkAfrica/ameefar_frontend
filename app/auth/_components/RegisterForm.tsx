"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

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

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

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
    <svg aria-hidden="true" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="24" className="text-[#00bfa5]">
      <path d="M12 2 L20 5.5 V12 C20 16.4 16.4 20.4 12 22 C7.6 20.4 4 16.4 4 12 V5.5 Z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function IconSecure() {
  return (
    <svg aria-hidden="true" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="24" className="text-[#00bfa5]">
      <rect height="11" rx="2" ry="2" width="14" x="5" y="11" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="16" fill="currentColor" r="1" stroke="none" />
    </svg>
  );
}

function IconRealtime() {
  return (
    <svg aria-hidden="true" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="24" className="text-[#00bfa5]">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ArrowForwardIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
      <line x1="5" x2="19" y1="12" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

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
    <div className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 flex flex-col`}>
      <AuthHeader />
      
      <main className="flex-1 w-full pt-20 pb-12">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start relative">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-20 left-0 h-[600px] w-[600px] rounded-full bg-[#00bfa5]/5 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#006d40]/10 blur-[120px] pointer-events-none" />

            {/* ── LEFT: Intro & Benefits ── */}
            <div className="lg:col-span-5 lg:sticky lg:top-32 relative z-10 pt-8 lg:pr-8">
              <span className={`${jetbrains.className} inline-flex items-center gap-2 rounded-full border border-[#00bfa5]/20 bg-[#00bfa5]/10 px-3.5 py-1.5 text-[11px] text-[#006d40] font-semibold tracking-widest uppercase mb-6`}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5] animate-pulse" />
                Recycling Marketplace
              </span>
              
              <h1 className={`${hanken.className} text-[38px] lg:text-[48px] font-extrabold leading-[1.15] tracking-tight mb-6 text-slate-900`}>
                Empower Your <br className="hidden lg:block"/>
                <span className="bg-gradient-to-r from-[#00bfa5] to-[#006d40] bg-clip-text text-transparent">Energy Future</span>
              </h1>
              
              <p className="text-[16px] leading-relaxed text-slate-600 mb-10 max-w-md">
                Join the enterprise network reshaping the industrial recycling supply chain with precision and transparency.
              </p>

              <div className="space-y-8 mb-12">
                <AuthBenefit icon={<IconVerified />} title="Verified Enterprise Network" text="Only vetted high-stakes buyers and sellers participate." />
                <AuthBenefit icon={<IconSecure />} title="Secure Escrow Trades" text="Financial protection built into every transaction flow." />
                <AuthBenefit icon={<IconRealtime />} title="Real-time Analytics" text="Live market data to inform your procurement strategy." />
              </div>

              <blockquote className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#00bfa5]/10 to-transparent opacity-50 rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full border-2 border-[#00bfa5]/30 overflow-hidden shrink-0">
                    <Image
                      alt="Abdulai Pascal Mohammed"
                      height={48}
                      src="https://res.cloudinary.com/dqwub0fhb/image/upload/v1782219057/pascal_nsd1sq.jpg"
                      width={48}
                      className="object-cover h-full w-full"
                    />
                  </div>
                  <div>
                    <a href="https://www.linkedin.com/in/abdulai-pascal-mohammed-222059345/" target="_blank" rel="noreferrer" className={`${hanken.className} block text-[15px] font-bold text-slate-900 hover:text-[#00bfa5] transition-colors`}>
                      Abdulai Pascal Mohammed
                    </a>
                    <span className={`${jetbrains.className} block mt-0.5 text-[9px] uppercase tracking-widest text-[#00bfa5] font-semibold`}>CEO · Sustainability</span>
                  </div>
                </div>
                <p className="text-[14px] leading-relaxed text-slate-600 italic relative z-10">
                  "We are building more than a marketplace; we are creating the infrastructure for a sustainable industrial future."
                </p>
              </blockquote>
            </div>

            {/* ── RIGHT: Registration Form ── */}
            <div className="lg:col-span-7 relative z-10">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                
                <div className="mb-10 text-center md:text-left border-b border-slate-100 pb-6">
                  <h2 className={`${hanken.className} text-[28px] font-bold text-slate-900 mb-2`}>Create Your Account</h2>
                  <p className="text-[14.5px] text-slate-500">
                    Complete the fields below to start trading on the professional exchange.
                  </p>
                </div>

                <form className="space-y-12" onSubmit={handleSubmit}>
                  
                  {/* Account Credentials */}
                  <FormSection title="1. Account Credentials" subtitle="Your login information">
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Email Address</label>
                      <input
                        autoComplete="email"
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="corporate@company.com"
                        required
                        type="email"
                        value={form.email}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                      />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Password</label>
                      <div className="relative">
                        <input
                          autoComplete="new-password"
                          onChange={(e) => updateField("password", e.target.value)}
                          placeholder="********"
                          required
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>
                    <div className="col-span-1 space-y-2">
                      <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Confirm Password</label>
                      <div className="relative">
                        <input
                          autoComplete="new-password"
                          onChange={(e) => updateField("password_confirm", e.target.value)}
                          placeholder="********"
                          required
                          type={showPasswordConfirm ? "text" : "password"}
                          value={form.password_confirm}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-12 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          aria-label={showPasswordConfirm ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showPasswordConfirm ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>
                  </FormSection>

                  {/* Professional Identity */}
                  <FormSection title="2. Professional Identity" subtitle="Who you are">
                    <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                      <div className="col-span-1 space-y-2">
                        <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Prefix</label>
                        <select
                          onChange={(e) => updateField("prefix", e.target.value as Prefix)}
                          value={form.prefix}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3.5 text-[14px] text-slate-900 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50 appearance-none"
                        >
                          {prefixes.map((prefix) => (
                            <option key={prefix} value={prefix}>{prefix}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 md:col-span-1 space-y-2">
                        <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>First Name</label>
                        <input
                          autoComplete="given-name"
                          onChange={(e) => updateField("first_name", e.target.value)}
                          placeholder="John"
                          required
                          type="text"
                          value={form.first_name}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                        />
                      </div>
                      <div className="col-span-3 md:col-span-1 space-y-2">
                        <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Last Name</label>
                        <input
                          autoComplete="family-name"
                          onChange={(e) => updateField("last_name", e.target.value)}
                          placeholder="Doe"
                          required
                          type="text"
                          value={form.last_name}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                        />
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 grid md:grid-cols-2 gap-4">
                      <div className="col-span-1 space-y-2">
                        <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Job Title</label>
                        <input
                          autoComplete="organization-title"
                          onChange={(e) => updateField("job_title", e.target.value)}
                          placeholder="Head of Procurement"
                          required
                          type="text"
                          value={form.job_title}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                        />
                      </div>
                      <div className="col-span-1 space-y-2">
                        <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Mobile Number</label>
                        <input
                          autoComplete="tel"
                          onChange={(e) => updateField("mobile", e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          required
                          type="tel"
                          value={form.mobile}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                        />
                      </div>
                    </div>
                  </FormSection>

                  {/* Company Profile */}
                  <FormSection title="3. Company Profile" subtitle="Your organization details">
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Company Name</label>
                      <input
                        autoComplete="organization"
                        onChange={(e) => updateField("company_name", e.target.value)}
                        placeholder="Enter full legal entity name"
                        required
                        type="text"
                        value={form.company_name}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                      />
                    </div>

                    <div className="col-span-1 space-y-2">
                      <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Company Type</label>
                      <select
                        onChange={(e) => updateField("company_type", e.target.value as CompanyType)}
                        value={form.company_type}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50 appearance-none"
                      >
                        {companyTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-1 space-y-2">
                      <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Trading Role</label>
                      <select
                        onChange={(e) => updateField("role", e.target.value as UserRole)}
                        value={form.role}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50 appearance-none"
                      >
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                    </div>

                    {form.company_type === "other" && (
                      <div className="col-span-1 md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Other Company Type</label>
                        <input
                          onChange={(e) => updateField("company_type_other", e.target.value)}
                          placeholder="Specify company type"
                          required
                          type="text"
                          value={form.company_type_other}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                        />
                      </div>
                    )}

                    <div className="col-span-1 md:col-span-2 space-y-3 pt-4 border-t border-slate-100">
                      <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>Materials of Interest</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {materials.map((material) => (
                          <label key={material.value} className="relative flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition has-[:checked]:border-[#00bfa5]/50 has-[:checked]:bg-[#00bfa5]/5">
                            <input
                              checked={form.materials_of_interest.includes(material.value)}
                              onChange={() => toggleMaterial(material.value)}
                              type="checkbox"
                              className="mt-0.5 shrink-0 rounded border-slate-300 bg-white text-[#00bfa5] focus:ring-[#00bfa5]/50 focus:ring-offset-0"
                            />
                            <span className="text-[13px] leading-tight text-slate-700 select-none">{material.label}</span>
                          </label>
                        ))}
                      </div>
                      
                      {hasOtherMaterial && (
                        <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <input
                            onChange={(e) => updateField("material_other", e.target.value)}
                            placeholder="Specify other materials"
                            required
                            type="text"
                            value={form.material_other}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                          />
                        </div>
                      )}
                    </div>
                  </FormSection>

                  {/* Submission */}
                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="max-w-xs space-y-2">
                      <label className={`${jetbrains.className} text-[10.5px] font-medium tracking-widest text-slate-500 uppercase`}>How did you hear about us?</label>
                      <select
                        onChange={(e) => updateField("referral_source", e.target.value as ReferralSource)}
                        value={form.referral_source}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50 appearance-none"
                      >
                        {referralSources.map((source) => (
                          <option key={source.value} value={source.value}>{source.label}</option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        checked={form.terms_accepted}
                        onChange={(e) => updateField("terms_accepted", e.target.checked)}
                        required
                        type="checkbox"
                        className="mt-1 shrink-0 rounded border-slate-300 bg-white text-[#00bfa5] focus:ring-[#00bfa5]/50 focus:ring-offset-0"
                      />
                      <span className="text-[13px] leading-relaxed text-slate-600 group-hover:text-slate-800 transition-colors">
                        I agree to the Ameefar Energy{" "}
                        <Link href="/terms-of-service" className="text-[#00bfa5] hover:underline underline-offset-2">Terms of Service</Link> and{" "}
                        <Link href="/privacy-policy" className="text-[#00bfa5] hover:underline underline-offset-2">Privacy Policy</Link>. I understand that my
                        company profile will be subject to identity verification.
                      </span>
                    </label>

                    {(localError || error) && (
                      <div className="rounded-xl border border-red-500/20 bg-red-50 p-4 flex items-center gap-3 text-red-600">
                        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-[13.5px] font-medium">{localError || error}</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
                      <button
                        className={`${hanken.className} w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00bfa5] to-[#006d40] px-8 py-4 text-[15px] font-bold text-white shadow-[0_4px_14px_rgba(0,191,165,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,191,165,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
                        disabled={isLoading}
                        type="submit"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            Complete Registration
                            <ArrowForwardIcon />
                          </>
                        )}
                      </button>

                      <p className="text-[14px] text-slate-500">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-semibold text-slate-900 hover:text-[#00bfa5] transition-colors">
                          Log in
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <AuthFooter />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AuthBenefit({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm transition-all duration-300 group-hover:border-[#00bfa5]/40 group-hover:bg-[#00bfa5]/5">
        {icon}
      </div>
      <div>
        <h3 className={`${hanken.className} text-[17px] font-bold text-slate-900 mb-1`}>{title}</h3>
        <p className="text-[13.5px] leading-relaxed text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function FormSection({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <fieldset className="p-0 m-0 border-none">
      <div className="mb-5">
        <legend className={`${hanken.className} text-[18px] font-bold text-slate-900`}>{title}</legend>
        <p className="text-[13px] text-slate-500 mt-1">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
        {children}
      </div>
    </fieldset>
  );
}