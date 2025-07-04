"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, Tag, Building2, MapPin, FolderOpen, Folder, Settings, ChevronDown, ChevronRight } from "lucide-react"
import { useParams } from "next/navigation"
import Link from "next/link"

export function SettingsTabs() {
  const params = useParams()
  const shopId = params.id as string
  const [isExpanded, setIsExpanded] = useState(true)

  const settingsCards = [
    {
      title: "Product Types",
      description: "Manage product categories and classifications",
      icon: Package,
      href: `/shop/${shopId}/settings/product-types`,
      color: "text-blue-600"
    },
    {
      title: "Option Type Sets",
      description: "Configure product variation options",
      icon: Settings,
      href: `/shop/${shopId}/settings/option-type-sets`,
      color: "text-purple-600"
    },
    {
      title: "Vendors",
      description: "Manage your product suppliers and vendors",
      icon: Building2,
      href: `/shop/${shopId}/settings/vendors`,
      color: "text-green-600"
    },
    {
      title: "Listing Types",
      description: "Configure different product listing types",
      icon: Tag,
      href: `/shop/${shopId}/settings/listing-types`,
      color: "text-orange-600"
    },
    {
      title: "Shop Locations",
      description: "Manage your store locations and addresses",
      icon: MapPin,
      href: `/shop/${shopId}/settings/shop-locations`,
      color: "text-red-600"
    },
    {
      title: "Categories",
      description: "Organize products with main categories and subcategories",
      icon: FolderOpen,
      href: `/shop/${shopId}/settings/categories`,
      color: "text-indigo-600"
    }
  ]

  return (
    <Tabs defaultValue="entities" className="space-y-4">
      <TabsList>
        <TabsTrigger 
          value="entities" 
          className="flex items-center gap-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          Entity Management
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="entities" className="space-y-4">
        {isExpanded && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {settingsCards.map((card) => (
              <Card key={card.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <Link href={card.href}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Manage {card.title}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
} 