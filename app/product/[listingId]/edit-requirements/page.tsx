import type { Metadata } from "next";
import { ProductShell } from "../../_components/ProductShell";
import { EditQualityParameters } from "../../_components/EditQualityParameters";

export const metadata: Metadata = {
  title: "Manage Inspection Requirements | Ameefar Marketplace",
  description:
    "Update the quality parameters and inspection thresholds for your product listing on Ameefar.",
};

export default async function EditRequirementsPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;

  return (
    <ProductShell active="marketplace">
      <EditQualityParameters listingId={listingId} />
    </ProductShell>
  );
}
