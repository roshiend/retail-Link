"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface Product {
  id: number
  title: string
  price: number | string | null
}

export function ProductsOverview() {
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [productCount, setProductCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3000/api/v1/products")

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()

        if (data && data.products && Array.isArray(data.products)) {
          // Get the total count
          setProductCount(data.products.length)

          // Get the 6 most recent products (or fewer if there aren't 6)
          setRecentProducts(data.products.slice(0, 6))
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Add this function inside the ProductsOverview component, after the useEffect hook
  // This will allow us to refresh the products list when needed
  const refreshProducts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/products")

      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()

      if (data && data.products && Array.isArray(data.products)) {
        setProductCount(data.products.length)
        setRecentProducts(data.products.slice(0, 6))
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Format price safely
  const formatPrice = (price: number | string | null | undefined) => {
    // Convert to number if it's a string or handle null/undefined
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price || 0

    // Check if it's a valid number
    if (isNaN(numPrice)) return "0.00"

    // Format with 2 decimal places
    return numPrice.toFixed(2)
  }

  // Export the refreshProducts function so it can be used by other components
  useEffect(() => {
    refreshProducts()
  }, [])

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Recent Products</CardTitle>
          <CardDescription>You have {productCount} products in your catalog.</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                <div key={product.id} className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="h-12 w-12 rounded-md bg-gray-200" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{product.title}</p>
                    <p className="text-sm text-muted-foreground">${formatPrice(product.price)}</p>
                  </div>
                </div>
              ))
            ) : (
              // Show empty state
              <div className="col-span-3 text-center py-6">
                <p className="text-muted-foreground">No products found. Add your first product to get started.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
