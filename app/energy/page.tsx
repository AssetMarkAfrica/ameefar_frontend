import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { energyServices } from "./energy-services";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Energy Solutions | Ameefar Energy",
  description:
    "Explore Ameefar Energy's full suite of clean and sustainable energy solutions — from solar and wind to EV charging infrastructure across Africa.",
};

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function EnergyPage() {
  return (
    <div className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased`}>

      {/* ── NAV ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-3">
            <Image alt="Ameefar logo" className="rounded-lg object-cover" height={36} width={36} src="/ameefarLogo.png" />
            <div className="flex flex-col leading-none">
              <span className={`${hanken.className} text-[16px] font-bold tracking-tight text-slate-900`}>AMEEFAR ENERGY</span>

            </div>
          </Link>
          <nav className="hidden gap-7 md:flex text-[13.5px] font-medium text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">← Commodity Platform</Link>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
          </nav>
          <Link
            href="/contact"
            className={`${hanken.className} hidden md:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00bfa5] to-[#006d40] px-5 py-2 text-[13px] font-bold text-white transition hover:opacity-90`}
          >
            Get in Touch
          </Link>
        </div>
      </header>

      <main className="pt-16">

        {/* ── HERO ── */}
        <section className="relative flex min-h-[500px] items-center overflow-hidden">
          <div className="absolute inset-0 bg-white" />
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#00bfa5]/10 blur-[140px]" />
          <div className="absolute -bottom-20 right-10 h-[400px] w-[400px] rounded-full bg-[#006d40]/10 blur-[120px]" />

          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 py-20 md:px-12">
            <div className="max-w-3xl">
              <span className={`${jetbrains.className} inline-flex items-center gap-2 rounded-full border border-[#00bfa5]/20 bg-[#00bfa5]/10 px-3.5 py-1.5 text-[11px] text-[#006d40] font-semibold tracking-widest uppercase`}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5] animate-pulse" />
                Ameefar Energy — Clean Power for Africa
              </span>
              <h1 className={`${hanken.className} mt-7 text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[60px] text-slate-900`}>
                Powering Africa's{" "}
                <span className="bg-gradient-to-r from-[#00bfa5] to-[#006d40] bg-clip-text text-transparent">
                  Sustainable Future
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-slate-600">
                From solar farms to electric mobility, Ameefar Energy delivers end-to-end clean energy infrastructure solutions tailored for Africa's climate, communities, and industries.
              </p>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ── */}
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-14 gap-y-4 px-6 py-6 md:px-12 md:justify-between">
            {[
              { label: "Energy Services", value: "7+" },
              { label: "Years of Experience", value: "10+" },
              { label: "African Countries", value: "5+" },
              { label: "Clean Energy Focus", value: "100%" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center md:items-start md:text-left">
                <span className={`${hanken.className} text-[28px] font-extrabold text-[#00bfa5]`}>{stat.value}</span>
                <span className={`${jetbrains.className} text-[11px] font-semibold tracking-widest text-slate-500 uppercase`}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SERVICES GRID ── */}
        <section className="px-6 py-24 md:px-12 bg-white">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-14 text-center">
              <span className={`${jetbrains.className} text-[11px] tracking-[0.15em] text-[#00bfa5] uppercase font-semibold`}>Our Services</span>
              <h2 className={`${hanken.className} mt-3 text-[34px] font-bold leading-tight md:text-[46px] text-slate-900`}>
                Complete Energy Solutions
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600 max-w-xl mx-auto">
                Every service is designed to work standalone or integrate seamlessly — delivering clean, reliable energy across the entire value chain.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {energyServices.map((service) => (
                <Link
                  key={service.slug}
                  href={`/energy/${service.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_16px_64px_rgba(0,0,0,0.06)]"
                >
                  {/* image */}
                  <div className="relative h-44 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
                    <div className="absolute bottom-4 left-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/20 text-xl backdrop-blur-sm text-white shadow-sm">
                      {service.icon}
                    </div>
                    <div className={`absolute top-4 right-4 h-1 w-8 rounded-full bg-gradient-to-r ${service.gradient}`} />
                  </div>

                  {/* content */}
                  <div className="flex flex-1 flex-col p-6">
                    <p className={`${jetbrains.className} text-[10px] tracking-widest text-slate-400 font-semibold uppercase`}>{service.tagline}</p>
                    <h3 className={`${hanken.className} mt-1.5 text-[18px] font-bold text-slate-900`}>{service.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-slate-600 flex-1 line-clamp-3">{service.description}</p>
                    <p className={`mt-5 text-[12px] font-semibold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                      Learn more →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
