import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProductForm } from "@/components/product-form"

export default function NewProductPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Add Product" text="Create a new product with variants, images, and pricing." />
      <div className="grid gap-10">
        <ProductForm />
      </div>
    </DashboardShell>
  )
}
