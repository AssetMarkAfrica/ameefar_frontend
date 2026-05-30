import { ProductBrowse } from "./_components/ProductBrowse";
import { ProductShell } from "./_components/ProductShell";

export default function ProductPage() {
  return (
    <ProductShell active="marketplace">
      <ProductBrowse />
    </ProductShell>
  );
}
