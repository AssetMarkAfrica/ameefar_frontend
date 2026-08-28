import Link from "next/link";
import Image from "next/image";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function UBCPage() {
  return (
    <div className={`${inter.className} min-h-screen bg-white text-slate-900 antialiased`}>
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[600px] flex items-center pt-24 overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <Image 
            src="/images/whatWeSell/ubc.jpg" 
            alt="UBC Aluminium"
            fill
            className="object-cover opacity-30 mix-blend-luminosity"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>
        
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="max-w-[700px]">
            <div className={`${jetbrains.className} inline-flex items-center gap-2.5 rounded-full border border-slate-500/30 bg-slate-500/10 backdrop-blur-md px-4 py-1.5 text-[11px] text-slate-300 tracking-widest uppercase mb-5`}>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              Global Export
            </div>
            <h1 className={`${hanken.className} text-[48px] md:text-[64px] font-extrabold text-white leading-tight mb-6`}>
              Used Beverage Cans <span className="text-slate-400">(UBC)</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-[600px] leading-relaxed">
              Premium grade aluminium UBC sourced from trusted African suppliers. Ensuring superior quality, high yield, and a reliable, consistent supply for smelting operations worldwide.
            </p>
            <div className="flex gap-4">
              <Link href="/marketplace?q=UBC" className={`${hanken.className} px-8 py-3.5 bg-white text-slate-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5`}>
                View Listings
              </Link>
              <Link href="/company" className={`${hanken.className} px-8 py-3.5 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all`}>
                Back to Company
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPECIFICATIONS ── */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className={`${jetbrains.className} text-blue-600 text-[11px] tracking-[0.2em] uppercase font-bold mb-4 block`}>Material Specs</span>
              <h2 className={`${hanken.className} text-4xl md:text-5xl font-bold text-slate-900 mb-6`}>
                Industrial Grade <br/><span className="text-slate-500">Aluminium</span>
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                Our UBC is processed, sorted, and baled to meet stringent international standards. 
                Sourced extensively from collectors and recycling hubs, we ensure that the material is free from excessive contamination, 
                maximizing yield for your operations.
              </p>
              
              <ul className="space-y-4">
                {[
                  { title: "Baled Density", desc: "Optimized for maximum shipping efficiency in 40ft containers." },
                  { title: "Low Moisture & Dirt", desc: "Strictly monitored to guarantee a cleaner melt." },
                  { title: "Magnetic Separation", desc: "Passed through magnetic belts to remove stray ferrous metals." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
              <Image 
                src="/images/whatWeSell/ubc.jpg"
                alt="UBC Bales"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
                  <h3 className={`${jetbrains.className} text-slate-900 font-bold mb-2`}>Quality Guarantee</h3>
                  <p className="text-sm text-slate-600">Every shipment undergoes mandatory pre-shipment inspection by an independent 3rd party to verify grade and weight.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-slate-900 py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className={`${hanken.className} text-3xl md:text-4xl font-bold text-white mb-6`}>Ready to source UBC?</h2>
          <p className="text-slate-400 mb-8">Access our network of verified African suppliers and trade with total security.</p>
          <Link href="/marketplace?q=UBC" className={`${hanken.className} inline-flex px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-1`}>
            Browse UBC Marketplace
          </Link>
        </div>
      </section>
    </div>
  );
}
