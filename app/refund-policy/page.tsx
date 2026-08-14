"use client";

import Link from "next/link";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import Image from "next/image";
import { useEffect, useState } from "react";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function RefundPolicy() {
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
              Refund & Return Policy
            </h1>
            <p className="text-[14px] font-medium text-slate-500 uppercase tracking-widest">
              Effective Date: August 7, 2026
            </p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#002627] prose-a:text-[#00bfa5] prose-a:no-underline hover:prose-a:underline">
            <p className="text-[15px] leading-relaxed text-slate-600 mb-6">
              Ameefar Energy Africa ("we", "us", or "our") is dedicated to facilitating secure, transparent B2B trades across Africa and globally. Because of the nature of international commodity trading and the scale of secondary raw material transactions, our Refund and Return Policy is governed primarily by our African Trade Protection Protocol (the "Protocol") and the specific smart contracts executed between verified Buyers and Sellers.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>1. Payment Processing & The African Trade Protection Protocol</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              All transactions conducted on the Ameefar marketplace are processed securely via Paystack. Under this Protocol:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li><strong>Fund Security:</strong> The Buyer's payment is processed securely upon the signing of the digital contract.</li>
              <li><strong>Pre-Shipment Inspection:</strong> Payment settlements are authorized after an independent, third-party pre-shipment inspection confirms that the quality, quantity, and grade of the materials match the agreed-upon contract specifications.</li>
              <li><strong>Approval:</strong> Once the inspection report is approved and the bill of lading is verified, the payment is settled to the Seller.</li>
            </ul>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>2. Conditions for a Refund</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              Refunds to the Buyer are generally issued only <strong>before</strong> the payment has been fully settled to the Seller. A full or partial refund will be processed under the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li><strong>Inspection Failure:</strong> If the independent pre-shipment inspection reveals that the materials do not meet the agreed contract specifications (e.g., incorrect grade of rPET, severe contamination, or incorrect quantity), and the Seller is unable to rectify the issue within the agreed grace period.</li>
              <li><strong>Seller Default:</strong> If the Seller fails to deliver the goods to the port of loading or fails to provide the necessary shipping documentation within the contracted timeline.</li>
              <li><strong>Mutual Cancellation:</strong> If both the Buyer and Seller mutually agree in writing via the Ameefar platform to cancel the trade before shipment.</li>
            </ul>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>3. Non-Refundable Situations</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              Due to the B2B nature of bulk commodity trading, refunds are <strong>not</strong> issued in the following scenarios:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li><strong>Post-Release:</strong> Once the independent inspection has been approved by the Buyer, the shipping documents verified, and the payment has been legally settled to the Seller. At this stage, the trade is considered final.</li>
              <li><strong>Buyer Default:</strong> If the Buyer attempts to cancel the contract without cause after the Seller has already incurred significant logistics or production costs, subject to the specific penalty clauses in the executed contract.</li>
              <li><strong>Force Majeure:</strong> Delays or issues caused by acts of God, war, port strikes, or other unforeseeable global events (Force Majeure) are handled according to the specific Force Majeure clauses in the contract, which typically allow for extensions rather than immediate refunds.</li>
            </ul>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>4. Returns Policy</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              Because Ameefar deals in bulk secondary raw materials (such as tons of PET Flakes or HMS scrap) shipped internationally via sea freight, <strong>physical returns are generally not accepted</strong> once the goods have left the port of loading. All quality disputes must be identified and resolved during the independent pre-shipment inspection phase before the goods are loaded and payments are settled.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>5. Dispute Resolution</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              If a dispute arises during the inspection phase or regarding the settlement of payments, the payment settlement will be paused. Our dedicated Dispute Resolution Team will mediate the issue using the inspection reports and the digital contract as the binding authority. If mediation fails, the dispute will escalate to binding arbitration as outlined in our Terms of Service.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>6. Processing Time for Refunds</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              Approved refunds will be processed via Paystack back to the Buyer's original method of payment. Depending on the financial institutions involved and the banking system, refunds typically take between 5 to 14 business days to reflect in the Buyer's account.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>7. Contact Us</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              If you have any questions or concerns regarding our Refund and Return Policy, or if you need to report an issue with an ongoing trade, please contact our support team immediately:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li><strong>Email:</strong> pascal@ameefarenergy.com</li>
              <li><strong>Dispute Hotline:</strong> (+233) 30 252 8832</li>
              <li><strong>Address:</strong> No. 9 Ecuador Street, Agbogba Assemblies. GE.164.1559 Accra Ghana</li>
            </ul>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
