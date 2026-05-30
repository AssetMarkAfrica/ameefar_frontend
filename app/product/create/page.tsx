import { CreateProductListingForm } from "../_components/CreateProductListingForm";
import { ProductShell } from "../_components/ProductShell";

export default function CreateProductListingPage() {
  return (
    <ProductShell active="create">
      <CreateProductListingForm />
    </ProductShell>
  );
}
