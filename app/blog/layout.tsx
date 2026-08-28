"use client";

import SiteHeader from "@/components/SiteHeader";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader solid />
      <main className="min-h-screen bg-surface-gray">
        {/* The top padding is handled by the page content, or we can add a bit of padding here. 
            The original had pt-16 but SiteHeader is absolute/fixed and doesn't take up space in flow, 
            so we add pt-20 to ensure content isn't hidden under the transparent header. */}
        <div className="pt-20">
          {children}
        </div>
      </main>
    </>
  );
}
