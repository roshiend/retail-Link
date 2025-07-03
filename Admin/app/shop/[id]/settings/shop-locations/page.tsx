import { Metadata } from "next"
import { EntityManager } from "@/components/entity-manager"

export const metadata: Metadata = {
  title: "Shop Locations",
  description: "Manage shop locations and addresses",
}

export default function ShopLocationsPage() {
  const fields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "code", label: "Code", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "address", label: "Address", type: "text" as const },
    { name: "city", label: "City", type: "text" as const },
    { name: "state", label: "State", type: "text" as const },
    { name: "postal_code", label: "Postal Code", type: "text" as const },
    { name: "country", label: "Country", type: "text" as const },
    { name: "phone", label: "Phone", type: "text" as const },
    { name: "email", label: "Email", type: "text" as const },
    { name: "active", label: "Active", type: "switch" as const },
    { name: "primary", label: "Primary Location", type: "switch" as const },
  ]

  const templateFields = ["name", "code", "description", "address", "city", "state", "postal_code", "country", "phone", "email", "active", "primary"]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <EntityManager
        title="Shop Locations"
        description="Manage shop locations and addresses"
        endpoint="shop_locations"
        templateFields={templateFields}
        fields={fields}
      />
    </div>
  )
} 