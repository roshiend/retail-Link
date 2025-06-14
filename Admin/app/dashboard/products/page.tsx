import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { ProductsTable } from "@/components/products-table"

export default function ProductsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Products" text="Manage your product catalog." />
      <ProductsTable />
    </DashboardShell>
  )
}
