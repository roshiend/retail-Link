import { Metadata } from "next"
import { EntityManager } from "@/components/entity-manager"

export const metadata: Metadata = {
  title: "Vendors",
  description: "Manage vendors and suppliers",
}

export default function VendorsPage() {
  const fields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "code", label: "Code", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "contact_email", label: "Contact Email", type: "text" as const },
    { name: "contact_phone", label: "Contact Phone", type: "text" as const },
    { name: "website", label: "Website", type: "text" as const },
    { name: "active", label: "Active", type: "switch" as const },
  ]

  const templateFields = ["name", "code", "description", "contact_email", "contact_phone", "website", "active"]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <EntityManager
        title="Vendors"
        description="Manage vendors and suppliers for your products"
        endpoint="vendors"
        templateFields={templateFields}
        fields={fields}
      />
    </div>
  )
} 