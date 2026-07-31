import { Suspense } from "react";
import { ProductBrowse } from "./_components/ProductBrowse";
import { ProductShell } from "./_components/ProductShell";

export default function ProductPage() {
  return (
    <ProductShell active="marketplace">
      <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading marketplace...</div>}>
        <ProductBrowse />
      </Suspense>
    </ProductShell>
  );
}
