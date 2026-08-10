import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace | Buy & Sell Recycled Materials in Africa",
  description: "Explore the Ameefar Marketplace to securely buy and sell recycled materials in Africa. Enjoy 100% secure trading with international escrow, independent inspections, and verified suppliers.",
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
