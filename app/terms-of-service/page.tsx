"use client";

import Link from "next/link";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import Image from "next/image";
import { useEffect, useState } from "react";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-[14px] font-medium text-slate-500 uppercase tracking-widest">
              Effective Date: August 7, 2026
            </p>
          </div>

          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-[#002627] prose-a:text-[#00bfa5] prose-a:no-underline hover:prose-a:underline">
            <p className="text-[15px] leading-relaxed text-slate-600 mb-6">
              Welcome to Ameefar Energy Africa ("Ameefar," "we," "us," or "our"). These Terms of Service ("Terms") govern your access to and use of the Ameefar B2B marketplace, website, platform, and related services (collectively, the "Platform").
            </p>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              By registering for an account, accessing, or using the Platform, you agree to be bound by these Terms. If you do not agree, you may not use the Platform.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>1. Description of the Platform</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              Ameefar operates a B2B marketplace connecting verified buyers and sellers of recyclable commodities and sustainable energy products globally, with a focus on the African continent. The Platform facilitates discovery, negotiation, and secure transactions through our proprietary African Trade Protection Protocol.
            </p>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              Ameefar acts as an intermediary marketplace platform. We do not take title to the goods, nor are we the buyer or seller in the transactions between users. Payments are securely processed through Paystack.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>2. Account Registration and KYC Verification</h2>
            <h3 className={`${hanken.className} text-xl mt-6 mb-3`}>2.1 Eligibility</h3>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              To use the Platform, you must represent a legally recognized business entity and have the authority to bind that entity to these Terms.
            </p>

            <h3 className={`${hanken.className} text-xl mt-6 mb-3`}>2.2 Verification (KYC)</h3>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              All users (buyers and sellers) must undergo our mandatory Know Your Customer (KYC) and business verification process. For sellers, this includes on-the-ground facility audits and comprehensive background checks.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li>You agree to provide accurate, current, and complete information during registration.</li>
              <li>We reserve the right to suspend or terminate accounts that fail to meet our verification standards or provide misleading information.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            </ul>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>3. Trading on Ameefar (The African Trade Protection Protocol)</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              All transactions conducted on the Platform are governed by the African Trade Protection Protocol to ensure security and quality for both parties.
            </p>

            <h3 className={`${hanken.className} text-xl mt-6 mb-3`}>3.1 Payment Processing</h3>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              To protect both buyers and sellers, all transaction payments are processed securely through Paystack in accordance with our marketplace model. We do not provide or operate escrow services.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-4">
              <li><strong>Buyers:</strong> Your payments are securely processed and governed by the terms of the digital contract.</li>
              <li><strong>Sellers:</strong> Our payment process ensures that the buyer has committed the funds before you begin logistics and shipping.</li>
            </ul>

            <h3 className={`${hanken.className} text-xl mt-6 mb-3`}>3.2 Pre-Shipment Inspections and Quality Guarantee</h3>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              Quality is paramount. All trades require an independent pre-shipment physical inspection.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-4">
              <li>The goods must pass physical inspection and port loading confirmation before final payment is settled to the seller.</li>
              <li>Neither party can bypass the agreed payment process unilaterally during this process.</li>
            </ul>

            <h3 className={`${hanken.className} text-xl mt-6 mb-3`}>3.3 Halt of Trade and Refunds</h3>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              If the independent pre-shipment inspection reveals that the materials do not match the agreed-upon contract specifications:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li>The trade will be immediately halted.</li>
              <li>The buyer's payment will be <strong>fully refunded</strong> to the buyer, less any agreed-upon inspection or administrative fees explicitly stated in the contract.</li>
              <li>Sellers whose goods repeatedly fail inspection may be permanently banned from the Platform.</li>
            </ul>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>4. User Obligations</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">While using the Platform, you agree that you will not:</p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li>Post false, inaccurate, misleading, defamatory, or libelous content.</li>
              <li>Breach or circumvent any laws, third-party rights, or our systems and policies.</li>
              <li>Attempt to bypass the Platform's payment or communication systems to conduct transactions offline to avoid fees.</li>
              <li>Distribute viruses or any other technologies that may harm Ameefar or the interests/property of users.</li>
              <li>Infringe the copyright, trademark, patent, or other intellectual property rights of Ameefar or third parties.</li>
            </ul>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>5. Fees and Taxes</h2>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li><strong>Platform Fees:</strong> Ameefar charges service and transaction fees for facilitating the trade and inspections. These fees will be clearly presented to both parties prior to confirming a transaction.</li>
              <li><strong>Taxes:</strong> Users are entirely responsible for collecting, reporting, and remitting any and all applicable taxes, duties, tariffs, and customs fees associated with their transactions.</li>
            </ul>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>6. Disclaimers and Limitation of Liability</h2>
            <h3 className={`${hanken.className} text-xl mt-6 mb-3`}>6.1 Disclaimers</h3>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              While Ameefar enforces strict KYC and inspection protocols, the Platform and services are provided "AS IS" and "AS AVAILABLE." We disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.
            </p>

            <h3 className={`${hanken.className} text-xl mt-6 mb-3`}>6.2 Limitation of Liability</h3>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              To the maximum extent permitted by applicable law, Ameefar shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li>Your access to or use of or inability to access or use the Platform.</li>
              <li>Any conduct or content of any third party on the Platform.</li>
              <li>Any delays, logistics failures, or shipping disputes once goods have passed inspection and loaded at the port.</li>
            </ul>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>7. Dispute Resolution</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              In the event of a dispute between a buyer and a seller that cannot be resolved through the inspection protocol:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-[15px] text-slate-600 mb-8">
              <li>Parties agree to first attempt to resolve the dispute amicably through Ameefar's mediation team.</li>
              <li>If unresolved, the dispute shall be submitted to binding arbitration under the rules of the International Chamber of Commerce (ICC), rather than in court.</li>
            </ol>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>8. Modifications to Terms</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-8">
              We may amend these Terms at any time by posting the updated terms on the Platform. We will notify you of material changes via email or an alert on the Platform. Your continued use of the Platform after the effective date of the revised Terms constitutes your acceptance of the terms.
            </p>

            <h2 className={`${hanken.className} text-2xl mt-10 mb-4`}>9. Contact Information</h2>
            <p className="text-[15px] leading-relaxed text-slate-600 mb-4">
              If you have any questions about these Terms, please contact us at:
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
