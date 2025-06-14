import type React from "react"
import { AuthLayoutContent } from "./components/auth-layout-content"
// Removed: import { Footer } from "./components/footer"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow flex flex-col lg:grid lg:grid-cols-2">
        <AuthLayoutContent />
        <div className="w-full flex flex-col items-center justify-center px-6 pb-6 pt-28 sm:px-12 sm:pb-12 lg:pt-24 bg-gray-50">
          {children}
        </div>
      </main>
      {/* Removed: <Footer /> */}
    </div>
  )
}
