"use client";

import Link from "next/link";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import Image from "next/image";
import { useEffect, useState } from "react";

const hanken = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function FeedbackPage() {
  const [scrolled, setScrolled] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col`}>
      {/* ── NAV ── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-slate-200 bg-white shadow-sm" : "border-b border-transparent bg-slate-50"
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
        <div className="mx-auto max-w-2xl bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-[#00bfa5]/10 blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#006d40]/10 blur-[60px] pointer-events-none" />

          <div className="relative z-10 text-center mb-10 border-b border-slate-100 pb-8">
            <span className={`${jetbrains.className} inline-block rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-[11px] tracking-[0.18em] text-[#006d40] uppercase font-medium mb-4`}>
              We Value Your Voice
            </span>
            <h1 className={`${hanken.className} text-[36px] font-bold text-[#002627] md:text-[42px] leading-tight mb-4`}>
              Customer Feedback
            </h1>
            <p className="text-[15px] text-slate-500 max-w-lg mx-auto leading-relaxed">
              Help us improve your experience on Ameefar. Whether it's a suggestion, a compliment, or a concern, we want to hear from you.
            </p>
          </div>

          <div className="relative z-10">
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className={`${hanken.className} text-[24px] font-bold text-[#002627] mb-2`}>
                  Thank You!
                </h3>
                <p className="text-[15px] text-slate-600">
                  Your feedback has been successfully submitted. We appreciate you taking the time to help us improve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className={`${jetbrains.className} text-[11px] font-medium tracking-wide text-slate-500 uppercase`}>Name (Optional)</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`${jetbrains.className} text-[11px] font-medium tracking-wide text-slate-500 uppercase`}>Email (Optional)</label>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50"
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`${jetbrains.className} text-[11px] font-medium tracking-wide text-slate-500 uppercase`}>Feedback Type</label>
                  <select
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50 appearance-none"
                  >
                    <option value="" disabled selected>Select a category</option>
                    <option value="suggestion">Suggestion / Idea</option>
                    <option value="compliment">Compliment</option>
                    <option value="issue">Issue / Bug Report</option>
                    <option value="trade">Trading Experience</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`${jetbrains.className} text-[11px] font-medium tracking-wide text-slate-500 uppercase`}>How would you rate your experience?</label>
                  <div className="flex justify-between max-w-xs pt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <label key={rating} className="cursor-pointer group flex flex-col items-center gap-1">
                        <input type="radio" name="rating" value={rating} className="sr-only peer" required />
                        <div className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 transition-all peer-checked:bg-[#00bfa5] peer-checked:border-[#00bfa5] peer-checked:text-white peer-hover:border-[#00bfa5]">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span className="text-[10px] text-slate-400 peer-checked:text-[#002627] font-semibold">{rating}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`${jetbrains.className} text-[11px] font-medium tracking-wide text-slate-500 uppercase`}>Your Feedback</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[14px] text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#00bfa5] focus:bg-white focus:ring-1 focus:ring-[#00bfa5]/50 resize-none"
                    placeholder="Tell us what you think..."
                  />
                </div>

                <button
                  type="submit"
                  className={`${hanken.className} w-full rounded-xl bg-gradient-to-r from-[#00bfa5] to-[#006d40] px-8 py-4 text-[16px] font-bold text-white shadow-[0_4px_14px_rgba(0,191,165,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,191,165,0.3)]`}
                >
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
