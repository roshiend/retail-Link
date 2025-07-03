"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { ProductsTable } from "@/components/products-table"
import { ProductsOverview } from "@/components/products-overview"
import { Card } from "@/components/ui/card"

interface Shop {
  id: number
  name: string
  role?: string
}

interface User {
  id: number
  email: string
  full_name: string
  shops: Shop[]
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

export default function ShopDashboardPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [shop, setShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const shopId = parseInt(params.id)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.getCurrentUser()
        if (response.error) {
          console.error('Auth error:', response.error)
          router.push('/auth/login')
          return
        }

        if (!response.data?.user) {
          console.error('No user data in response')
          router.push('/auth/login')
          return
        }

        const userShop = response.data.user.shops.find(s => s.id === shopId)
        if (!userShop) {
          console.error('Shop not found for user')
          router.push('/dashboard')
          return
        }

        setShop(userShop)
      } catch (err) {
        console.error('Error checking auth:', err)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, shopId])

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we load your shop data.</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="mt-4"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!shop) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Shop Not Found</h2>
            <p className="text-muted-foreground">The requested shop could not be found.</p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="mt-4"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={shop.name}
        text="Manage your products and inventory."
      >
        <Button
          onClick={() => router.push(`/shop/${shop.id}/products/new`)}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Product
        </Button>
      </DashboardHeader>
      <div className="grid gap-8">
        <Card className="p-6">
          <ProductsOverview shopId={shop.id} />
        </Card>
        <Card className="p-6">
          <ProductsTable shopId={shop.id} />
        </Card>
      </div>
    </DashboardShell>
  )
} 