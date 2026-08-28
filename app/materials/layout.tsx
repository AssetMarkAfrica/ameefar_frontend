"use client";

import SiteHeader from "@/components/SiteHeader";

export default function MaterialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}
