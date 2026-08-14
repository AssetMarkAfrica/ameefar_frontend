"use client";

import Link from "next/link";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import Image from "next/image";
import { useEffect, useState } from "react";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function PrivacyPolicy() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col`}>
      {/* ── NAV ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-slate-200 bg-white shadow-sm" : "border-b border-transparent bg-slate-50"
          }`}
      >
        <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-3.5 shrink-0 group">
            <div className="relative">
              <Image
                alt="Ameefar logo"
                className="relative rounded-xl object-cover ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105"
                height={44}
                width={44}
                src="/ameefarLogo.png"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`${hanken.className} text-[18px] font-bold tracking-tight text-[#002627]`}>
                Ameefar
              </span>
              <span className={`${jetbrains.className} text-[9px] font-medium tracking-[0.16em] uppercase mt-0.5 text-[#006d40]`}>
                Energy Africa
              </span>
            </div>
          </Link>
          <Link
            href="/product"
            className={`${hanken.className} rounded-xl px-6 py-2.5 text-[13px] font-bold transition-all duration-300 bg-[#beebeb] text-[#002627] hover:bg-white shadow-[0_0_24px_rgba(190,235,235,0.35)]`}
          >
            Visit Marketplace
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-24 px-6 md:px-12">
        <div className="mx-auto max-w-3xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
          <div className="mb-10 border-b border-slate-100 pb-8 text-center">
            <span className={`${jetbrains.className} inline-block rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-[11px] tracking-[0.18em] text-[#006d40] uppercase font-medium mb-4`}>
              Legal Document
            </span>
            <h1 className={`${hanken.className} text-[36px] font-bold text-[#002627] md:text-[48px] leading-tight mb-4`}>
              Privacy Policy
            </h1>
            <p className="text-[14px] font-medium text-slate-500 uppercase tracking-widest">
              Effective Date: August 7, 2026
            </p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#002627] prose-a:text-[#00bfa5] prose-a:no-underline hover:prose-a:underline">
            <p className="text-[15px] leading-relaxed text-slate-600 mb-6">
              Ameefar Energy Africa ("Ameefar," "we," "us," or "our") respects your privacy and is committed to protecting the personal and corporate data you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our B2B marketplace platform (the "Platform") or use our services.
            </p>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              Please read this Privacy Policy carefully. By accessing or using the Platform, you acknowledge that you have read, understood, and agree to our collection, storage, use, and disclosure of your personal and business information as described in this Privacy Policy.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>1. Information We Collect</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              To operate a secure B2B marketplace and enforce our Trust Protocol, we collect the following types of information:
            </p>

            <h3 className={`${hanken.className} text-xl mt-6 mb-3`}>1.1 Personal and Business Information Provided by You</h3>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-4">
              <li><strong>Account Data:</strong> Name, email address, phone number, job title, and password when you register.</li>
              <li><strong>Business/KYC Verification Data:</strong> Company name, registration documents, tax/VAT numbers, facility locations, and details of directors/beneficial owners required for our rigorous background checks and facility audits.</li>
              <li><strong>Transaction Data:</strong> Information related to your buy requests, sell offers, negotiations, and contracts.</li>
              <li><strong>Financial Data:</strong> Bank account details, wallet addresses, or other financial information required to facilitate our payment processing via Paystack.</li>
            </ul>

            <h3 className={`${hanken.className} text-xl mt-6 mb-3`}>1.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li><strong>Usage Data:</strong> Information about how you interact with the Platform, including log data, IP addresses, browser types, timestamps, and the pages you visit.</li>
              <li><strong>Device Data:</strong> Information about the device you use to access our Platform, including hardware models, operating systems, and unique device identifiers.</li>
              <li><strong>Cookies & Tracking:</strong> We use cookies and similar tracking technologies to enhance user experience, analyze traffic, and personalize content.</li>
            </ul>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>2. How We Use Your Information</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li><strong>Platform Operations:</strong> To provide, maintain, and improve the Platform, including account creation, authentication, and matchmaking between buyers and sellers.</li>
              <li><strong>Trust & Verification:</strong> To perform mandatory KYC (Know Your Customer) and KYB (Know Your Business) checks, verify facility audits, and prevent fraud.</li>
              <li><strong>Transaction Fulfillment:</strong> To facilitate the African Trade Protection Protocol, process payments securely, and coordinate independent pre-shipment inspections.</li>
              <li><strong>Communication:</strong> To send administrative information, transaction updates, alerts (e.g., Daily Listing Digests), and respond to customer service inquiries.</li>
              <li><strong>Analytics & Improvements:</strong> To monitor and analyze trends, usage, and activities to improve our services and user interface.</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable legal obligations, resolve disputes, and enforce our Terms of Service.</li>
            </ul>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>3. How We Share Your Information</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              We do not sell your personal or business data to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li><strong>With Other Users:</strong> To facilitate a trade, we share necessary business profile information between a buyer and a seller once a negotiation or contract is initiated.</li>
              <li><strong>Service Providers:</strong> We share information with trusted third-party vendors who assist us in operating our Platform, such as KYC verification agencies, independent inspection firms, payment processors (e.g., Paystack), and cloud hosting providers (e.g., AWS).</li>
              <li><strong>Legal and Regulatory Authorities:</strong> We may disclose your information if required to do so by law, in response to a subpoena or court order, or to cooperate with law enforcement and regulatory agencies.</li>
              <li><strong>Business Transfers:</strong> If Ameefar is involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction.</li>
            </ul>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>4. Data Security</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              The security of your data is critical to our African Trade Protection Protocol. We implement robust, industry-standard technical and organizational measures to protect your personal and financial information against unauthorized access, destruction, loss, alteration, or misuse.
            </p>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>5. Data Retention</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              We retain your personal and business information for as long as your account is active or as needed to provide you with our services. If you close your account, we will retain your data only as long as necessary to comply with our legal and regulatory obligations, resolve disputes, and enforce our agreements.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>6. Your Data Rights</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              Depending on your jurisdiction (e.g., GDPR, CCPA, or applicable African data protection laws), you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-4">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data, subject to legal and regulatory retention requirements.</li>
              <li><strong>Objection/Restriction:</strong> Object to or request the restriction of processing your data in certain circumstances.</li>
            </ul>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              To exercise any of these rights, please contact us using the details below. We will respond to your request within a reasonable timeframe.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>7. International Data Transfers</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              As a global marketplace connecting buyers with African suppliers, your information may be transferred to, stored, and processed in countries other than your own. We ensure that appropriate safeguards (such as Standard Contractual Clauses) are in place to protect your data during these transfers in compliance with applicable data protection laws.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>8. Changes to This Privacy Policy</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page and updating the "Effective Date."
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>9. Contact Us</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              If you have questions, concerns, or requests related to this Privacy Policy or our data practices, please contact our Data Protection Officer at:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li><strong>Email:</strong> pascal@ameefarenergy.com</li>
              <li><strong>Address:</strong> No. 9 Ecuador Street, Agbogba Assemblies. GE.164.1559 Accra Ghana</li>
            </ul>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
