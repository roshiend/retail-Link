"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"

interface Product {
  id: number
  name: string
  price: number | string
  image_url?: string
  active: boolean
}

interface ProductsOverviewProps {
  shopId: number
}

export function ProductsOverview({ shopId }: ProductsOverviewProps) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [productCount, setProductCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getProducts(shopId)

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data && Array.isArray(response.data.products)) {
          // Get the total count
          setProductCount(response.data.products.length)

          // Get the 6 most recent products (or fewer if there aren't 6)
          setRecentProducts(response.data.products.slice(0, 6))
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [shopId])

  // Format price safely
  const formatPrice = (price: number | string | null | undefined) => {
    // Convert to number if it's a string or handle null/undefined
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price || 0

    // Check if it's a valid number
    if (isNaN(numPrice)) return "0.00"

    // Format with 2 decimal places
    return numPrice.toFixed(2)
  }

  return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              // Show loading placeholders
              Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
                    <div className="h-12 w-12 rounded-md bg-gray-200 animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))
            ) : recentProducts.length > 0 ? (
              // Show actual products
              recentProducts.map((product) => (
            <Link 
              key={product.id} 
              href={`/shop/${shopId}/products/${product.id}`}
              className="flex items-center space-x-4 rounded-md border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="relative h-12 w-12 rounded-md bg-gray-200 overflow-hidden">
                {product.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                  </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{product.name}</p>
                  {!product.active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">${formatPrice(product.price)}</p>
              </div>
            </Link>
              ))
            ) : (
              // Show empty state
              <div className="col-span-3 text-center py-6">
                <p className="text-muted-foreground">No products found. Add your first product to get started.</p>
              </div>
            )}
          </div>
        </div>
  )
}
