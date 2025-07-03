"use client"

import { useParams, useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/products-table"

export default function ProductsPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = parseInt(params.id as string)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push(`/shop/${shopId}/products/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        <ProductsTable shopId={shopId} />
      </div>
    </div>
  )
} 