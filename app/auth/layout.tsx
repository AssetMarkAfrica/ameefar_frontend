import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ameefar Energy | Auth",
  description: "Secure account access for the Ameefar Energy marketplace.",
};

import GuestGuard from "./_components/GuestGuard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      {children}
    </GuestGuard>
  );
}
