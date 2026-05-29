import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ameefar Energy | Auth",
  description: "Secure account access for the Ameefar Energy marketplace.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
