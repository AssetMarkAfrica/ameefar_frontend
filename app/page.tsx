"use client";
import Link from "next/link";
import Image from "next/image";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useAppSelector } from "@/store/hooks";
import { selectUser, selectIsAuthenticated } from "@/store/auth/authSelectors";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const trustSignals = [
  { label: "KYC Verified Suppliers", icon: "✦" },
  { label: "International Escrow Protected", icon: "✦" },
  { label: "Mandatory On-Site Inspections", icon: "✦" },
  { label: "Enforceable Quality Contracts", icon: "✦" },
];

const pillars = [
  {
    number: "01",
    title: "Vetted African Partners",
    text: "Every African supplier undergoes rigorous on-the-ground verification — facility audits and comprehensive background checks — before any listing goes live.",
  },
  {
    number: "02",
    title: "Ironclad Escrow",
    text: "Your capital is protected in secure international escrow accounts. Funds release only after materials pass physical inspection and port loading is confirmed.",
  },
  {
    number: "03",
    title: "Guaranteed Quality",
    text: "If the independent pre-shipment inspection doesn't match your contract, the trade is halted and your funds stay protected. No exceptions.",
  },
];

const categories = [
  {
    title: "Ferrous Metals",
    stats: "1,200 listings",
    types: "HMS 1&2 · Shredded",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAw-dFGdzaebKzIE4qFZZ8QKYB2KMwuE-jeV-9hK03pbuK1CynHqBiSrqU3N2d8cekpexTQnQng8TeAWha02e2crBzAhupa16ih4P3lr3ABmgwnsGhZg3vDaeOkJTjQ0yT1yqVZ8K1WFmxlnh_8PoBl6XFgKS7FGNpX86hWfRL0bjPYfeh8czRsJPLrDSTCdv2_sfEJascD4i-BEk7Vi6zROw0CAbm0ItgK6SGA5bZehZRl_sO1VPQ1NBENwV5zLpOZz9MiAavg9VO",
  },
  {
    title: "Plastics",
    stats: "850 listings",
    types: "PET · HDPE · LDPE",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBwpdUcZU-1Iz7dTfvZu15DFRFH0VkbQ9-kEjtdCB2Qk1rkNIWHhhrOcQuIll27yL6b1Wdm9JUDYsWGBA-azzHMZkQe8iGWEdJi49tU43UKZXBIdM1ET9X4XOIqkIiC0696XfWf4glqZaem6Yhw_f1cRA1M69DASiMYl16FHjvIvvS4vY3McbzZKfld1Rm69SxgQ1mp5lIFp65WnS3oboMpWdUo6clULy3mwaeeYA1NG5CTtlxgeYXW3S39jqEXULWvvm5tV91K_fIS",
  },
  {
    title: "Recovered Paper",
    stats: "620 listings",
    types: "OCC · ONP",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDrmJaCUYrMFmK92wEPRbHokWjt8upVtrCqAfIHFyc9eMuCOuJphxgGo5JS9_CO5LpB3jCA6Y9yxD6U6xjjgNI7531cvHjtFC6z7ipmF3Lb7Ug-XNEBKFCp0_jiBrZIac328UEMxBKC0zyswraInUa8EWnOPxmjvpttSi6LKVRQCZ1GH5Lb1RFoO5OXINKFXPf8NIvAmBR5Nxy2equmKqlY6UtvLa6QLSsOd0AjyE120361nbz09ja070xaIJAqSlWefFKA8CtQM6EQ",
  },
];

export default function Home() {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <div className={`${inter.className} min-h-screen bg-white text-slate-900 antialiased`}>

      {/* ── NAV ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-100 bg-white/98 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-10">
            <Link href="/product" className="flex items-center gap-3 shrink-0">
              <Image
                alt="Ameefar logo"
                className="rounded-lg object-cover"
                height={36}
                width={36}
                src="/ameefarLogo.png"
              />
              <div className="flex flex-col leading-none">
                <span className={`${hanken.className} text-[16px] font-bold tracking-tight text-[#002627]`}>
                  Ameefar
                </span>
                <span className={`${jetbrains.className} text-[9px] font-medium tracking-[0.15em] text-[#006d40] uppercase mt-0.5`}>
                  Commodity Trading
                </span>
              </div>
            </Link>
            <nav className="hidden gap-7 md:flex text-[13.5px] font-medium text-slate-500">
              <a href="/product" className="hover:text-slate-900 transition-colors">Marketplace</a>
              <a href="#" className="hover:text-slate-900 transition-colors">About</a>
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm">
            {isAuthenticated && user ? (
              <>
                <span className={`${jetbrains.className} text-xs text-[#006d40] font-medium`}>
                  {user.first_name}
                </span>
                <LogoutButton className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60" />
              </>
            ) : (
              <Link
                href="/auth/register"
                className="rounded-lg bg-[#002627] px-5 py-2 text-[13px] font-semibold !text-white transition hover:bg-[#003a3c]"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16">

        {/* ── HERO ── */}
        <section className="relative flex min-h-[620px] items-center overflow-hidden bg-[#001a1a]">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoKCEotrgH9tJ7A7mWhRcNnwa9fNyVr576vaiX6J5EBQykMiZzUKvH_FC1Pua3Xer725MbtjidntdLd87hkz8MSldgGTYoR58OLOWPauCLK2HMaGF_q4PJ4SxkR4hg5rerxXnNHeOJXMLI6RxJKHbdVBSwquJ6eh99Zbc2BwAxLYEHbHhqJu4V_vdHN0vr_kvODYdQUBAymxhDu5PTWsffPq3sa8VH-thj_kLP1rgZ8cKqRPUtzH3YK0q4kgQHV5pkjUbsF_g88Hw6"
            alt="Industrial port"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          {/* gradient: dark on left fades to transparent right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001a1a] via-[#001a1a]/75 to-transparent" />
          {/* subtle teal glow bottom-left */}
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#00796b]/20 blur-[120px]" />

          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 py-24 md:px-12">
            <div className="max-w-2xl">
              <span
                className={`${jetbrains.className} inline-flex items-center gap-2 rounded-full border border-[#00bfa5]/40 bg-[#00bfa5]/10 px-3.5 py-1.5 text-[11px] text-[#80cbc4] tracking-widest uppercase`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5] animate-pulse" />
                100% Secure Trading
              </span>

              <h1
                className={`${hanken.className} mt-7 text-[42px] font-extrabold leading-[1.1] tracking-tight text-white md:text-[60px]`}
              >
                Secure African Trade.{" "}
                <span className="text-[#80cbc4]">Guaranteed Quality.</span>
              </h1>

              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-slate-300/90">
                The first B2B recycling marketplace built on the African Trade Protection protocol —
                with mandatory inspections and international escrow on every deal.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/product"
                  className={`${hanken.className} inline-flex items-center gap-2.5 rounded-xl bg-[#beebeb] px-8 py-4 text-[15px] font-bold text-[#002627] shadow-[0_0_32px_rgba(190,235,235,0.25)] transition hover:-translate-y-0.5 hover:bg-[#a3d6d6] hover:shadow-[0_0_48px_rgba(190,235,235,0.4)]`}
                >
                  Visit Marketplace
                  <svg fill="none" height="18" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="18">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>

                {isAuthenticated ? (
                  <Link
                    href="/profile"
                    className="inline-flex items-center rounded-xl border border-white/30 bg-black/40 px-8 py-4 text-[15px] font-bold !text-white backdrop-blur-md transition hover:bg-black/60"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center rounded-xl border border-white/30 bg-black/40 px-8 py-4 text-[15px] font-bold !text-white backdrop-blur-md transition hover:bg-black/60"
                  >
                    Start Buying & Selling
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ── */}
        <section className="border-b border-slate-100 bg-[#f0faf9]">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5 md:px-12 md:justify-between">
            {trustSignals.map((signal) => (
              <div key={signal.label} className="flex items-center gap-2.5">
                <span className="text-[#006d40] text-xs">✦</span>
                <span className={`${jetbrains.className} text-[11.5px] font-medium tracking-wide text-slate-600`}>
                  {signal.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── PILLARS ── */}
        <section className="bg-[#f8fffe] px-6 py-24 md:px-12">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-xl">
              <span className={`${jetbrains.className} text-[11px] tracking-[0.15em] text-[#006d40] uppercase font-medium`}>
                Our Protocol
              </span>
              <h2 className={`${hanken.className} mt-3 text-[36px] font-bold leading-tight text-[#002627] md:text-[44px]`}>
                The African Trade Protection Protocol
              </h2>
              <p className="mt-4 text-[16px] leading-relaxed text-slate-500">
                Three pillars that eliminate the historic risks of cross-border commodity trading.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {pillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#beebeb] hover:shadow-[0_8px_32px_rgba(0,109,64,0.08)]"
                >
                  <span className={`${jetbrains.className} text-[11px] font-medium tracking-widest text-[#006d40]/60 uppercase`}>
                    {pillar.number}
                  </span>
                  <h3 className={`${hanken.className} mt-3 text-[20px] font-bold text-[#002627]`}>
                    {pillar.title}
                  </h3>
                  <div className="mt-2 h-px w-8 bg-[#beebeb]" />
                  <p className="mt-4 text-[14.5px] leading-relaxed text-slate-500">{pillar.text}</p>
                  {/* hover accent */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#006d40] to-[#00bfa5] transition-all duration-500 group-hover:w-full" />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="bg-white px-6 py-24 md:px-12">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className={`${jetbrains.className} text-[11px] tracking-[0.15em] text-[#006d40] uppercase font-medium`}>
                  Active Markets
                </span>
                <h2 className={`${hanken.className} mt-2 text-[36px] font-bold text-[#002627] md:text-[44px]`}>
                  Verified African Materials
                </h2>
              </div>
              <Link
                href="/product"
                className={`${jetbrains.className} text-[12px] font-medium text-[#006d40] underline underline-offset-4 hover:text-[#004d2c] transition-colors`}
              >
                Browse all listings →
              </Link>
            </div>

            <div className="grid gap-7 md:grid-cols-3">
              {categories.map((category) => (
                <Link href="/product" key={category.title} className="group block">
                  <div className="relative mb-4 h-[280px] overflow-hidden rounded-2xl bg-slate-100">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001a1a]/80 via-[#001a1a]/20 to-transparent" />
                    {/* bottom content */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className={`${hanken.className} text-[22px] font-bold text-white leading-tight`}>
                        {category.title}
                      </h3>
                      <span className={`${jetbrains.className} text-[11px] text-white/60 tracking-wider`}>
                        {category.types}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[13px] font-semibold text-slate-700">{category.stats}</span>
                    <span className="text-[12px] font-medium text-[#006d40] transition group-hover:translate-x-0.5">
                      View listings →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOUNDER'S VISION ── */}
        <section className="bg-[#f0faf9] px-6 py-24 md:px-12 border-t border-slate-100">
          <div className="mx-auto max-w-[1000px] text-center">
            <div className="mx-auto mb-8 h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-[0_4px_20px_rgba(0,109,64,0.15)]">
              <Image
                src="https://res.cloudinary.com/dqwub0fhb/image/upload/v1782219057/pascal_nsd1sq.jpg"
                alt="Abdulai Pascal Mohammed"
                height={96}
                width={96}
                className="h-full w-full object-cover"
              />
            </div>
            <blockquote className={`${hanken.className} text-[22px] font-medium leading-relaxed text-[#002627] md:text-[30px]`}>
              "The transition to sustainable secondary raw materials requires a rigorous, data-driven marketplace. Ameefar provides exactly that—closing the loop on African sustainability."
            </blockquote>
            <div className="mt-8">
              <a href="https://www.linkedin.com/in/abdulai-pascal-mohammed-222059345/" target="_blank" rel="noreferrer" className="inline-block hover:underline">
                <strong className="block text-[18px] font-bold text-[#002627]">Abdulai Pascal Mohammed</strong>
              </a>
              <span className={`${jetbrains.className} mt-1.5 block text-[12px] text-[#006d40] uppercase tracking-widest font-medium`}>
                CEO · Sustainability | rPET | Recycling
              </span>
            </div>
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <section className="bg-[#002627] px-6 py-20 md:px-12">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
            <div className="max-w-xl">
              <h2 className={`${hanken.className} text-[30px] font-bold text-white leading-tight md:text-[38px]`}>
                Ready to trade with confidence?
              </h2>
              <p className="mt-3 text-[15px] text-slate-300/80 leading-relaxed">
                Join verified buyers and sellers already using Ameefar's protected marketplace.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <Link
                href="/product"
                className={`${hanken.className} inline-flex items-center gap-2 rounded-xl bg-[#beebeb] px-7 py-3.5 text-[14px] font-bold text-[#002627] transition hover:-translate-y-0.5 hover:bg-[#a3d6d6]`}
              >
                Browse Marketplace
                <svg fill="none" height="16" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              {!isAuthenticated && (
                <Link
                  href="/auth/register"
                  className="inline-flex items-center rounded-xl border border-white/25 px-7 py-3.5 text-[14px] font-medium !text-white transition hover:bg-white/10"
                >
                  Start Buying & Selling
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#001a1a] px-6 py-14 text-slate-400 md:px-12">
        <div className="mx-auto grid max-w-[1440px] gap-10 md:grid-cols-4">
          <div>
            <div className={`${hanken.className} text-[18px] font-bold text-white`}>Ameefar</div>
            <p className="mt-3 text-[13px] leading-relaxed text-slate-400/80">
              Trusted global B2B marketplace for secondary raw materials, protected by the African Trade Protection protocol.
            </p>
          </div>
          <div>
            <h4 className={`${hanken.className} text-[13px] font-semibold text-white/80 uppercase tracking-wider`}>Platform</h4>
            <ul className="mt-3 space-y-2 text-[13px] text-slate-400/80">
              <li><a href="/product" className="hover:text-white transition-colors">Marketplace</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Inspections</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className={`${hanken.className} text-[13px] font-semibold text-white/80 uppercase tracking-wider`}>Legal</h4>
            <ul className="mt-3 space-y-2 text-[13px] text-slate-400/80">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
            </ul>
          </div>
          <div>
            <h4 className={`${hanken.className} text-[13px] font-semibold text-white/80 uppercase tracking-wider`}>Support</h4>
            <ul className="mt-3 space-y-2 text-[13px] text-slate-400/80">
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-[1440px] border-t border-white/5 pt-6 flex flex-col items-center justify-between gap-3 text-[12px] text-slate-500 md:flex-row">
          <span>© 2026 Ameefar B2B Marketplace. All rights reserved.</span>
          <span className={`${jetbrains.className} text-[10px] tracking-widest uppercase text-slate-600`}>
            African Trade Protection Protocol
          </span>
        </div>
      </footer>
    </div>
  );
}