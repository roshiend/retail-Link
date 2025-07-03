"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Store, Users } from "lucide-react"
import Link from "next/link"

interface Shop {
  id: number
  name: string
  role: string
}

interface User {
  id: number
  email: string
  full_name: string
  shops: Shop[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

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

        setUser(response.data.user)

        // If user has only one shop, redirect to that shop's dashboard
        if (response.data.user.shops.length === 1) {
          router.push(`/shop/${response.data.user.shops[0].id}/dashboard`)
          return
        }
      } catch (err) {
        console.error('Error checking auth:', err)
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we load your data.</p>
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
              onClick={() => router.push('/auth/login')}
              className="mt-4"
            >
              Return to Login
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!user) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
            <p className="text-muted-foreground">User information could not be loaded.</p>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="mt-4"
            >
              Return to Login
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={`Welcome back, ${user.full_name}`}
        text="Manage your shops and products."
      >
        <Button
          onClick={() => router.push('/dashboard/shops/new')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Shop
        </Button>
      </DashboardHeader>
      
      <div className="grid gap-6">
        {user.shops.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {user.shops.map((shop) => (
              <Card key={shop.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Store className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-lg">{shop.name}</CardTitle>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {shop.role}
                    </span>
                  </div>
                  <CardDescription>
                    Click to manage this shop
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/shop/${shop.id}/dashboard`}>
                      Open Dashboard
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No shops yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first shop to start managing products and inventory.
              </p>
              <Button
                onClick={() => router.push('/dashboard/shops/new')}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Create Your First Shop
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardShell>
  )
} 