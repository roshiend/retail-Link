import { Metadata } from "next"
import { EntityManager } from "@/components/entity-manager"

export const metadata: Metadata = {
  title: "Listing Types",
  description: "Configure different product listing types",
}

export default function ListingTypesPage() {
  const fields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "code", label: "Code", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "active", label: "Active", type: "switch" as const },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <EntityManager
        title="Listing Types"
        description="Configure different product listing types like physical, digital, service, etc."
        endpoint="listing_types"
        fields={fields}
      />
    </div>
  )
} 