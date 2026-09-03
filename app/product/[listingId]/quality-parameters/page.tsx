import type { Metadata } from "next";
import { ProductShell } from "../../_components/ProductShell";
import { AddQualityParametersStep, QualityParameterUnitDatalist } from "../../_components/AddQualityParametersStep";

export const metadata: Metadata = {
  title: "Inspection Requirements | Ameefar Marketplace",
  description:
    "Define the quality parameters and upload images to activate your product listing on Ameefar.",
};

export default async function QualityParametersPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;

  return (
    <ProductShell active="marketplace">
      <AddQualityParametersStep listingId={listingId} />
      <QualityParameterUnitDatalist />
    </ProductShell>
  );
}
