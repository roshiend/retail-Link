"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Box, Home, Package, Settings, ShoppingCart, Tag, Users } from "lucide-react"

export function SidebarNav() {
  const pathname = usePathname()
  const params = useParams()
  const shopId = params.id as string

  const sidebarItems = [
    {
      title: "Home",
      href: `/shop/${shopId}/dashboard`,
      icon: Home,
    },
    {
      title: "Products",
      href: `/shop/${shopId}/products`,
      icon: Package,
    },
    {
      title: "Orders",
      href: `/shop/${shopId}/orders`,
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      href: `/shop/${shopId}/customers`,
      icon: Users,
    },
    {
      title: "Analytics",
      href: `/shop/${shopId}/analytics`,
      icon: BarChart3,
    },
    {
      title: "Discounts",
      href: `/shop/${shopId}/discounts`,
      icon: Tag,
    },
    {
      title: "Apps",
      href: `/shop/${shopId}/apps`,
      icon: Box,
    },
    {
      title: "Settings",
      href: `/shop/${shopId}/settings`,
      icon: Settings,
    },
  ]

  return (
    <nav className="grid gap-1">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:text-primary",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
