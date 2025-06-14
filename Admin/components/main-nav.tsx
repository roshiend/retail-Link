"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ShoppingBag } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <ShoppingBag className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">ShopManager</span>
      </Link>
      <nav className="flex gap-6">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/products"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard/products" || pathname.startsWith("/dashboard/products/")
              ? "text-foreground"
              : "text-muted-foreground",
          )}
        >
          Products
        </Link>
        <Link
          href="/dashboard/orders"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard/orders" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Orders
        </Link>
        <Link
          href="/dashboard/customers"
          className={cn(
            "flex items-center text-sm font-medium transition-colors hover:text-primary",
            pathname === "/dashboard/customers" ? "text-foreground" : "text-muted-foreground",
          )}
        >
          Customers
        </Link>
      </nav>
    </div>
  )
}
