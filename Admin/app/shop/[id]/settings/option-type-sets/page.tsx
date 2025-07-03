import { Metadata } from "next"
import { EntityManager } from "@/components/entity-manager"

export const metadata: Metadata = {
  title: "Option Type Sets",
  description: "Manage product variation options",
}

export default function OptionTypeSetsPage() {
  const fields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "code", label: "Code", type: "text" as const, required: true },
    { name: "active", label: "Active", type: "switch" as const },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <EntityManager
        title="Option Type Sets"
        description="Configure product variation options like color, size, material, etc."
        endpoint="option_type_sets"
        fields={fields}
      />
    </div>
  )
} 