import type { Metadata } from "next";

import { EditProductListingForm } from "../../_components/EditProductListingForm";
import { ProductShell } from "../../_components/ProductShell";

export const metadata: Metadata = {
  title: "Edit Listing | Ameefar Energy",
  description: "Edit and manage your Ameefar material listing.",
};

export default async function EditProductListingPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;

  return (
    <ProductShell active="marketplace">
      <EditProductListingForm listingId={listingId} />
    </ProductShell>
  );
}
