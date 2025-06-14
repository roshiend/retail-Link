"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProductsTable } from "@/components/products-table"
import { api } from "@/lib/api"

interface Shop {
  id: number
  name: string
  domain: string
}

interface User {
  id: number
  email: string
  shops: Shop[]
}

interface ApiResponse {
  data: {
    user: User
  }
}

export default function ShopDashboardPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [shop, setShop] = useState<Shop | null>(null)
  const [loading, setLoading] = useState(true)
  const shopId = parseInt(params.id)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.getCurrentUser()
        const userData = (response as ApiResponse).data.user
        const userShop = userData.shops.find((s) => s.id === shopId)

        if (!userShop) {
          router.push("/dashboard")
          return
        }

        setShop(userShop)
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, shopId])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!shop) {
    return null
  }

  return (
    <DashboardShell shopId={shopId}>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <DashboardHeader
          heading="Products"
          text="Create and manage your products."
        >
          <Button onClick={() => router.push(`/shop/${shopId}/products/new`)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </DashboardHeader>
        <ProductsTable shopId={shopId} />
      </div>
    </DashboardShell>
  )
} 