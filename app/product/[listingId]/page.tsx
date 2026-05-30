import { ProductListingDetail } from "../_components/ProductListingDetail";
import { ProductShell } from "../_components/ProductShell";

export default async function ProductListingDetailPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;

  return (
    <ProductShell active="marketplace">
      <ProductListingDetail listingId={listingId} />
    </ProductShell>
  );
}
