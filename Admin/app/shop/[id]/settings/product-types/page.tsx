import { Metadata } from "next"
import { EntityManager } from "@/components/entity-manager"

export const metadata: Metadata = {
  title: "Product Types",
  description: "Manage product types and classifications",
}

export default function ProductTypesPage() {
  const fields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "code", label: "Code", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "active", label: "Active", type: "switch" as const },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <EntityManager
        title="Product Types"
        description="Manage product categories and classifications for your shop"
        endpoint="product_types"
        fields={fields}
      />
    </div>
  )
} 