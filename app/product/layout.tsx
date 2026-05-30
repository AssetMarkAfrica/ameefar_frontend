import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | Ameefar Energy",
  description: "Browse, create, and manage Ameefar material listings.",
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
