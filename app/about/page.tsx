"use client";
import Image from "next/image";
import Link from "next/link";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const milestones = [
  { year: "2021", title: "Founded in Accra", text: "Ameefar Energy Africa Ltd. was established with a mission to formalise and secure cross-border recycled commodity trade across the African continent." },
  { year: "2022", title: "First Verified Exports", text: "Completed our first batch of KYC-verified, escrow-protected rPET and HMS scrap shipments to European buyers, proving the model works." },
  { year: "2023", title: "African Trade Protocol", text: "Launched the African Trade Protection Protocol — mandatory on-site inspections, international escrow, and enforceable quality contracts on every deal." },
  { year: "2024", title: "Marketplace Goes Live", text: "Opened the B2B marketplace to global buyers and African suppliers, with 2,600+ active listings across Ferrous Metals, Plastics, and Recovered Paper." },
];

const values = [
  {
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Integrity",
    text: "Every transaction is built on verified identities, enforceable contracts, and transparent processes. No exceptions.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5" />
      </svg>
    ),
    title: "Pan-African Vision",
    text: "We are building Africa's premier secondary raw materials exchange — connecting the continent to global circular economy supply chains.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Sustainability",
    text: "Every kilogram of recycled material traded on Ameefar keeps waste out of landfills and greenhouse gases out of the atmosphere.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: "Partnership",
    text: "We grow by growing our partners. Vetted African suppliers gain global reach; international buyers gain secure, reliable sourcing.",
  },
];

const team = [
  {
    name: "Abdulai Pascal Mohammed",
    role: "CEO · Sustainability | rPET | Recycling",
    image: "https://res.cloudinary.com/dqwub0fhb/image/upload/v1782219057/pascal_nsd1sq.jpg",
    linkedin: "https://www.linkedin.com/in/abdulai-pascal-mohammed-222059345/",
    bio: "Founder and CEO of Ameefar Energy Africa Ltd. Pascal has spent over a decade at the intersection of African sustainability, recycled plastics, and B2B commodity trading, pioneering the African Trade Protection Protocol.",
  },
];

export default function AboutPage() {
  return (
    <div className={`${inter.className} min-h-screen bg-white text-slate-900 antialiased`}>
      {/* ── SEO META (inline) ── */}
      <title>About Us – Ameefar Energy Africa</title>

      {/* ── NAV ── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-100 bg-white/98 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image alt="Ameefar logo" className="rounded-lg object-cover" height={36} width={36} src="/ameefarLogo.png" />
            <div className="flex flex-col leading-none">
              <span className={`${hanken.className} text-[16px] font-bold tracking-tight text-[#002627]`}>Ameefar</span>
              <span className={`${jetbrains.className} text-[9px] font-medium tracking-[0.15em] text-[#006d40] uppercase mt-0.5`}>
                Commodity Trading
              </span>
            </div>
          </Link>
          <nav className="hidden gap-7 md:flex text-[13.5px] font-medium text-slate-500">
            <Link href="/product" className="hover:text-slate-900 transition-colors">Marketplace</Link>
            <Link href="/about" className="text-[#006d40] font-semibold">About</Link>
          </nav>
          <Link
            href="/auth/register"
            className="rounded-lg bg-[#002627] px-5 py-2 text-[13px] font-semibold !text-white transition hover:bg-[#003a3c]"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="pt-16">

        {/* ── HERO ── */}
        <section className="relative flex min-h-[520px] items-center overflow-hidden bg-[#001a1a]">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoKCEotrgH9tJ7A7mWhRcNnwa9fNyVr576vaiX6J5EBQykMiZzUKvH_FC1Pua3Xer725MbtjidntdLd87hkz8MSldgGTYoR58OLOWPauCLK2HMaGF_q4PJ4SxkR4hg5rerxXnNHeOJXMLI6RxJKHbdVBSwquJ6eh99Zbc2BwAxLYEHbHhqJu4V_vdHN0vr_kvODYdQUBAymxhDu5PTWsffPq3sa8VH-thj_kLP1rgZ8cKqRPUtzH3YK0q4kgQHV5pkjUbsF_g88Hw6"
            alt="African port with recycled materials"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001a1a] via-[#001a1a]/80 to-transparent" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#006d40]/20 blur-[120px]" />

          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 py-20 md:px-12">
            <div className="max-w-2xl">
              <span className={`${jetbrains.className} inline-flex items-center gap-2 rounded-full border border-[#00bfa5]/40 bg-[#00bfa5]/10 px-3.5 py-1.5 text-[11px] text-[#80cbc4] tracking-widest uppercase`}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00bfa5] animate-pulse" />
                Our Story
              </span>
              <h1 className={`${hanken.className} mt-7 text-[40px] font-extrabold leading-[1.1] tracking-tight text-white md:text-[58px]`}>
                Built to Protect{" "}
                <span className="text-[#80cbc4]">African Trade.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-slate-300/90">
                Ameefar Energy Africa Ltd. was founded in Accra, Ghana, with a singular mission: to make cross-border recycled commodity trading safe, transparent, and profitable for every party — from the African supplier to the global buyer.
              </p>
            </div>
          </div>
        </section>

        {/* ── MISSION STRIP ── */}
        <section className="bg-[#014d2f] px-6 py-10 md:px-12">
          <div className="mx-auto max-w-[1440px] flex flex-col items-center gap-3 text-center md:flex-row md:gap-10 md:text-left">
            <span className={`${jetbrains.className} shrink-0 text-[11px] tracking-[0.18em] text-[#4caf50] uppercase font-medium`}>Our Mission</span>
            <div className="h-px w-full bg-white/10 hidden md:block" />
            <p className={`${hanken.className} text-[18px] font-semibold text-white leading-snug md:text-[22px] max-w-3xl`}>
              "The transition to sustainable secondary raw materials requires a rigorous, data-driven marketplace. Ameefar provides exactly that—closing the loop on African sustainability."
            </p>
          </div>
        </section>

        {/* ── WHAT WE DO ── */}
        <section className="bg-[#f8fffe] px-6 py-24 md:px-12">
          <div className="mx-auto max-w-[1440px] grid gap-14 md:grid-cols-2 md:items-center">
            <div>
              <span className={`${jetbrains.className} text-[11px] tracking-[0.15em] text-[#006d40] uppercase font-medium`}>What We Do</span>
              <h2 className={`${hanken.className} mt-3 text-[34px] font-bold leading-tight text-[#002627] md:text-[42px]`}>
                Africa&apos;s First Protected<br />B2B Recycling Marketplace
              </h2>
              <p className="mt-5 text-[15.5px] leading-relaxed text-slate-500">
                We connect KYC-verified African suppliers of secondary raw materials — rPET, PET Flakes, HMS scrap, Recovered Paper, and more — with global buyers who need a reliable, quality-guaranteed source.
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-slate-500">
                Every trade on Ameefar is backed by our three-pillar African Trade Protection Protocol: verified suppliers, international escrow, and independent pre-shipment inspections. If the material doesn't match the contract, the trade is halted and funds stay protected.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/product"
                  className={`${hanken.className} inline-flex items-center gap-2 rounded-xl bg-[#002627] px-6 py-3 text-[14px] font-bold !text-white transition hover:bg-[#014d2f]`}
                >
                  Browse Marketplace
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-5">
              {[
                { stat: "2,600+", label: "Active Listings" },
                { stat: "100%", label: "Escrow Protected" },
                { stat: "3", label: "Material Categories" },
                { stat: "∞", label: "Inspections Done" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#beebeb] hover:shadow-[0_8px_32px_rgba(0,109,64,0.08)]"
                >
                  <div className={`${hanken.className} text-[40px] font-extrabold text-[#002627] leading-none`}>{item.stat}</div>
                  <div className="mt-2 text-[13px] text-slate-500 font-medium">{item.label}</div>
                  <div className="mt-3 h-0.5 w-8 bg-[#beebeb] transition-all duration-300 group-hover:w-16 group-hover:bg-[#006d40]" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="bg-white px-6 py-24 md:px-12">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-2xl mx-auto text-center mb-16">
              <span className={`${jetbrains.className} text-[11px] tracking-[0.15em] text-[#006d40] uppercase font-medium`}>Our Journey</span>
              <h2 className={`${hanken.className} mt-3 text-[34px] font-bold leading-tight text-[#002627] md:text-[42px]`}>
                From Vision to Marketplace
              </h2>
            </div>
            <div className="relative">
              {/* vertical line */}
              <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-slate-100 md:block" />
              <div className="space-y-10">
                {milestones.map((m, i) => (
                  <div
                    key={m.year}
                    className={`relative grid md:grid-cols-2 gap-6 md:gap-16 items-center ${i % 2 === 0 ? "" : "md:[direction:rtl]"}`}
                  >
                    {/* year badge — centre on md */}
                    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-[#002627] shadow-lg">
                      <span className={`${jetbrains.className} text-[9px] font-bold text-[#80cbc4] tracking-widest`}>{m.year}</span>
                    </div>
                    <div className={`${i % 2 === 0 ? "md:text-right md:pr-8" : "md:text-left md:pl-8 md:[direction:ltr]"}`}>
                      <span className={`${jetbrains.className} text-[11px] tracking-widest text-[#006d40] uppercase font-medium md:hidden`}>{m.year}</span>
                      <h3 className={`${hanken.className} text-[20px] font-bold text-[#002627] mt-1 md:mt-0`}>{m.title}</h3>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-slate-500">{m.text}</p>
                    </div>
                    <div />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="bg-[#f8fffe] px-6 py-24 md:px-12">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <span className={`${jetbrains.className} text-[11px] tracking-[0.15em] text-[#006d40] uppercase font-medium`}>What We Stand For</span>
              <h2 className={`${hanken.className} mt-3 text-[34px] font-bold leading-tight text-[#002627] md:text-[42px]`}>Our Core Values</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <article
                  key={v.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#beebeb] hover:shadow-[0_8px_32px_rgba(0,109,64,0.08)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#006d40] to-[#00bfa5] shadow-[0_4px_16px_rgba(0,109,64,0.25)]">
                    {v.icon}
                  </div>
                  <h3 className={`${hanken.className} text-[18px] font-bold text-[#002627]`}>{v.title}</h3>
                  <div className="mt-2 h-px w-8 bg-[#beebeb]" />
                  <p className="mt-3 text-[13.5px] leading-relaxed text-slate-500">{v.text}</p>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#006d40] to-[#00bfa5] transition-all duration-500 group-hover:w-full" />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="bg-[#f0faf9] px-6 py-24 md:px-12 border-t border-slate-100">
          <div className="mx-auto max-w-[1440px]">
            <div className="max-w-2xl mx-auto text-center mb-14">
              <span className={`${jetbrains.className} text-[11px] tracking-[0.15em] text-[#006d40] uppercase font-medium`}>Leadership</span>
              <h2 className={`${hanken.className} mt-3 text-[34px] font-bold leading-tight text-[#002627] md:text-[42px]`}>Meet the Founder</h2>
            </div>
            <div className="flex justify-center">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="group max-w-sm w-full rounded-2xl border border-slate-100 bg-white p-8 shadow-sm text-center transition duration-300 hover:-translate-y-1 hover:border-[#beebeb] hover:shadow-[0_8px_40px_rgba(0,109,64,0.1)]"
                >
                  <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border-4 border-[#beebeb] shadow-[0_4px_20px_rgba(0,109,64,0.15)]">
                    <Image src={member.image} alt={member.name} height={112} width={112} className="h-full w-full object-cover" />
                  </div>
                  <a href={member.linkedin} target="_blank" rel="noreferrer" className="hover:underline">
                    <strong className={`${hanken.className} block text-[19px] font-bold text-[#002627]`}>{member.name}</strong>
                  </a>
                  <span className={`${jetbrains.className} mt-1.5 block text-[11px] text-[#006d40] uppercase tracking-widest font-medium`}>
                    {member.role}
                  </span>
                  <p className="mt-4 text-[13.5px] leading-relaxed text-slate-500">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#002627] px-6 py-20 md:px-12">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
            <div className="max-w-xl">
              <h2 className={`${hanken.className} text-[28px] font-bold text-white leading-tight md:text-[36px]`}>
                Ready to trade on Africa&apos;s most trusted marketplace?
              </h2>
              <p className="mt-3 text-[15px] text-slate-300/80 leading-relaxed">
                Join verified buyers and sellers already protected by the African Trade Protection Protocol.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <Link
                href="/product"
                className={`${hanken.className} inline-flex items-center gap-2 rounded-xl bg-[#beebeb] px-7 py-3.5 text-[14px] font-bold text-[#002627] transition hover:-translate-y-0.5 hover:bg-[#a3d6d6]`}
              >
                Browse Marketplace
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center rounded-xl border border-white/25 px-7 py-3.5 text-[14px] font-medium !text-white transition hover:bg-white/10"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
