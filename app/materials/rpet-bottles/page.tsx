import Link from "next/link";
import Image from "next/image";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function RPETBottlesPage() {
  return (
    <div className={`${inter.className} min-h-screen bg-white text-slate-900 antialiased`}>
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[600px] flex items-center pt-24 overflow-hidden bg-[#001a1a]">
        <div className="absolute inset-0">
          <Image 
            src="/images/Material_PET_bottles.jpg" 
            alt="rPET Bottles"
            fill
            className="object-cover opacity-35"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001a1a] via-[#001a1a]/80 to-transparent" />
          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[140px]" />
        </div>
        
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="max-w-[700px]">
            <div className={`${jetbrains.className} inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md px-4 py-1.5 text-[11px] text-emerald-300 tracking-widest uppercase mb-5`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Sustainable Feedstock
            </div>
            <h1 className={`${hanken.className} text-[48px] md:text-[64px] font-extrabold text-white leading-tight mb-6`}>
              Recycled PET <br/><span className="text-emerald-400">Bottles</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-[600px] leading-relaxed">
              Post-consumer PET bottles processed, sorted, and baled for direct reuse. By sourcing our rPET bales, you are actively contributing to the circular economy and diverting waste from landfills.
            </p>
            <div className="flex gap-4">
              <Link href="/marketplace?q=PET+Bottles" className={`${hanken.className} px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-xl shadow-[0_0_24px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-all hover:-translate-y-0.5`}>
                View Listings
              </Link>
              <Link href="/company" className={`${hanken.className} px-8 py-3.5 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all`}>
                Back to Company
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPECIFICATIONS ── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-emerald-50 blur-3xl" />
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-emerald-100 group order-2 md:order-1">
              <Image 
                src="/images/Material_PET_bottles.jpg"
                alt="Baled PET Bottles"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-emerald-100">
                  <h3 className={`${jetbrains.className} text-emerald-800 font-bold mb-2`}>High Transparency</h3>
                  <p className="text-sm text-slate-600">Primarily sourced from clear water and beverage bottles, offering excellent light transmission for secondary processing.</p>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <span className={`${jetbrains.className} text-emerald-600 text-[11px] tracking-[0.2em] uppercase font-bold mb-4 block`}>Baled & Ready</span>
              <h2 className={`${hanken.className} text-4xl md:text-5xl font-bold text-slate-900 mb-6`}>
                Optimized for <br/><span className="text-emerald-500">Recycling</span>
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                Our post-consumer PET bottle bales are collected and pressed under high density, ensuring cost-effective logistics. 
                They serve as the perfect starting feedstock for producing high-grade rPET flakes and pellets.
              </p>
              
              <ul className="space-y-4">
                {[
                  { title: "Sorted by Color", desc: "Available in clear, light blue, or mixed color bales depending on your needs." },
                  { title: "Cap & Label Allowances", desc: "Standard tolerances for PP/PE caps and labels, clearly stated on every contract." },
                  { title: "Traceable Supply", desc: "Sourced from audited community aggregators and MRFs across the continent." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-emerald-950 py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/Material_PET_bottles.jpg')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className={`${hanken.className} text-3xl md:text-4xl font-bold text-white mb-6`}>Source rPET Bottles Today</h2>
          <p className="text-emerald-100/80 mb-8">Secure your supply chain with our verified network of African recyclers.</p>
          <Link href="/marketplace?q=PET+Bottles" className={`${hanken.className} inline-flex px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1`}>
            Explore the Marketplace
          </Link>
        </div>
      </section>
    </div>
  );
}
