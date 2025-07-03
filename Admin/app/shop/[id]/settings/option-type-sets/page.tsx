import { Metadata } from "next"
import { EntityManager } from "@/components/entity-manager"

export const metadata: Metadata = {
  title: "Option Type Sets",
  description: "Manage option type sets for product variations",
}

export default function OptionTypeSetsPage() {
  const fields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "code", label: "Code", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "active", label: "Active", type: "switch" as const },
  ]

  const templateFields = ["name", "code", "description", "active"]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <EntityManager
        title="Option Type Sets"
        description="Manage option type sets for product variations like size, color, etc."
        endpoint="option_type_sets"
        templateFields={templateFields}
        fields={fields}
      />
    </div>
  )
} 