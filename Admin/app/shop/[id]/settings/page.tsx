import { Metadata } from "next"
import { SettingsTabs } from "@/components/settings-tabs"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your shop settings and configurations",
}

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      <SettingsTabs />
    </div>
  )
} 