"use client";

import Link from "next/link";
import Image from "next/image";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function PETFlakesPage() {
  return (
    <div className={`${inter.className} min-h-screen bg-white text-slate-900 antialiased`}>
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[600px] flex items-center pt-24 overflow-hidden bg-cyan-950">
        <div className="absolute inset-0">
          <Image 
            src="/images/whatWeSell/p2.jpg" 
            alt="PET Flakes"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950 via-cyan-950/90 to-transparent" />
          <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
        </div>
        
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="max-w-[750px]">
            <div className={`${jetbrains.className} inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md px-4 py-1.5 text-[11px] text-cyan-300 tracking-widest uppercase mb-5`}>
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              High-Grade Material
            </div>
            <h1 className={`${hanken.className} text-[48px] md:text-[64px] font-extrabold text-white leading-tight mb-6`}>
              PET <span className="text-cyan-400">Flakes</span>
            </h1>
            <p className="text-lg text-cyan-100/70 mb-8 max-w-[650px] leading-relaxed">
              Processed from post-consumer PET bottles, our flakes are available in three distinct grades to match your precise manufacturing requirements: Unwashed, Cold Washed, and Hot Washed.
            </p>
            <div className="flex gap-4">
              <a href="#grades" className={`${hanken.className} px-8 py-3.5 bg-cyan-500 text-cyan-950 font-bold rounded-xl shadow-[0_0_24px_rgba(34,211,238,0.3)] hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all hover:-translate-y-0.5 inline-flex items-center justify-center`}>
                View Grades
              </a>
              <Link href="/company" className={`${hanken.className} px-8 py-3.5 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 backdrop-blur-sm transition-all`}>
                Back to Company
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── GRADES SECTION ── */}
      <section id="grades" className="py-24 bg-slate-50 relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
             <span className={`${jetbrains.className} text-cyan-600 text-[11px] tracking-[0.2em] uppercase font-bold mb-4 block`}>Our Specifications</span>
             <h2 className={`${hanken.className} text-4xl md:text-5xl font-bold text-slate-900`}>Choose Your <span className="text-cyan-600">Grade</span></h2>
          </div>

          <div className="space-y-12">
            
            {/* Unwashed */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-cyan-900/5 border border-slate-100 flex flex-col md:flex-row gap-12 items-center hover:border-cyan-100 transition-colors">
              <div className="flex-1">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mb-6 font-bold text-xl">1</div>
                <h3 className={`${hanken.className} text-3xl font-bold text-slate-900 mb-4`}>Unwashed PET Flakes</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Mechanically shredded directly from baled or loose PET bottles without undergoing a washing process. These flakes retain some organic residues and labels, making them a cost-effective raw material for secondary processors who have their own advanced washing lines.
                </p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className={`${jetbrains.className} text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1`}>Ideal For</h4>
                    <p className="text-sm font-medium text-slate-700">Internal reprocessing facilities</p>
                  </div>
                  <div>
                    <h4 className={`${jetbrains.className} text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1`}>Contamination</h4>
                    <p className="text-sm font-medium text-slate-700">Variable (requires washing)</p>
                  </div>
                </div>
                <Link href="/marketplace?q=Unwashed+PET+Flakes" className={`${hanken.className} text-cyan-600 font-bold hover:text-cyan-700 inline-flex items-center gap-2 group`}>
                  Find Unwashed Flakes 
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
              <div className="w-full md:w-[45%] h-[300px] bg-slate-100 rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('/images/whatWeBuy/b3.jpg')] bg-cover bg-center opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
              </div>
            </div>

            {/* Cold Washed */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-cyan-900/5 border border-slate-100 flex flex-col md:flex-row-reverse gap-12 items-center hover:border-cyan-200 transition-colors">
              <div className="flex-1">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 mb-6 font-bold text-xl">2</div>
                <h3 className={`${hanken.className} text-3xl font-bold text-slate-900 mb-4`}>Cold Washed PET Flakes</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Processed through a cold-water friction washing cycle. This significantly reduces dirt, organic matter, and loose paper labels. Cold washed flakes offer a balance between price and purity, suitable for non-food grade applications.
                </p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className={`${jetbrains.className} text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1`}>Ideal For</h4>
                    <p className="text-sm font-medium text-slate-700">Polyester staple fiber (PSF), strapping</p>
                  </div>
                  <div>
                    <h4 className={`${jetbrains.className} text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1`}>Purity Level</h4>
                    <p className="text-sm font-medium text-slate-700">Medium (Low organics/dirt)</p>
                  </div>
                </div>
                <Link href="/marketplace?q=Cold+Washed+PET+Flakes" className={`${hanken.className} text-cyan-600 font-bold hover:text-cyan-700 inline-flex items-center gap-2 group`}>
                  Find Cold Washed Flakes 
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
              <div className="w-full md:w-[45%] h-[300px] bg-cyan-50 rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('/images/whatWeSell/p2.jpg')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/30 to-transparent" />
              </div>
            </div>

            {/* Hot Washed */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-cyan-900/10 border border-cyan-100 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[80px] group-hover:bg-cyan-400/10 transition-colors" />
              <div className="flex-1 relative z-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white mb-6 font-bold text-xl shadow-lg">3</div>
                <h3 className={`${hanken.className} text-3xl font-bold text-slate-900 mb-4`}>Hot Washed PET Flakes</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Our premium grade. Washed in a heated chemical bath (typically containing caustic soda) at high temperatures. This intensive process removes almost all adhesives, labels, odors, and stubborn contaminants, resulting in a highly pure material.
                </p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className={`${jetbrains.className} text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-1`}>Ideal For</h4>
                    <p className="text-sm font-medium text-slate-700">Bottle-to-bottle (B2B), food-grade packaging</p>
                  </div>
                  <div>
                    <h4 className={`${jetbrains.className} text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-1`}>Purity Level</h4>
                    <p className="text-sm font-medium text-slate-700">Highest (Adhesives & odors removed)</p>
                  </div>
                </div>
                <Link href="/marketplace?q=Hot+Washed+PET+Flakes" className={`${hanken.className} inline-flex px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-cyan-950 transition-colors shadow-md`}>
                  Find Hot Washed Flakes
                </Link>
              </div>
              <div className="w-full md:w-[45%] h-[300px] bg-cyan-100 rounded-2xl overflow-hidden relative z-10 shadow-lg border border-white/50">
                <div className="absolute inset-0 bg-[url('/images/whatWeSell/p2.jpg')] bg-cover bg-center scale-110 saturate-150 contrast-125" />
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/40 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white">
                  <span className={`${jetbrains.className} text-[10px] font-bold text-cyan-700 uppercase tracking-wide`}>Premium Grade</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
