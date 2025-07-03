"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  PlusCircle, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Eye,
  ShoppingCart,
  Users,
  Activity,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { ProductsOverview } from "@/components/products-overview"

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

interface Product {
  id: number
  name: string
  price: number | string
  sku: string
  stock_quantity: number
  active: boolean
}

interface SalesData {
  today: number
  yesterday: number
  thisWeek: number
  lastWeek: number
  change: number
}

interface ApiResponse<T> {
  data?: T
  error?: string
}

export default function ShopDashboardPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [salesData, setSalesData] = useState<SalesData>({
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    lastWeek: 0,
    change: 0
  })
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

        // Fetch products for metrics
        const productsResponse = await api.getProducts(shopId)
        if (productsResponse.data?.products) {
          setProducts(productsResponse.data.products)
        }

        // Mock sales data (replace with actual API call when backend is ready)
        setSalesData({
          today: 1250.50,
          yesterday: 980.25,
          thisWeek: 8750.75,
          lastWeek: 7200.00,
          change: 21.5
        })
      } catch (err) {
        console.error('Error checking auth:', err)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, shopId])

  // Calculate dashboard metrics
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.active).length
  const totalValue = products.reduce((sum, p) => {
    const price = typeof p.price === 'string' ? parseFloat(p.price) : p.price
    return sum + (price * p.stock_quantity)
  }, 0)
  const lowStockProducts = products.filter(p => p.stock_quantity < 10 && p.stock_quantity > 0).length
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your shop data.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
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
    )
  }

  if (!shop) {
    return (
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
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        heading={shop.name}
        text="Welcome to your store dashboard. Here's what's happening with your business."
      />
      
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesData.today.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {salesData.change > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
              )}
              {Math.abs(salesData.change)}% from yesterday
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesData.thisWeek.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              vs ${salesData.lastWeek.toFixed(2)} last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total stock value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products running low
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yesterday's Sales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesData.yesterday.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Previous day total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.change > 0 ? '+' : ''}{salesData.change}%</div>
            <p className="text-xs text-muted-foreground">
              vs last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/shop/${shop.id}/products/new`)}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Add Product</p>
                <p className="text-sm text-muted-foreground">Create a new product</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/shop/${shop.id}/products`)}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">View Products</p>
                <p className="text-sm text-muted-foreground">Manage inventory</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Orders</p>
                <p className="text-sm text-muted-foreground">View recent orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Customers</p>
                <p className="text-sm text-muted-foreground">Manage customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Your latest products and their status</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push(`/shop/${shop.id}/products`)}>
                View All Products
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ProductsOverview shopId={shop.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 