"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VariantsManager } from "@/components/variants-manager"
import { ImageUploader } from "@/components/image-uploader"
import { AlertCircle, Loader2, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { RichTextEditor } from "@/components/rich-text-editor"
import { API_BASE_URL } from "@/lib/api"

// Define types for the dropdown data
interface DropdownItem {
  id: number
  name?: string
  value?: string
  code: string
}

interface Category extends DropdownItem {
  product_type_id: number
}

interface SubCategory extends DropdownItem {
  category_id: number
}

// Define the form schema
const productFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  compareAtPrice: z.coerce.number().min(0).optional(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  weight: z.coerce.number().min(0).optional(),
  weight_unit: z.string().optional(),
  inventory: z.coerce.number().int().min(0).optional(),
  status: z.string().default("draft"),
  vendor_id: z.coerce.number().optional(),
  product_type_id: z.coerce.number().optional(),
  shop_location_id: z.coerce.number().optional(),
  category_id: z.coerce.number().optional(),
  sub_category_id: z.coerce.number().optional(),
  listing_type_id: z.coerce.number().optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

// Save button component for reuse
function SaveButton({ isSubmitting, isEditing }: { isSubmitting: boolean; isEditing: boolean }) {
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditing ? "Updating..." : "Saving..."}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {isEditing ? "Update Product" : "Save Product"}
        </>
      )}
    </Button>
  )
}

// Define the props for the ProductForm component
interface ProductFormProps {
  initialData?: any
  shopId?: string | number
}

export function ProductForm({ initialData, shopId }: ProductFormProps = {}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Determine if we're editing an existing product
  const isEditing = initialData && initialData.id

  // Initialize the form with default values or initial data
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: isEditing
      ? {
          title: initialData.title || initialData.name || "",
          description: initialData.description || "",
          price: Number.parseFloat(initialData.price) || 0,
          compareAtPrice: initialData.compare_at_price ? Number.parseFloat(initialData.compare_at_price) : undefined,
          sku: initialData.sku || "",
          barcode: initialData.barcode || "",
          weight: initialData.weight,
          weight_unit: initialData.weight_unit || "kg",
          inventory: initialData.inventory || initialData.stock_quantity || 0,
          status: initialData.status || (initialData.active ? "active" : "draft"),
          vendor_id: initialData.vendor_id,
          product_type_id: initialData.product_type_id,
          shop_location_id: initialData.shop_location_id,
          category_id: initialData.category_id,
          sub_category_id: initialData.sub_category_id || initialData.subcategory_id,
          listing_type_id: initialData.listing_type_id,
        }
      : {
          title: "",
          description: "",
          price: 0,
          compareAtPrice: undefined,
          sku: "",
          barcode: "",
          weight: undefined,
          weight_unit: "kg",
          inventory: undefined,
          status: "draft",
          vendor_id: undefined,
          product_type_id: undefined,
          shop_location_id: undefined,
          category_id: undefined,
          sub_category_id: undefined,
          listing_type_id: undefined,
        },
  })

  // Log the initialData to see what we're working with
  useEffect(() => {
    if (isEditing) {
      console.log("Initializing form with data:", initialData)
      console.log("Form default values:", form.getValues())
    }
  }, [initialData, isEditing, form])

  // Reset form when initialData changes
  useEffect(() => {
    if (isEditing && initialData) {
      console.log("Resetting form with new data")
      form.reset({
        title: initialData.title || initialData.name || "",
        description: initialData.description || "",
        price: Number.parseFloat(initialData.price) || 0,
        compareAtPrice: initialData.compare_at_price ? Number.parseFloat(initialData.compare_at_price) : undefined,
        sku: initialData.sku || "",
        barcode: initialData.barcode || "",
        weight: initialData.weight,
        weight_unit: initialData.weight_unit || "kg",
        inventory: initialData.inventory || initialData.stock_quantity || 0,
        status: initialData.status || (initialData.active ? "active" : "draft"),
        vendor_id: initialData.vendor_id,
        product_type_id: initialData.product_type_id,
        shop_location_id: initialData.shop_location_id,
        category_id: initialData.category_id,
        sub_category_id: initialData.sub_category_id || initialData.subcategory_id,
        listing_type_id: initialData.listing_type_id,
      })
    }
  }, [initialData, isEditing, form])

  // Extract option types and variants from initialData if available
  const initialOptions =
    isEditing && initialData.option_types
      ? initialData.option_types.map((ot: any) => ({
          type: ot.name,
          values: ot.values || [],
        }))
      : []

  const initialVariants =
    isEditing && initialData.variants
      ? initialData.variants.map((v: any) => ({
          id: v.id,
          title: [v.option1, v.option2, v.option3].filter(Boolean).join(" / "),
          price: v.price,
          sku: v.sku,
          inventory: v.quantity,
          options: [
            v.option1 && { name: initialData.option_types[0]?.name, value: v.option1 },
            v.option2 && { name: initialData.option_types[1]?.name, value: v.option2 },
            v.option3 && { name: initialData.option_types[2]?.name, value: v.option3 },
          ].filter(Boolean),
        }))
      : []

  const [options, setOptions] = useState<any[]>(initialOptions)
  const [variants, setVariants] = useState<any[]>(initialVariants)

  // State for dropdown data
  const [vendors, setVendors] = useState<DropdownItem[]>([])
  const [productTypes, setProductTypes] = useState<DropdownItem[]>([])
  const [shopLocations, setShopLocations] = useState<DropdownItem[]>([])
  const [listingTypes, setListingTypes] = useState<DropdownItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true)
  const [dropdownError, setDropdownError] = useState<string | null>(null)

  // Watch for category changes to update subcategories
  const selectedCategoryId = form.watch("category_id")

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsLoadingDropdowns(true)
      setDropdownError(null)

      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        // Fetch all dropdown data in parallel (shop-scoped)
        const [vendorsResponse, productTypesResponse, shopLocationsResponse, listingTypesResponse, categoriesResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/vendors`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            }),
            fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/product_types`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            }),
            fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/shop_locations`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            }),
            fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/listing_types`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            }),
            fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            }),
          ])

        // Check if any response is 401 (unauthorized)
        if (vendorsResponse.status === 401 || productTypesResponse.status === 401 || 
            shopLocationsResponse.status === 401 || listingTypesResponse.status === 401 || 
            categoriesResponse.status === 401) {
          localStorage.removeItem('token')
          toast({
            title: "Session expired",
            description: "Please login again to continue.",
            variant: "destructive",
          })
          router.push('/')
          return
        }

        // Check if all responses are OK
        if (
          !vendorsResponse.ok ||
          !productTypesResponse.ok ||
          !shopLocationsResponse.ok ||
          !listingTypesResponse.ok ||
          !categoriesResponse.ok
        ) {
          throw new Error("Failed to fetch dropdown data")
        }

        // Parse the responses
        const vendorsData = await vendorsResponse.json()
        const productTypesData = await productTypesResponse.json()
        const shopLocationsData = await shopLocationsResponse.json()
        const listingTypesData = await listingTypesResponse.json()
        const categoriesData = await categoriesResponse.json()

        // Update state with the fetched data
        setVendors(vendorsData)
        setProductTypes(productTypesData)
        setShopLocations(shopLocationsData)
        setListingTypes(listingTypesData)
        setCategories(categoriesData)

        // If there's a default category in the form, fetch its subcategories
        if (form.getValues("category_id")) {
          await fetchSubCategories(form.getValues("category_id"))
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error)
        setDropdownError("Failed to load dropdown data. Please refresh the page.")
      } finally {
        setIsLoadingDropdowns(false)
      }
    }

    fetchDropdownData()
  }, [form])

  // Fetch subcategories when category changes
  useEffect(() => {
    console.log('Category changed to:', selectedCategoryId)
    if (selectedCategoryId) {
      fetchSubCategories(selectedCategoryId)
    } else {
      setSubCategories([])
    }
  }, [selectedCategoryId])

  // Function to fetch subcategories for a specific category
  const fetchSubCategories = async (categoryId: number) => {
    if (!categoryId) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${categoryId}/subcategories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          toast({
            title: "Session expired",
            description: "Please login again to continue.",
            variant: "destructive",
          })
          router.push('/')
          return
        }
        throw new Error("Failed to fetch subcategories")
      }

      const data = await response.json()
      console.log('Fetched subcategories for category', categoryId, ':', data)
      setSubCategories(data)

      // Clear the subcategory selection if the current selection doesn't belong to this category
      const currentSubCategoryId = form.getValues("sub_category_id")
      if (currentSubCategoryId) {
        const subCategoryExists = data.some((subCat: SubCategory) => subCat.id === currentSubCategoryId)
        if (!subCategoryExists) {
          form.setValue("sub_category_id", undefined)
        }
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error)
      setSubCategories([])
    }
  }

  // Handle form submission
  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Format option types to match backend structure
      const formattedOptions = options
        .filter((option) => option.type && option.values.some((v) => v.trim() !== ""))
        .map((option, index) => {
          // Format values as array of strings (backend expects this)
          const formattedValues = option.values
            .filter((v: string) => v.trim() !== "")
            .map((value: string) => value)

          const optionData: any = {
            name: option.type,
            values: formattedValues,
          }

          // If editing and this option type exists in initialData, include the ID
          if (isEditing && initialData.option_types) {
            const existingOptionType = initialData.option_types.find((ot: any) => ot.name === option.type)
            if (existingOptionType) {
              optionData.id = existingOptionType.id
            }
          }

          return optionData
        })

      // Format variants to match backend structure
      const formattedVariants = variants.map((variant) => {
        // Map option values to option1, option2, option3
        const variantOptions: { [key: string]: string | null } = {
          option1: null,
          option2: null,
          option3: null,
        }

        variant.options.forEach((opt: any, i: number) => {
          if (i < 3) {
            variantOptions[`option${i + 1}`] = opt.value
          }
        })

        // Include the variant ID if it exists (for editing)
        const variantData: any = {
          sku: variant.sku || `${data.sku}-${variant.title.replace(/\s+/g, "-")}`,
          price: variant.price || data.price,
          quantity: variant.inventory || 0,
          ...variantOptions,
        }

        // Add ID if this is an existing variant
        if (variant.id) {
          // Convert id to string to safely check if it starts with specific prefixes
          const variantIdStr = String(variant.id)
          if (!variantIdStr.startsWith("new-") && !variantIdStr.startsWith("manual-")) {
            variantData.id = variant.id
          }
        }

        return variantData
      })

      // Prepare the complete payload
      const payload = {
        product: {
          // Map frontend field names to backend field names
          name: data.title, // Backend expects 'name' but frontend uses 'title'
          description: data.description,
          price: data.price,
          sku: data.sku,
          stock_quantity: data.inventory || 0,
          active: data.status === 'active',
          vendor_id: data.vendor_id,
          product_type_id: data.product_type_id,
          shop_location_id: data.shop_location_id,
          category_id: data.category_id,
          subcategory_id: data.sub_category_id, // Map sub_category_id to subcategory_id
          listing_type_id: data.listing_type_id,
          option_types_attributes: formattedOptions,
          variants_attributes: formattedVariants,
        },
      }

      console.log("Submitting data:", payload)

      // Determine the API endpoint and method based on whether we're creating or updating
      const url = isEditing
        ? `${API_BASE_URL}/api/v1/shops/${shopId}/products/${initialData.id}`
        : `${API_BASE_URL}/api/v1/shops/${shopId}/products`

      const method = isEditing ? "PUT" : "POST"

      // Get authentication token
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Send the data to the API
      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          toast({
            title: "Session expired",
            description: "Please login again to continue.",
            variant: "destructive",
          })
          router.push('/')
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${isEditing ? "update" : "create"} product`)
      }

      const result = await response.json()

      toast({
        title: isEditing ? "Product updated successfully" : "Product created successfully",
        description: `Product "${data.title}" has been ${isEditing ? "updated" : "created"}.`,
      })

      // Log the result and redirect to the products page
      console.log(isEditing ? "Product updated:" : "Product created:", result)
      router.push(`/shop/${shopId}/products`)
    } catch (error) {
      console.error(isEditing ? "Error updating product:" : "Error creating product:", error)
      setSubmitError(error instanceof Error ? error.message : "An unknown error occurred")

      toast({
        variant: "destructive",
        title: isEditing ? "Failed to update product" : "Failed to create product",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle option and variant updates from VariantsManager
  const handleOptionsChange = (newOptions: any[]) => {
    setOptions(newOptions)
  }

  const handleVariantsChange = (newVariants: any[]) => {
    setVariants(newVariants)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          // Only process form submission if it's a real submit event
          if (e.target === e.currentTarget) {
            form.handleSubmit(onSubmit)(e)
          }
        }}
        className="space-y-4"
      >
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium">Product Information</h2>
            <p className="text-xs text-muted-foreground">Manage your product details and options.</p>
          </div>
          <SaveButton isSubmitting={isSubmitting} isEditing={isEditing} />
        </div>

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {dropdownError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{dropdownError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left column (2/3 width) */}
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardContent className="space-y-2 pt-3">
                <div className="flex justify-between items-center">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs font-medium">Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Product title" className="h-8 text-xs" tabIndex={1} {...field} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0 ml-4">
                        <FormLabel className="text-xs font-medium">Status</FormLabel>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs ${field.value === "active" ? "font-medium text-green-600" : "text-muted-foreground"}`}
                          >
                            {field.value === "active" ? "Active" : "Draft"}
                          </span>
                          <Switch
                            checked={field.value === "active"}
                            onCheckedChange={(checked) => {
                              field.onChange(checked ? "active" : "draft")
                            }}
                            tabIndex={14}
                          />
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Description</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="Describe your product..."
                          tabIndex={2}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="mt-2">
                  <h3 className="text-xs font-medium mb-1">Media</h3>
                  <ImageUploader />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pricing</CardTitle>
                <CardDescription className="text-xs">Set your product's pricing information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 py-2">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium">Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-xs">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-7 h-8 text-xs"
                              tabIndex={12}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="compareAtPrice"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium">Compare-at Price</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-xs">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-7 h-8 text-xs"
                              tabIndex={13}
                              {...field}
                              value={field.value || ""}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">Original price before discount.</FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Variants</CardTitle>
                <CardDescription className="text-xs">Manage different variations of your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 py-2">
                <VariantsManager
                  initialOptions={initialOptions}
                  initialVariants={initialVariants}
                  onOptionsChange={handleOptionsChange}
                  onVariantsChange={handleVariantsChange}
                  shopId={shopId}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Inventory & Shipping</CardTitle>
                <CardDescription className="text-xs">Manage inventory and shipping details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 py-2">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="inventory"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium">Inventory quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="h-8 text-xs"
                            tabIndex={15}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium">Weight</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0.0"
                            className="h-8 text-xs"
                            tabIndex={16}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight_unit"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-medium">Weight unit</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            tabIndex={17}
                            {...field}
                          >
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="lb">lb</option>
                            <option value="oz">oz</option>
                          </select>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column (1/3 width) */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Product Organization</CardTitle>
                <CardDescription className="text-xs">Categorize and organize your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 py-2">
                <FormField
                  control={form.control}
                  name="vendor_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Vendor</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={isLoadingDropdowns}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs" tabIndex={3}>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                              {vendor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_type_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Product Type</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={isLoadingDropdowns}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs" tabIndex={4}>
                            <SelectValue placeholder="Select product type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {productTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shop_location_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Shop Location</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={isLoadingDropdowns}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs" tabIndex={5}>
                            <SelectValue placeholder="Select shop location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shopLocations.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="listing_type_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Listing Type</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={isLoadingDropdowns}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs" tabIndex={6}>
                            <SelectValue placeholder="Select listing type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {listingTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={isLoadingDropdowns}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs" tabIndex={7}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sub_category_id"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Subcategory</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number.parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={isLoadingDropdowns || !selectedCategoryId || subCategories.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger className="h-8 text-xs" tabIndex={8}>
                            <SelectValue
                              placeholder={
                                !selectedCategoryId
                                  ? "Select a category first"
                                  : subCategories.length === 0
                                    ? "No subcategories available"
                                    : "Select subcategory"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subCategories.map((subCategory) => (
                            <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                              {subCategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Product Identification</CardTitle>
                <CardDescription className="text-xs">Set unique identifiers for your product.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 py-2">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">SKU (Stock Keeping Unit)</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU-123" className="h-8 text-xs" tabIndex={9} {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Barcode (UPC, EAN, etc.)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter barcode" className="h-8 text-xs" tabIndex={10} {...field} />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <SaveButton isSubmitting={isSubmitting} isEditing={isEditing} />
        </div>
      </form>
    </Form>
  )
}