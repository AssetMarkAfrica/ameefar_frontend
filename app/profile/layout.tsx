import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Verification | Ameefar Energy",
  description: "Complete company verification for the Ameefar marketplace.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
