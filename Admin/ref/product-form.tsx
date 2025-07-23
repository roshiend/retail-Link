"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  Link,
  ImageIcon,
  MoreHorizontal,
  Upload,
  FolderOpen,
  ChevronDown,
  Eye,
  Copy,
  Archive,
  Trash2,
  ExternalLink,
} from "lucide-react"

import ShopifyVariantManager from "@/components/shopify-variant-manager"

export default function Component() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [productType, setProductType] = useState("")
  const [vendor, setVendor] = useState("")
  const [listingType, setListingType] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [price, setPrice] = useState("0.00")
  const [comparePrice, setComparePrice] = useState("0.00")
  const [cost, setCost] = useState("0.00")
  const [profit, setProfit] = useState("")
  const [margin, setMargin] = useState("")
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [quantity, setQuantity] = useState("0")
  const [weight, setWeight] = useState("0.0")
  const [chargeTax, setChargeTax] = useState(false)
  const [trackQuantity, setTrackQuantity] = useState(false)
  const [continueSellingOutOfStock, setContinueSellingOutOfStock] = useState(false)
  const [hasSkuOrBarcode, setHasSkuOrBarcode] = useState(false)
  const [isPhysicalProduct, setIsPhysicalProduct] = useState(false)
  const [variants, setVariants] = useState([])
  const [showVariants, setShowVariants] = useState(false)
  const [status, setStatus] = useState("active")
  const [shopLocation, setShopLocation] = useState("")
  const [primaryShopLocation, setPrimaryShopLocation] = useState("")

  const [mediaFiles, setMediaFiles] = useState([])
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoUrl, setSeoUrl] = useState("")

  const [showCustomsInfo, setShowCustomsInfo] = useState(false)
  const [customsInfo, setCustomsInfo] = useState({
    hsCode: "",
    countryOfOrigin: "",
    customsDescription: "",
    customsValue: "",
    customsWeight: "",
    customsWeightUnit: "kg",
    dutiable: false,
    restrictedItem: false,
    dangerousGoods: false,
    requiresLicense: false,
    tariffNumber: "",
    commodityCode: "",
  })

  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState("")

  // New states for modals and dropdowns
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showMoreActionsDropdown, setShowMoreActionsDropdown] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")

  // Update inventory shop location when primary shop location changes
  useEffect(() => {
    if (primaryShopLocation) {
      setShopLocation(primaryShopLocation)
    }
  }, [primaryShopLocation])

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map((file) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploaded: false,
    }))
    setMediaFiles([...mediaFiles, ...newFiles])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const removeMediaFile = (fileId) => {
    setMediaFiles(mediaFiles.filter((file) => file.id !== fileId))
  }

  const triggerFileInput = () => {
    document.getElementById("file-upload").click()
  }

  const mockExistingMedia = [
    { id: 1, name: "product-image-1.jpg", url: "/product-display-1.png", type: "image" },
    { id: 2, name: "product-image-2.jpg", url: "/product-display-sleek.png", type: "image" },
    { id: 3, name: "product-video.mp4", url: "/video-thumbnail.png", type: "video" },
    { id: 4, name: "product-3d-model.glb", url: "/abstract-3d-model.png", type: "3d" },
  ]

  const categorySubcategories = {
    clothing: [
      { id: "shirts", name: "Shirts" },
      { id: "pants", name: "Pants" },
      { id: "dresses", name: "Dresses" },
      { id: "jackets", name: "Jackets" },
      { id: "shoes", name: "Shoes" },
      { id: "accessories", name: "Accessories" },
    ],
    electronics: [
      { id: "smartphones", name: "Smartphones" },
      { id: "laptops", name: "Laptops" },
      { id: "tablets", name: "Tablets" },
      { id: "headphones", name: "Headphones" },
      { id: "cameras", name: "Cameras" },
      { id: "gaming", name: "Gaming" },
    ],
    accessories: [
      { id: "bags", name: "Bags" },
      { id: "jewelry", name: "Jewelry" },
      { id: "watches", name: "Watches" },
      { id: "sunglasses", name: "Sunglasses" },
      { id: "belts", name: "Belts" },
      { id: "hats", name: "Hats" },
    ],
  }

  const availableSubcategories = category ? categorySubcategories[category] || [] : []

  const selectExistingMedia = (media) => {
    const newFile = {
      id: `existing_${media.id}`,
      name: media.name,
      url: media.url,
      type: media.type,
      existing: true,
    }
    setMediaFiles([...mediaFiles, ...newFile])
    setShowMediaSelector(false)
  }

  const addTag = (tag) => {
    if (!tag.trim()) return
    const newTag = tag.trim().toLowerCase()
    if (!tags.includes(newTag)) {
      setTags([...tags, newTag])
    }
    setTagInput("")
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Preview functionality
  const handlePreview = () => {
    setShowPreviewModal(true)
  }

  // More actions functionality
  const handleMoreActions = () => {
    setShowMoreActionsDropdown(!showMoreActionsDropdown)
  }

  const handleDuplicate = () => {
    console.log("Duplicating product...")
    setShowMoreActionsDropdown(false)
    // Add duplication logic here
  }

  const handleArchive = () => {
    console.log("Archiving product...")
    setStatus("archived")
    setShowMoreActionsDropdown(false)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      console.log("Deleting product...")
      setShowMoreActionsDropdown(false)
      // Add deletion logic here
    }
  }

  const handleViewInStore = () => {
    const productUrl = `https://yourstore.com/products/${
      seoUrl ||
      title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") ||
      "product-name"
    }`
    window.open(productUrl, "_blank")
    setShowMoreActionsDropdown(false)
  }

  // Save functionality
  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus("Saving...")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Collect all product data
      const productData = {
        title,
        description,
        category,
        subcategory,
        productType,
        vendor,
        listingType,
        price,
        comparePrice,
        cost,
        profit,
        margin,
        sku,
        barcode,
        quantity,
        weight,
        chargeTax,
        trackQuantity,
        continueSellingOutOfStock,
        hasSkuOrBarcode,
        isPhysicalProduct,
        status,
        shopLocation,
        primaryShopLocation,
        mediaFiles,
        seoTitle,
        seoDescription,
        seoUrl,
        customsInfo,
        tags,
        variants,
      }

      console.log("Saving product data:", productData)

      setSaveStatus("Saved successfully!")
      setTimeout(() => setSaveStatus(""), 3000)
    } catch (error) {
      console.error("Error saving product:", error)
      setSaveStatus("Error saving product")
      setTimeout(() => setSaveStatus(""), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900">{title || "Add product"}</h1>
              {status && (
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    status === "active"
                      ? "bg-green-100 text-green-800"
                      : status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              )}
              {saveStatus && (
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{saveStatus}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-3 bg-white border-gray-300 hover:bg-gray-50 flex items-center gap-1"
                onClick={handlePreview}
              >
                <Eye className="h-3 w-3" />
                Preview
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-3 flex items-center gap-1 bg-white border-gray-300 hover:bg-gray-50"
                  onClick={handleMoreActions}
                >
                  More actions
                  <ChevronDown className="h-3 w-3" />
                </Button>

                {/* More Actions Dropdown */}
                {showMoreActionsDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={handleDuplicate}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="h-3 w-3" />
                        Duplicate
                      </button>
                      <button
                        onClick={handleViewInStore}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View in store
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleArchive}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        <Archive className="h-3 w-3" />
                        Archive product
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete product
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 text-xs px-4 bg-black hover:bg-gray-800 text-white disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Product Preview</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </Button>
              </div>

              {/* Product Preview Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Images */}
                <div className="space-y-4">
                  {mediaFiles.length > 0 ? (
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={mediaFiles[0].url || "/placeholder.svg"}
                        alt={title || "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  {mediaFiles.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {mediaFiles.slice(1, 5).map((file) => (
                        <div key={file.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                          <img
                            src={file.url || "/placeholder.svg"}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title || "Product Title"}</h1>
                    {vendor && <p className="text-sm text-gray-600 mt-1">by {vendor}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-900">Rs. {price}</span>
                    {comparePrice && Number.parseFloat(comparePrice) > Number.parseFloat(price) && (
                      <span className="text-lg text-gray-500 line-through">Rs. {comparePrice}</span>
                    )}
                  </div>

                  {description && (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700">{description}</p>
                    </div>
                  )}

                  {variants.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900">Available Options:</h3>
                      <div className="text-sm text-gray-600">
                        {variants.filter((v) => v.active).length} variants available
                      </div>
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-900">Tags:</h3>
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <span className="ml-2 text-gray-900">{category || "Not set"}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className="ml-2 text-gray-900 capitalize">{status}</span>
                      </div>
                      {sku && (
                        <div>
                          <span className="text-gray-600">SKU:</span>
                          <span className="ml-2 text-gray-900">{sku}</span>
                        </div>
                      )}
                      {isPhysicalProduct && (
                        <div>
                          <span className="text-gray-600">Weight:</span>
                          <span className="ml-2 text-gray-900">{weight} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowPreviewModal(false)} className="text-xs px-4">
                  Close
                </Button>
                <Button onClick={handleViewInStore} className="text-xs px-4 bg-black hover:bg-gray-800 text-white">
                  View in Store
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showMoreActionsDropdown && (
        <div className="fixed inset-0 z-30" onClick={() => setShowMoreActionsDropdown(false)}></div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-3">
            {/* Product Information Card */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-medium text-gray-700">
                    Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Short sleeves t-shirt"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-8 text-xs"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Description</Label>
                  <div className="border rounded-md bg-white">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 p-1.5 border-b bg-gray-50">
                      <Select defaultValue="paragraph">
                        <SelectTrigger className="w-20 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paragraph">Paragraph</SelectItem>
                          <SelectItem value="heading1">Heading 1</SelectItem>
                          <SelectItem value="heading2">Heading 2</SelectItem>
                          <SelectItem value="heading3">Heading 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <Separator orientation="vertical" className="h-5" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          document.execCommand("bold", false, null)
                        }}
                      >
                        <Bold className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          document.execCommand("italic", false, null)
                        }}
                      >
                        <Italic className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          document.execCommand("underline", false, null)
                        }}
                      >
                        <Underline className="h-3 w-3" />
                      </Button>
                      <Separator orientation="vertical" className="h-5" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          document.execCommand("justifyLeft", false, null)
                        }}
                      >
                        <AlignLeft className="h-3 w-3" />
                      </Button>
                      <Separator orientation="vertical" className="h-5" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          const url = prompt("Enter URL:")
                          if (url) {
                            document.execCommand("createLink", false, url)
                          }
                        }}
                      >
                        <Link className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          const input = document.createElement("input")
                          input.type = "file"
                          input.accept = "image/*"
                          input.onchange = (e) => {
                            const file = e.target.files[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (e) => {
                                document.execCommand("insertImage", false, e.target.result)
                              }
                              reader.readAsDataURL(file)
                            }
                          }
                          input.click()
                        }}
                      >
                        <ImageIcon className="h-3 w-3" />
                      </Button>
                      <Separator orientation="vertical" className="h-5" />
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                      <div className="ml-auto text-xs text-gray-500">{description.length}/5000</div>
                    </div>
                    <div
                      ref={(el) => {
                        if (el && description && el.textContent !== description) {
                          el.textContent = description
                        }
                      }}
                      contentEditable
                      className="min-h-[100px] p-2.5 focus:outline-none text-xs"
                      style={{ whiteSpace: "pre-wrap" }}
                      onInput={(e) => {
                        setDescription(e.target.textContent || "")
                      }}
                      suppressContentEditableWarning={true}
                      placeholder="Enter product description..."
                    />
                  </div>
                </div>

                {/* Media */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Media</Label>

                  {/* Hidden file input */}
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*,.glb,.gltf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />

                  {/* Media files display */}
                  {mediaFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {mediaFiles.map((file) => (
                        <div key={file.id} className="relative group">
                          <div className="aspect-square border rounded-lg overflow-hidden bg-gray-100">
                            {file.type.startsWith("image/") || file.type === "image" ? (
                              <img
                                src={file.url || "/placeholder.svg"}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                  <div className="text-xl mb-1">
                                    {file.type === "video" || file.type.startsWith("video/")
                                      ? "🎥"
                                      : file.type === "3d" || file.name.endsWith(".glb") || file.name.endsWith(".gltf")
                                        ? "📦"
                                        : "📄"}
                                  </div>
                                  <div className="text-xs">{file.type}</div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-5 w-5 p-0 text-xs"
                              onClick={() => removeMediaFile(file.id)}
                            >
                              ×
                            </Button>
                          </div>
                          <div className="mt-1 text-xs text-gray-600 truncate">{file.name}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center bg-white transition-colors ${
                      dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex justify-center gap-3 mb-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent h-7 text-xs px-3"
                        onClick={triggerFileInput}
                      >
                        <Upload className="h-3 w-3" />
                        Upload new
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent h-7 text-xs px-3"
                        onClick={() => setShowMediaSelector(true)}
                      >
                        <FolderOpen className="h-3 w-3" />
                        Select existing
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {dragActive ? "Drop files here..." : "Accepts images, videos, or 3D models"}
                    </p>
                  </div>

                  {/* Media Selector Modal */}
                  {showMediaSelector && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-semibold">Select Existing Media</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMediaSelector(false)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {mockExistingMedia.map((media) => (
                            <div
                              key={media.id}
                              className="cursor-pointer group"
                              onClick={() => selectExistingMedia(media)}
                            >
                              <div className="aspect-square border rounded-lg overflow-hidden bg-gray-100 group-hover:border-blue-400 transition-colors">
                                <img
                                  src={media.url || "/placeholder.svg"}
                                  alt={media.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="mt-1 text-xs text-gray-600 truncate">{media.name}</div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setShowMediaSelector(false)}
                            className="h-7 text-xs px-3"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customs Information Modal */}
                {showCustomsInfo && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold">Customs Information</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCustomsInfo(false)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="hs-code" className="text-xs font-medium">
                              Harmonized System (HS) code
                            </Label>
                            <Input
                              id="hs-code"
                              placeholder="e.g., 6109.10.00"
                              value={customsInfo.hsCode}
                              onChange={(e) => setCustomsInfo({ ...customsInfo, hsCode: e.target.value })}
                              className="h-8 text-xs"
                            />
                            <p className="text-xs text-gray-500">
                              Used to determine duties and taxes for international shipping
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="country-origin" className="text-xs font-medium">
                              Country/Region of origin
                            </Label>
                            <Select
                              value={customsInfo.countryOfOrigin}
                              onValueChange={(value) => setCustomsInfo({ ...customsInfo, countryOfOrigin: value })}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="GB">United Kingdom</SelectItem>
                                <SelectItem value="DE">Germany</SelectItem>
                                <SelectItem value="FR">France</SelectItem>
                                <SelectItem value="CN">China</SelectItem>
                                <SelectItem value="IN">India</SelectItem>
                                <SelectItem value="JP">Japan</SelectItem>
                                <SelectItem value="AU">Australia</SelectItem>
                                <SelectItem value="BR">Brazil</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="customs-description" className="text-xs font-medium">
                            Customs description
                          </Label>
                          <Textarea
                            id="customs-description"
                            placeholder="Brief description for customs declaration"
                            value={customsInfo.customsDescription}
                            onChange={(e) => setCustomsInfo({ ...customsInfo, customsDescription: e.target.value })}
                            rows={2}
                            className="resize-none text-xs"
                          />
                          <p className="text-xs text-gray-500">Keep it simple and accurate for customs officials</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="customs-value" className="text-xs font-medium">
                              Customs value
                            </Label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                              <Input
                                id="customs-value"
                                placeholder="0.00"
                                value={customsInfo.customsValue}
                                onChange={(e) => setCustomsInfo({ ...customsInfo, customsValue: e.target.value })}
                                className="pl-6 h-8 text-xs"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Customs weight</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="0.0"
                                value={customsInfo.customsWeight}
                                onChange={(e) => setCustomsInfo({ ...customsInfo, customsWeight: e.target.value })}
                                className="h-8 text-xs"
                              />
                              <Select
                                value={customsInfo.customsWeightUnit}
                                onValueChange={(value) => setCustomsInfo({ ...customsInfo, customsWeightUnit: value })}
                              >
                                <SelectTrigger className="w-14 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="lb">lb</SelectItem>
                                  <SelectItem value="g">g</SelectItem>
                                  <SelectItem value="oz">oz</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs font-medium">Additional declarations</Label>

                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="dutiable"
                                checked={customsInfo.dutiable}
                                onCheckedChange={(checked) => setCustomsInfo({ ...customsInfo, dutiable: checked })}
                              />
                              <Label htmlFor="dutiable" className="text-xs">
                                Subject to duties and taxes
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="restricted"
                                checked={customsInfo.restrictedItem}
                                onCheckedChange={(checked) =>
                                  setCustomsInfo({ ...customsInfo, restrictedItem: checked })
                                }
                              />
                              <Label htmlFor="restricted" className="text-xs">
                                Restricted item
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="dangerous"
                                checked={customsInfo.dangerousGoods}
                                onCheckedChange={(checked) =>
                                  setCustomsInfo({ ...customsInfo, dangerousGoods: checked })
                                }
                              />
                              <Label htmlFor="dangerous" className="text-xs">
                                Dangerous goods
                              </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="license"
                                checked={customsInfo.requiresLicense}
                                onCheckedChange={(checked) =>
                                  setCustomsInfo({ ...customsInfo, requiresLicense: checked })
                                }
                              />
                              <Label htmlFor="license" className="text-xs">
                                Requires import/export license
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="tariff-number" className="text-xs font-medium">
                              Tariff number
                            </Label>
                            <Input
                              id="tariff-number"
                              placeholder="Optional"
                              value={customsInfo.tariffNumber}
                              onChange={(e) => setCustomsInfo({ ...customsInfo, tariffNumber: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="commodity-code" className="text-xs font-medium">
                              Commodity code
                            </Label>
                            <Input
                              id="commodity-code"
                              placeholder="Optional"
                              value={customsInfo.commodityCode}
                              onChange={(e) => setCustomsInfo({ ...customsInfo, commodityCode: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                          <div className="text-xs font-medium text-blue-800 mb-1">Important</div>
                          <p className="text-xs text-blue-700">
                            Accurate customs information is required for international shipping. Incorrect information
                            may cause delays or additional fees.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowCustomsInfo(false)}
                          className="h-7 text-xs px-3"
                        >
                          Cancel
                        </Button>
                        <Button onClick={() => setShowCustomsInfo(false)} className="h-7 text-xs px-3">
                          Save customs information
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category and related fields */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Product Type</Label>
                      <Select value={productType} onValueChange={setProductType}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="physical">Physical Product</SelectItem>
                          <SelectItem value="digital">Digital Product</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="gift-card">Gift Card</SelectItem>
                          <SelectItem value="subscription">Subscription</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Vendor</Label>
                      <Select value={vendor} onValueChange={setVendor}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select vendor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brand-a">Brand A</SelectItem>
                          <SelectItem value="brand-b">Brand B</SelectItem>
                          <SelectItem value="brand-c">Brand C</SelectItem>
                          <SelectItem value="manufacturer-x">Manufacturer X</SelectItem>
                          <SelectItem value="supplier-y">Supplier Y</SelectItem>
                          <SelectItem value="in-house">In House</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Listing Type</Label>
                      <Select value={listingType} onValueChange={setListingType}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select listing type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular Listing</SelectItem>
                          <SelectItem value="featured">Featured Listing</SelectItem>
                          <SelectItem value="promoted">Promoted Listing</SelectItem>
                          <SelectItem value="clearance">Clearance</SelectItem>
                          <SelectItem value="pre-order">Pre-order</SelectItem>
                          <SelectItem value="back-order">Back Order</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Shop Location</Label>
                      <Select value={primaryShopLocation} onValueChange={setPrimaryShopLocation}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select shop location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main-store">Main Store</SelectItem>
                          <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                          <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                          <SelectItem value="online-only">Online Only</SelectItem>
                          <SelectItem value="retail-outlet">Retail Outlet</SelectItem>
                          <SelectItem value="distribution-center">Distribution Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Category</Label>
                      <Select
                        value={category}
                        onValueChange={(value) => {
                          setCategory(value)
                          setSubcategory("") // Reset subcategory when category changes
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Choose a product category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Subcategory</Label>
                      <Select value={subcategory} onValueChange={setSubcategory} disabled={!category}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={category ? "Choose subcategory" : "Select category first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Determine search, filters and product recommendations. There's also a product category sales report.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <ShopifyVariantManager
                  variants={variants}
                  setVariants={setVariants}
                  basePrice={price}
                  onClose={() => {
                    setShowVariants(false)
                    setVariants([])
                  }}
                />
              </CardContent>
            </Card>

            {/* Search Engine Listing */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Search engine listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-600">
                  Add a title and description to see how this product might appear in a search engine listing
                </p>

                {/* SEO Preview - only show if there's content */}
                {(seoTitle || seoDescription || title) && (
                  <div className="border rounded-lg p-2.5 bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1.5">Preview</div>
                    <div className="space-y-1">
                      <div className="text-blue-600 text-sm hover:underline cursor-pointer font-medium">
                        {seoTitle || title || "Product Title"}
                      </div>
                      <div className="text-green-700 text-xs">
                        https://yourstore.com/products/
                        {seoUrl ||
                          title
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, "") ||
                          "product-name"}
                      </div>
                      <div className="text-gray-600 text-xs leading-relaxed">
                        {seoDescription || description.slice(0, 160) || "Product description will appear here..."}
                        {(seoDescription || description).length > 160 && "..."}
                      </div>
                    </div>
                  </div>
                )}

                {/* Collapsible SEO Form */}
                <details className="group border-t pt-2">
                  <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    Edit SEO settings
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="seo-title" className="text-xs font-medium">
                        Page title
                      </Label>
                      <Input
                        id="seo-title"
                        placeholder={title || "Enter SEO title"}
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        maxLength={60}
                        className="h-8 text-xs"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Recommended: 50-60 characters</span>
                        <span
                          className={
                            seoTitle.length > 60 ? "text-red-500" : seoTitle.length > 50 ? "text-yellow-500" : ""
                          }
                        >
                          {seoTitle.length}/60
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="seo-description" className="text-xs font-medium">
                        Meta description
                      </Label>
                      <Textarea
                        id="seo-description"
                        placeholder={description || "Enter meta description"}
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        maxLength={160}
                        rows={2}
                        className="resize-none text-xs"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Recommended: 120-160 characters</span>
                        <span
                          className={
                            seoDescription.length > 160
                              ? "text-red-500"
                              : seoDescription.length > 120
                                ? "text-green-500"
                                : ""
                          }
                        >
                          {seoDescription.length}/160
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="seo-url" className="text-xs font-medium">
                        URL handle
                      </Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs">
                          https://yourstore.com/products/
                        </span>
                        <Input
                          id="seo-url"
                          placeholder={
                            title
                              .toLowerCase()
                              .replace(/\s+/g, "-")
                              .replace(/[^a-z0-9-]/g, "") || "product-url"
                          }
                          value={seoUrl}
                          onChange={(e) => setSeoUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                          className="rounded-l-none h-8 text-xs"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Should be unique and contain only letters, numbers, and hyphens.
                      </p>
                    </div>
                  </div>
                </details>

                {/* Advanced SEO Options */}
                <details className="group border-t pt-2">
                  <summary className="cursor-pointer text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    Advanced SEO options
                  </summary>
                  <div className="mt-2 space-y-2">
                    {/* SEO Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
                      <div className="text-xs font-medium text-blue-800 mb-1">SEO Tips</div>
                      <ul className="text-xs text-blue-700 space-y-0.5">
                        <li>• Include your main keyword in the title and description</li>
                        <li>• Keep titles under 60 characters and descriptions under 160 characters</li>
                        <li>• Make your URL handle descriptive and easy to read</li>
                      </ul>
                    </div>

                    {/* Structured Data */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Structured data</Label>
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <p>✓ Product schema markup will be automatically generated</p>
                        <p>✓ Price and availability information included</p>
                        <p>✓ Review ratings (when available)</p>
                      </div>
                    </div>

                    {/* Social Media Preview */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Social media preview</Label>
                      <div className="border rounded-lg p-2 bg-white">
                        <div className="flex gap-2">
                          <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                            {mediaFiles.length > 0 ? (
                              <img
                                src={mediaFiles[0].url || "/placeholder.svg"}
                                alt="Product"
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <ImageIcon className="h-3 w-3 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">
                              {seoTitle || title || "Product Title"}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {seoDescription || description.slice(0, 80) || "Product description..."}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">yourstore.com</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-3">
            {/* Status */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="price" className="text-xs text-gray-700">
                      Price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">Rs.</span>
                      <Input
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="pl-6 h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="compare-price" className="text-xs text-gray-700">
                      Compare at price
                    </Label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">Rs.</span>
                      <Input
                        id="compare-price"
                        value={comparePrice}
                        onChange={(e) => setComparePrice(e.target.value)}
                        className="pl-6 h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="charge-tax" checked={chargeTax} onCheckedChange={setChargeTax} />
                  <Label htmlFor="charge-tax" className="text-xs">
                    Charge tax on this product
                  </Label>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-600">Cost</Label>
                    <div className="relative">
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">Rs.</span>
                      <Input value={cost} onChange={(e) => setCost(e.target.value)} className="pl-5 text-xs h-8" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-600">Profit</Label>
                    <div className="relative">
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">Rs.</span>
                      <Input
                        value={profit}
                        onChange={(e) => setProfit(e.target.value)}
                        placeholder="0.00"
                        className="pl-5 text-xs h-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-600">Margin</Label>
                    <div className="relative">
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs text-gray-500">%</span>
                      <Input
                        value={margin}
                        onChange={(e) => setMargin(e.target.value)}
                        placeholder="0"
                        className="pr-5 text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory - Reorganized to match Shopify */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Track quantity */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="track-quantity" checked={trackQuantity} onCheckedChange={setTrackQuantity} />
                  <Label htmlFor="track-quantity" className="text-xs">
                    Track quantity
                  </Label>
                </div>

                {/* Shop location and Quantity - inline layout */}
                <div className="grid grid-cols-2 gap-3 items-start">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Shop location</Label>
                    {trackQuantity ? (
                      <Select value={shopLocation} onValueChange={setShopLocation}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main-store">Main Store</SelectItem>
                          <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                          <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                          <SelectItem value="online-only">Online Only</SelectItem>
                          <SelectItem value="retail-outlet">Retail Outlet</SelectItem>
                          <SelectItem value="distribution-center">Distribution Center</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-8 flex items-center">
                        <span className="text-xs text-gray-500">Not tracked</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Quantity</Label>
                    {trackQuantity ? (
                      <Input
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full h-8 text-xs"
                      />
                    ) : (
                      <div className="h-8 flex items-center">
                        <span className="text-xs text-gray-500">Not tracked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Continue selling option - only show when tracking is enabled */}
                {trackQuantity && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="continue-selling"
                        checked={continueSellingOutOfStock}
                        onCheckedChange={setContinueSellingOutOfStock}
                      />
                      <Label htmlFor="continue-selling" className="text-xs">
                        Continue selling when out of stock
                      </Label>
                    </div>
                    {continueSellingOutOfStock && (
                      <p className="text-xs text-gray-600 ml-5">
                        This won't affect Shopify POS. Staff will see a warning, but can complete sales when available
                        inventory reaches zero and below.
                      </p>
                    )}
                  </div>
                )}

                {/* SKU or Barcode checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="has-sku-barcode" checked={hasSkuOrBarcode} onCheckedChange={setHasSkuOrBarcode} />
                  <Label htmlFor="has-sku-barcode" className="text-xs">
                    This product has a SKU or barcode
                  </Label>
                </div>

                {/* SKU and Barcode fields - only show when checkbox is checked */}
                {hasSkuOrBarcode && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="sku" className="text-xs text-gray-700">
                        SKU (Stock Keeping Unit)
                      </Label>
                      <Input
                        id="sku"
                        placeholder="SKU"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="barcode" className="text-xs text-gray-700">
                        Barcode (ISBN, UPC, GTIN, etc.)
                      </Label>
                      <Input
                        id="barcode"
                        placeholder="Barcode"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping - Separate card */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Shipping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="physical-product" checked={isPhysicalProduct} onCheckedChange={setIsPhysicalProduct} />
                  <Label htmlFor="physical-product" className="text-xs">
                    This is a physical product
                  </Label>
                </div>

                {isPhysicalProduct && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Weight</Label>
                    <div className="flex gap-2">
                      <Input value={weight} onChange={(e) => setWeight(e.target.value)} className="w-20 h-8 text-xs" />
                      <Select defaultValue="kg">
                        <SelectTrigger className="w-14 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {!isPhysicalProduct && (
                  <p className="text-xs text-gray-600">
                    Customers won't enter shipping details at checkout.{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      Learn how to set up your store for digital products or services.
                    </a>
                  </p>
                )}

                {/* Add customs information button */}
                <Button
                  variant="ghost"
                  className="text-blue-600 p-0 h-auto font-normal text-xs"
                  onClick={() => setShowCustomsInfo(!showCustomsInfo)}
                >
                  Add customs information
                </Button>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Product tags</Label>
                  <p className="text-xs text-gray-500">
                    Add tags to help customers find this product. Tags are used for search and filtering.
                  </p>

                  {/* Display existing tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {tags.map((tag, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md"
                        >
                          <span>{tag}</span>
                          <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-red-600 ml-0.5">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tag input */}
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      className="h-8 text-xs"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag(tagInput)
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(tagInput)}
                      disabled={!tagInput.trim()}
                      className="h-8 text-xs px-3"
                    >
                      Add
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(tagInput)}
                      disabled={!tagInput.trim()}
                      className="h-8 text-xs px-3"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )\
}
