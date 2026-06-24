"use client";
import { useState } from "react";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const products = [
  { label: "rPET Resins" },
  { label: "PET Flakes" },
  { label: "UBC" },
  { label: "PET Bottles" },
  { label: "PET Chips & Flakes" },
  { label: "UBC Bales" },
];

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  }

  return (
    <footer className={`${inter.className} bg-[#014d2f] text-white`}>
      {/* ── MAIN GRID ── */}
      <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-12">
        <div className="grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-16">

          {/* ── COL 1: Contact Info ── */}
          <div className="border-r-0 md:border-r md:border-white/15 md:pr-8 lg:pr-16">
            <h3 className={`${hanken.className} text-[20px] font-bold text-white mb-6`}>
              Contact Info.
            </h3>
            <ul className="space-y-5">
              {/* Address */}
              <li className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </span>
                <span className="text-[13.5px] leading-relaxed text-white/75">
                  No. 9 Ecuador Street, Agbogba Assemblies.<br />
                  GE.164.1559 Accra Ghana
                </span>
              </li>
              {/* WhatsApp / SMS */}
              <li className="flex items-center gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </span>
                <span className="text-[13.5px] text-white/75">233244062988 / 233268808886</span>
              </li>
              {/* Phone */}
              <li className="flex items-center gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01l-2.2 2.2z" />
                  </svg>
                </span>
                <a href="tel:+233302528832" className="text-[13.5px] text-white/75 hover:text-white transition-colors">
                  (+233) 302528832
                </a>
              </li>
              {/* Email */}
              <li className="flex items-center gap-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                <a href="mailto:pascal@ameefarenergy.com" className="text-[13.5px] text-white/75 hover:text-white transition-colors">
                  pascal@ameefarenergy.com
                </a>
              </li>
            </ul>
          </div>

          {/* ── COL 2: Our Products ── */}
          <div className="border-r-0 md:border-r md:border-white/15 md:pr-8 lg:pr-16">
            <h3 className={`${hanken.className} text-[20px] font-bold text-white mb-6`}>
              Our Products
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-4">
              {products.map((p) => (
                <li key={p.label} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#4caf50]/60">
                    <svg className="h-2.5 w-2.5 text-[#4caf50]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="text-[13px] text-white/75">{p.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── COL 3: Newsletter ── */}
          <div>
            <h3 className={`${hanken.className} text-[20px] font-bold text-white mb-3`}>
              Subscribe Newsletter.
            </h3>
            <p className="text-[13px] leading-relaxed text-[#a5d6a7] mb-6">
              Subscribe to our newsletter to get regular updates on our products
            </p>

            {subscribed ? (
              <div className="rounded-xl bg-white/10 border border-white/20 px-5 py-4 text-[13.5px] text-[#a5d6a7] font-medium">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  className={`${inter.className} w-full rounded-xl bg-white px-5 py-3.5 text-[13.5px] text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#4caf50]/60`}
                />
                <button
                  type="submit"
                  className={`${hanken.className} flex items-center gap-2 text-[13.5px] font-bold text-white hover:text-[#a5d6a7] transition-colors`}
                >
                  Subscribe Now
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </form>
            )}

            <p className={`${jetbrains.className} mt-6 text-[11px] tracking-wide text-[#4caf50] font-medium`}>
              Get updates On Waste Recycle Innovations
            </p>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="bg-[#003820]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center px-6 py-4 text-[12.5px] text-white/60 md:px-12">
          <span>
            ©2024 Ameefar Energy Africa Ltd.{" "}
            <span className="text-[#4caf50] font-semibold">All</span> Rights Reserved
          </span>
        </div>
      </div>
    </footer>
  );
}
