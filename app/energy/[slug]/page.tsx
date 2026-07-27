import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { energyServices } from "../energy-services";
import SiteFooter from "@/components/SiteFooter";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return energyServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = energyServices.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: `${service.title} | Ameefar Energy`,
    description: service.description,
  };
}

export default async function EnergyServicePage({ params }: Props) {
  const { slug } = await params;
  const service = energyServices.find((s) => s.slug === slug);
  if (!service) notFound();

  const others = energyServices.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <div className={`${inter.className} min-h-screen bg-[#030d0d] text-white antialiased`}>

      {/* ── NAV ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#030d0d]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-3">
            <Image alt="Ameefar logo" className="rounded-lg object-cover" height={36} width={36} src="/ameefarLogo.png" />
            <div className="flex flex-col leading-none">
              <span className={`${hanken.className} text-[16px] font-bold tracking-tight text-white`}>Ameefar</span>
              <span className={`${jetbrains.className} text-[9px] font-medium tracking-[0.15em] text-[#00bfa5] uppercase mt-0.5`}>Energy Solutions</span>
            </div>
          </Link>
          <nav className="hidden gap-7 md:flex text-[13.5px] font-medium text-white/60">
            <Link href="/energy" className="hover:text-white transition-colors">← All Services</Link>
            <Link href="/" className="hover:text-white transition-colors">Marketplace</Link>
          </nav>
        </div>
      </header>

      <main className="pt-16">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          {/* hero image */}
          <div className="absolute inset-0 h-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={service.image} alt={service.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#030d0d]/60 via-[#030d0d]/80 to-[#030d0d]" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pt-28 pb-16 md:px-12">
            {/* breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-[12px] text-white/40">
              <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/energy" className="hover:text-white/70 transition-colors">Energy Solutions</Link>
              <span>/</span>
              <span className="text-white/70">{service.title}</span>
            </nav>

            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-3xl backdrop-blur-sm">
                {service.icon}
              </div>
              <div className={`h-0.5 w-12 rounded-full bg-gradient-to-r ${service.gradient}`} />
            </div>

            <p className={`${jetbrains.className} text-[11px] tracking-widest uppercase mb-2`} style={{ color: service.accentColor }}>
              {service.tagline}
            </p>
            <h1 className={`${hanken.className} text-[38px] font-extrabold leading-tight md:text-[56px] max-w-3xl`}>
              {service.title}
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/65">
              {service.description}
            </p>
          </div>
        </section>

        {/* ── BODY + HIGHLIGHTS ── */}
        <section className="px-6 pb-24 md:px-12">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-14 md:grid-cols-[1fr_340px] lg:grid-cols-[1fr_380px]">

              {/* body text */}
              <article className="prose prose-invert max-w-none">
                {service.body.split("\n\n").map((para, i) => (
                  <p key={i} className="mb-5 text-[15.5px] leading-[1.8] text-white/70">
                    {para.trim()}
                  </p>
                ))}
              </article>

              {/* sidebar highlights */}
              <aside>
                <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
                  <p className={`${jetbrains.className} text-[10px] tracking-widest text-white/40 uppercase mb-4`}>
                    What We Offer
                  </p>
                  <ul className="space-y-3">
                    {service.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3">
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: `linear-gradient(135deg, ${service.accentColor}, ${service.accentColor}88)` }}
                        />
                        <span className="text-[14px] text-white/70">{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`mt-8 h-px w-full bg-gradient-to-r ${service.gradient} opacity-20`} />

                  <div className="mt-6 text-center">
                    <p className="text-[12px] text-white/40 mb-3">Interested in this service?</p>
                    <Link
                      href="/contact"
                      className={`${hanken.className} inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${service.gradient} px-5 py-3 text-[13px] font-bold text-white transition hover:opacity-90`}
                    >
                      Contact Ameefar Energy →
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── OTHER SERVICES ── */}
        <section className="border-t border-white/10 px-6 py-20 md:px-12">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-10 flex items-center justify-between">
              <h2 className={`${hanken.className} text-[22px] font-bold`}>Other Services</h2>
              <Link href="/energy" className={`${jetbrains.className} text-[11px] tracking-wide text-[#00bfa5] hover:underline`}>
                View all →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {others.map((s) => (
                <Link
                  key={s.slug}
                  href={`/energy/${s.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:-translate-y-0.5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-xl">
                    {s.icon}
                  </div>
                  <div>
                    <h3 className={`${hanken.className} text-[14px] font-bold text-white`}>{s.title}</h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/50 line-clamp-2">{s.description}</p>
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
