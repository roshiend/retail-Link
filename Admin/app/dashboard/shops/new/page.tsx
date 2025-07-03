"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Store, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

export default function NewShopPage() {
  const router = useRouter()
  const [shopName, setShopName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await api.createShop(token, shopName)

      if (response.error) {
        setError(response.error)
        return
      }

      if (!response.data?.shop?.id) {
        setError("Failed to create shop")
        return
      }

      // Redirect to the new shop's dashboard
      router.push(`/shop/${response.data.shop.id}/dashboard`)
    } catch (err) {
      console.error('Error creating shop:', err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Create New Shop"
        text="Set up a new shop to start managing products and inventory."
      >
        <Button asChild variant="outline">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </DashboardHeader>
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Shop Details</CardTitle>
                <CardDescription>
                  Enter the name for your new shop
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="shop-name">Shop Name</Label>
                <Input
                  id="shop-name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="Enter your shop name"
                  required
                  className="h-10"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !shopName.trim()}
                  className="flex-1"
                >
                  {isLoading ? "Creating..." : "Create Shop"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
} 