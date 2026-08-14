"use client";
import Link from "next/link";
import Image from "next/image";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function SplitLanding() {
  return (
    <main className={`bg-[#001a1a] ${inter.className}`}>
      <div className="flex flex-col md:flex-row min-h-screen overflow-hidden">

        {/* ── COMPANY / ENERGY SECTION ── */}
        <Link href="/company" className="group relative flex-1 flex flex-col justify-center items-center overflow-hidden min-h-[50vh] md:min-h-screen border-b md:border-b-0 md:border-r border-white/10">

          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/heroSlides/ban2.jpeg"
              alt="Ameefar Energy Corporate"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.15] opacity-40 group-hover:opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#001a1a] via-[#001a1a]/80 to-[#001a1a]/20" />
            <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-700" />
          </div>

          {/* Floating Orb Effect */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-700">

            {/* Logo Box */}
            <div className="mb-8 rounded-2xl bg-white/5 p-5 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_0_40px_rgba(52,211,153,0.1)] transition-all duration-500 group-hover:-translate-y-2 group-hover:ring-emerald-400/30 group-hover:shadow-[0_0_60px_rgba(52,211,153,0.2)]">
              <Image src="/ameefarLogo.png" alt="Ameefar Logo" width={80} height={80} className="drop-shadow-2xl" />
            </div>

            <h2 className={`${hanken.className} text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight group-hover:text-emerald-300 transition-colors duration-500`}>
              Ameefar Energy
            </h2>

            <p className="text-slate-300/80 mb-10 text-sm md:text-base leading-relaxed font-medium">
              Discover our mission to power the circular economy and build sustainable, eco-friendly recycling solutions across Africa.
            </p>

            <span className={`${jetbrains.className} inline-flex items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 transition-all duration-500 group-hover:bg-emerald-400 group-hover:text-[#001a1a] shadow-[0_0_20px_rgba(52,211,153,0)] group-hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]`}>
              Explore Company
              <svg className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </div>
        </Link>

        {/* ── MARKETPLACE SECTION ── */}
        <Link href="/marketplace" className="group relative flex-1 flex flex-col justify-center items-center overflow-hidden min-h-[50vh] md:min-h-screen">

          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/heroSlides/recycle.jpg"
              alt="Ameefar Marketplace"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.15] opacity-40 group-hover:opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-[#001a1a] via-[#001a1a]/80 to-[#001a1a]/20" />
            <div className="absolute inset-0 bg-teal-900/40 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-700" />
          </div>

          {/* Floating Orb Effect */}
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-700">

            {/* Icon Box */}
            <div className="mb-8 rounded-2xl bg-white/5 p-5 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_0_40px_rgba(45,212,191,0.1)] transition-all duration-500 group-hover:-translate-y-2 group-hover:ring-teal-400/30 group-hover:shadow-[0_0_60px_rgba(45,212,191,0.2)] flex items-center justify-center">
              <svg className="w-20 h-20 text-teal-100/70 group-hover:text-teal-300 transition-colors duration-500 drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>

            <h2 className={`${hanken.className} text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight group-hover:text-teal-300 transition-colors duration-500`}>
              The Marketplace
            </h2>

            <p className="text-slate-300/80 mb-10 text-sm md:text-base leading-relaxed font-medium">
              Join the first B2B recycling marketplace built on the African Trade Protection protocol with 100% secure trading.
            </p>

            <span className={`${jetbrains.className} inline-flex items-center gap-3 rounded-full border border-teal-400/30 bg-teal-400/10 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300 transition-all duration-500 group-hover:bg-teal-400 group-hover:text-[#001a1a] shadow-[0_0_20px_rgba(45,212,191,0)] group-hover:shadow-[0_0_30px_rgba(45,212,191,0.3)]`}>
              Visit Marketplace
              <svg className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </span>
          </div>
        </Link>

      </div>

      {/* ── INFO SECTION ── */}
      <section className="py-24 px-6 md:px-12 bg-white border-t border-slate-100 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 relative z-10">

          {/* Company Write-up */}
          <div className="group">
            <span className={`${jetbrains.className} text-emerald-600 text-xs font-bold tracking-[0.2em] uppercase mb-5 block`}>Ameefar Energy</span>
            <h3 className={`${hanken.className} text-3xl md:text-4xl font-bold mb-6 text-slate-900`}>Powering the Circular Economy</h3>
            <p className="text-slate-600 leading-relaxed mb-8 text-[15px] md:text-[16px]">
              Ameefar Energy Africa is a pioneering force in sustainable recycling. We believe that waste does not exist—only resources waiting to be repurposed. By bridging the gap between waste collection in Africa and global manufacturing demand, we are actively rebuilding the future and diverting millions of tonnes of plastic and metal from landfills.
            </p>
            <ul className="space-y-4">
              {[
                "Focus on sustainable, eco-friendly recycling solutions.",
                "Millions of tonnes of PET and UBC repurposed.",
                "Building a greener footprint across the African continent."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-slate-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Marketplace Write-up */}
          <div className="group">
            <span className={`${jetbrains.className} text-teal-600 text-xs font-bold tracking-[0.2em] uppercase mb-5 block`}>The Marketplace</span>
            <h3 className={`${hanken.className} text-3xl md:text-4xl font-bold mb-6 text-slate-900`}>100% Secure African Trade</h3>
            <p className="text-slate-600 leading-relaxed mb-8 text-[15px] md:text-[16px]">
              The Ameefar Marketplace is the first B2B recycling platform built on the African Trade Protection protocol. We eliminate the historic risks of cross-border commodity trading by strictly enforcing mandatory independent inspections, secure payment processing, and vetting every single supplier on our platform.
            </p>
            <ul className="space-y-4">
              {[
                "Payments secured via Paystack",
                "Independent pre-shipment inspections on every deal.",
                "100% verified suppliers with on-the-ground audits."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm text-slate-600 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
