"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Download, Filter, MoreHorizontal, Plus, Search, Trash2, Loader2, ArrowUpDown, Edit } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

// Define types for the product data
interface ProductVariant {
  id: number
  sku: string
  price: number
  quantity: number
  option1?: string
  option2?: string
  option3?: string
}

interface OptionType {
  id: number
  name: string
  values: string[]
}

interface Product {
  id: number
  name: string
  price: number | string
  sku: string
  description?: string
  stock_quantity: number
  image_url?: string
  active: boolean
}

interface ProductsTableProps {
  shopId: number
}

export function ProductsTable({ shopId }: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [sortField, setSortField] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const { toast } = useToast()
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await api.getProducts(shopId)

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.data && Array.isArray(response.data.products)) {
          setProducts(response.data.products)
        } else {
          console.error("Unexpected API response format:", response.data)
          setProducts([])
          setError("Received unexpected data format from the API")
        }
      } catch (err) {
        console.error("Error fetching products:", err)
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [shopId])

  // Filter products based on search query and filters
  const filteredProducts = products.filter((product) => {
    // Filter by search query
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by status if a status filter is applied
    const matchesStatus = statusFilter ? product.active === (statusFilter === 'active') : true

    return matchesSearch && matchesStatus
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue, bValue

    switch (sortField) {
      case "name":
        aValue = a.name
        bValue = b.name
        break
      case "status":
        aValue = a.active
        bValue = b.active
        break
      case "inventory":
        aValue = getInventory(a)
        bValue = getInventory(b)
        break
      case "sku":
        aValue = a.sku
        bValue = b.sku
        break
      case "price":
        aValue = typeof a.price === "string" ? Number.parseFloat(a.price) : a.price || 0
        bValue = typeof b.price === "string" ? Number.parseFloat(b.price) : b.price || 0
        break
      default:
        aValue = a.name
        bValue = b.name
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status === statusFilter ? null : status)
  }

  // Get inventory for a product (stock quantity)
  const getInventory = (product: Product) => {
    return product.stock_quantity || 0
  }

  // Calculate inventory display
  const calculateInventory = (product: Product) => {
    const quantity = product.stock_quantity || 0
    if (quantity === 0) return "Out of stock"
    if (quantity < 10) return `${quantity} (Low)`
    return quantity.toString()
  }

  // Get variant count (for now, return 1 as we don't have variants yet)
  const getVariantCount = (product: Product) => {
    return 1
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

  const deleteProduct = async (product: Product) => {
    setIsDeleting(true)
    try {
      const response = await api.deleteProduct(shopId, product.id)

      if (response.error) {
        throw new Error(response.error)
      }

      // Remove the product from the local state
      setProducts(products.filter((p) => p.id !== product.id))

      toast({
        title: "Product deleted",
        description: `"${product.name}" has been deleted successfully.`,
      })
    } catch (err) {
      console.error("Error deleting product:", err)
      toast({
        variant: "destructive",
        title: "Failed to delete product",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      })
    } finally {
      setIsDeleting(false)
      setProductToDelete(null)
    }
  }

  // Handle checkbox selection
  const toggleSelectProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === sortedProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(sortedProducts.map((p) => p.id))
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return

    setIsDeleting(true)
    try {
      const response = await api.bulkDeleteProducts(shopId, selectedProducts)

      if (response.error) {
        throw new Error(response.error)
      }

      // Remove the deleted products from the local state
      setProducts(products.filter((p) => !selectedProducts.includes(p.id)))
      setSelectedProducts([])

      toast({
        title: "Products deleted",
        description: `${selectedProducts.length} products have been deleted successfully.`,
      })
    } catch (err) {
      console.error("Error deleting products:", err)
    toast({
        variant: "destructive",
        title: "Failed to delete products",
        description: err instanceof Error ? err.message : "An unknown error occurred",
    })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
          <span className="text-sm font-medium">{selectedProducts.length} selected</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading products...</span>
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter
              ? "Try adjusting your search or filters"
              : "Add your first product to get started"}
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all products"
                  />
                </TableHead>
                <TableHead className="w-12"></TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                  <div className="flex items-center">
                    Product
                    {sortField === "name" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                  <div className="flex items-center">
                    Status
                    {sortField === "status" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("inventory")}>
                  <div className="flex items-center">
                    Inventory
                    {sortField === "inventory" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("sku")}>
                  <div className="flex items-center">
                    SKU
                    {sortField === "sku" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                  <div className="flex items-center">
                    Price
                    {sortField === "price" && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>Variants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow key={product.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleSelectProduct(product.id)}
                        aria-label={`Select ${product.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt={product.name}
                        className="h-10 w-10 object-cover rounded-md"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant={product.active ? "default" : "secondary"}>
                      {product.active ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>{calculateInventory(product)}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>${formatPrice(product.price)}</TableCell>
                  <TableCell>{getVariantCount(product)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/shop/${shopId}/products/${product.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => setProductToDelete(product)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product "{productToDelete?.name}" and
              remove it from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => productToDelete && deleteProduct(productToDelete)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
