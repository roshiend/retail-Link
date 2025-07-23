"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"

// Shopify Variant Processing Module
class ShopifyVariantProcessor {
  // ae(variants, optionTypes) - Transform raw variant data into Shopify Admin-friendly format
  static transformVariantsForAdmin(variants, optionTypes) {
    return variants.map((variant) => ({
      id: variant.id || this.generateId(),
      title: this.buildVariantTitle(variant.selectedOptions),
      selectedOptions:
        variant.selectedOptions?.map((option) => ({
          optionId: option.optionId,
          optionName: option.optionName,
          optionValue: option.optionValue,
          optionValueId: option.optionValueId,
        })) || [],
      price: this.formatPrice(variant.price),
      compareAtPrice: this.formatPrice(variant.compareAtPrice),
      cost: this.formatPrice(variant.cost),
      sku: variant.sku || "",
      barcode: variant.barcode || "",
      weight: variant.weight || 0,
      weightUnit: variant.weightUnit || "kg",
      inventoryQuantity: variant.inventoryQuantity || 0,
      inventoryPolicy: variant.inventoryPolicy || "deny",
      inventoryManagement: variant.inventoryManagement || "shopify",
      fulfillmentService: variant.fulfillmentService || "manual",
      requiresShipping: variant.requiresShipping !== false,
      taxable: variant.taxable !== false,
      inventoryLevels: variant.inventoryLevels || [],
      media: variant.media || { nodes: [] },
      harmonizedSystemCode: variant.harmonizedSystemCode || "",
      countryCodeOfOrigin: variant.countryCodeOfOrigin || "",
      active: variant.active !== false,
    }))
  }

  // le(...) - Serialize active variants into payload for API submission
  static serializeForAPI(variants, options = {}) {
    const { useGraphQL = true, includeInventory = true } = options

    return variants
      .filter((variant) => variant.active)
      .map((variant) => {
        const payload = {
          id: variant.id,
          price: this.parsePrice(variant.price),
          compareAtPrice: variant.compareAtPrice ? this.parsePrice(variant.compareAtPrice) : null,
          sku: variant.sku,
          barcode: variant.barcode,
          weight: Number.parseFloat(variant.weight) || 0,
          weightUnit: variant.weightUnit,
          requiresShipping: variant.requiresShipping,
          taxable: variant.taxable,
          inventoryPolicy: variant.inventoryPolicy,
          inventoryManagement: variant.inventoryManagement,
          fulfillmentService: variant.fulfillmentService,
        }

        if (useGraphQL) {
          payload.optionValues = variant.selectedOptions?.map((opt) => opt.optionValueId) || []
        } else {
          payload.options =
            variant.selectedOptions?.reduce((acc, opt) => {
              acc[opt.optionName.toLowerCase()] = opt.optionValue
              return acc
            }, {}) || {}
        }

        if (includeInventory && variant.inventoryLevels?.length) {
          payload.inventoryItem = {
            cost: variant.cost ? this.parsePrice(variant.cost) : null,
            harmonizedSystemCode: variant.harmonizedSystemCode,
            countryCodeOfOrigin: variant.countryCodeOfOrigin,
          }
        }

        if (variant.media?.nodes?.[0]) {
          payload.imageId = variant.media.nodes[0].id
        }

        return payload
      })
  }

  // U(old, updated) - Perform deep diff between variant objects
  static diffVariants(oldVariant, updatedVariant) {
    const diff = {}
    const keys = new Set([...Object.keys(oldVariant), ...Object.keys(updatedVariant)])

    for (const key of keys) {
      if (!this.deepEqual(oldVariant[key], updatedVariant[key])) {
        diff[key] = updatedVariant[key]
      }
    }

    return Object.keys(diff).length > 0 ? diff : null
  }

  // Helper functions
  static generateId() {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static buildVariantTitle(selectedOptions) {
    if (!selectedOptions?.length) return "Default Title"
    return selectedOptions.map((opt) => opt.optionValue).join(" / ")
  }

  static formatPrice(price) {
    if (!price) return "0.00"
    return Number.parseFloat(price).toFixed(2)
  }

  static parsePrice(priceString) {
    return Number.parseFloat(priceString) || 0
  }

  static deepEqual(a, b) {
    if (a === b) return true
    if (a == null || b == null) return false
    if (typeof a !== typeof b) return false
    if (typeof a !== "object") return false

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
      if (!keysB.includes(key)) return false
      if (!this.deepEqual(a[key], b[key])) return false
    }

    return true
  }

  // se(variants) - Check if any variant is tracked
  static hasTrackedVariants(variants) {
    return variants.some((variant) => variant.inventoryManagement === "shopify")
  }

  // ue(variants, locationId) - Check if any variant is tracked at specific location
  static hasTrackedVariantsAtLocation(variants, locationId) {
    return variants.some((variant) => variant.inventoryLevels?.some((level) => level.locationId === locationId))
  }

  // ce(product) - Get first variant from product
  static getFirstVariant(variants) {
    return variants?.[0] || null
  }
}

export default function ShopifyVariantManager({ variants, setVariants, basePrice, onClose }) {
  const [options, setOptions] = useState([])
  const [variantData, setVariantData] = useState([])
  const [editingVariant, setEditingVariant] = useState(null)
  const [bulkEditMode, setBulkEditMode] = useState(null)
  const [editingValue, setEditingValue] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(null)
  const [suggestionInput, setSuggestionInput] = useState("")
  const [showCustomValueModal, setShowCustomValueModal] = useState(null)
  const [customValueInput, setCustomValueInput] = useState("")
  const [variantImages, setVariantImages] = useState({})
  const [showImageSelector, setShowImageSelector] = useState(null)

  const optionSuggestions = {
    Size: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"],
    Color: [
      "Black",
      "White",
      "Red",
      "Blue",
      "Green",
      "Yellow",
      "Pink",
      "Purple",
      "Orange",
      "Brown",
      "Gray",
      "Navy",
      "Beige",
      "Maroon",
    ],
    Material: ["Cotton", "Polyester", "Silk", "Wool", "Linen", "Denim", "Leather", "Suede", "Canvas", "Velvet"],
    Style: ["Classic", "Modern", "Vintage", "Casual", "Formal", "Sporty", "Bohemian", "Minimalist"],
    Pattern: ["Solid", "Striped", "Polka Dot", "Floral", "Geometric", "Abstract", "Plaid", "Checkered"],
    Finish: ["Matte", "Glossy", "Satin", "Textured", "Smooth", "Brushed", "Polished"],
    Weight: ["Light", "Medium", "Heavy", "Ultra Light", "Extra Heavy"],
    Length: ["Short", "Medium", "Long", "Extra Long", "Mini", "Midi", "Maxi"],
    Width: ["Narrow", "Regular", "Wide", "Extra Wide"],
    Height: ["Low", "Medium", "High", "Extra High"],
  }

  const mockVariantImages = [
    { id: 1, name: "variant-red.jpg", url: "/product-display-1.png", alt: "Red variant" },
    { id: 2, name: "variant-blue.jpg", url: "/product-display-sleek.png", alt: "Blue variant" },
    { id: 3, name: "variant-green.jpg", url: "/video-thumbnail.png", alt: "Green variant" },
    { id: 4, name: "variant-black.jpg", url: "/abstract-3d-model.png", alt: "Black variant" },
  ]

  const selectVariantImage = (variantId, image) => {
    setVariantImages((prev) => ({
      ...prev,
      [variantId]: image,
    }))
    setShowImageSelector(null)
  }

  const removeVariantImage = (variantId) => {
    setVariantImages((prev) => {
      const updated = { ...prev }
      delete updated[variantId]
      return updated
    })
  }

  // Generate all possible variant combinations (Shopify style)
  const generateVariantCombinations = useMemo(() => {
    // Only generate combinations if we have options with both names and values
    const validOptions = options.filter((opt) => opt.name && opt.values.length > 0)
    if (validOptions.length === 0) return []

    const combinations = []
    const generate = (current, optionIndex) => {
      if (optionIndex === validOptions.length) {
        const selectedOptions = current.map((value, idx) => ({
          optionId: validOptions[idx].id,
          optionName: validOptions[idx].name,
          optionValue: value.value,
          optionValueId: value.id,
        }))

        combinations.push({
          id: ShopifyVariantProcessor.generateId(),
          selectedOptions,
          title: ShopifyVariantProcessor.buildVariantTitle(selectedOptions),
          price: basePrice,
          compareAtPrice: "",
          cost: "",
          sku: "",
          barcode: "",
          weight: 0,
          weightUnit: "kg",
          inventoryQuantity: 0,
          inventoryPolicy: "deny",
          inventoryManagement: "shopify",
          requiresShipping: true,
          taxable: true,
          active: true,
        })
        return
      }

      for (const value of validOptions[optionIndex].values) {
        current.push(value)
        generate(current, optionIndex + 1)
        current.pop()
      }
    }

    generate([], 0)
    return combinations
  }, [options, basePrice])

  useEffect(() => {
    setVariantData(generateVariantCombinations)
  }, [generateVariantCombinations])

  const addOption = () => {
    const newOption = {
      id: `opt${Date.now()}`,
      name: "",
      values: [],
    }
    setOptions([...options, newOption])
  }

  const updateOption = (optionId, field, value) => {
    setOptions(
      options.map((opt) => {
        if (opt.id === optionId) {
          // If changing the option name/type, clear existing values
          if (field === "name" && opt.name !== value) {
            return { ...opt, [field]: value, values: [] }
          }
          return { ...opt, [field]: value }
        }
        return opt
      }),
    )
  }

  const removeOption = (optionId) => {
    setOptions(options.filter((opt) => opt.id !== optionId))
  }

  const addOptionValue = (optionId, value) => {
    if (!value.trim()) return

    setOptions(
      options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              values: [
                ...opt.values,
                {
                  id: `val${Date.now()}`,
                  value: value.trim(),
                },
              ],
            }
          : opt,
      ),
    )
    setSuggestionInput("")
    setShowSuggestions(null)
  }

  const addSuggestedValues = (optionId, suggestedValues) => {
    const option = options.find((opt) => opt.id === optionId)
    const existingValues = option?.values.map((v) => v.value) || []
    const newValues = suggestedValues.filter((value) => !existingValues.includes(value))

    if (newValues.length === 0) return

    setOptions(
      options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              values: [
                ...opt.values,
                ...newValues.map((value) => ({
                  id: `val${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                  value: value,
                })),
              ],
            }
          : opt,
      ),
    )
    setShowSuggestions(null)
  }

  const removeOptionValue = (optionId, valueId) => {
    setOptions(
      options.map((opt) =>
        opt.id === optionId ? { ...opt, values: opt.values.filter((val) => val.id !== valueId) } : opt,
      ),
    )
  }

  const updateVariant = (variantId, field, value) => {
    setVariantData(variantData.map((variant) => (variant.id === variantId ? { ...variant, [field]: value } : variant)))
  }

  const bulkUpdateVariants = (field, value) => {
    setVariantData(variantData.map((variant) => ({ ...variant, [field]: value })))
    setBulkEditMode(null)
  }

  const toggleVariantActive = (variantId) => {
    setVariantData(
      variantData.map((variant) => (variant.id === variantId ? { ...variant, active: !variant.active } : variant)),
    )
  }

  const updateOptionValue = (optionId, valueId, newValue) => {
    if (!newValue.trim()) return

    setOptions(
      options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              values: opt.values.map((val) => (val.id === valueId ? { ...val, value: newValue.trim() } : val)),
            }
          : opt,
      ),
    )
  }

  return (
    <div className="space-y-5">
      {/* Options Management */}
      <div className="space-y-3">
        {options.map((option, optionIndex) => (
          <Card key={option.id} className="p-3 border border-gray-200 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Select value={option.name} onValueChange={(value) => updateOption(option.id, "name", value)}>
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue placeholder="Choose option type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Size">Size</SelectItem>
                    <SelectItem value="Color">Color</SelectItem>
                    <SelectItem value="Material">Material</SelectItem>
                    <SelectItem value="Style">Style</SelectItem>
                    <SelectItem value="Pattern">Pattern</SelectItem>
                    <SelectItem value="Finish">Finish</SelectItem>
                    <SelectItem value="Weight">Weight</SelectItem>
                    <SelectItem value="Length">Length</SelectItem>
                    <SelectItem value="Width">Width</SelectItem>
                    <SelectItem value="Height">Height</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(option.id)}
                  className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {option.values.map((value) => (
                  <div key={value.id} className="relative">
                    {editingValue === value.id ? (
                      <Input
                        defaultValue={value.value}
                        className="h-5 text-xs px-2 w-16"
                        autoFocus
                        onBlur={(e) => {
                          updateOptionValue(option.id, value.id, e.target.value)
                          setEditingValue(null)
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            updateOptionValue(option.id, value.id, e.target.value)
                            setEditingValue(null)
                          }
                          if (e.key === "Escape") {
                            setEditingValue(null)
                          }
                        }}
                      />
                    ) : (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 text-xs px-2 py-0.5 h-5"
                        onClick={() => setEditingValue(value.id)}
                      >
                        {value.value}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeOptionValue(option.id, value.id)
                          }}
                          className="h-2 w-2 p-0 text-gray-500 hover:text-red-600"
                        >
                          ×
                        </Button>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder={`Type custom ${option.name || "option"} value or choose from suggestions`}
                      value={suggestionInput === option.id ? suggestionInput : ""}
                      onChange={(e) => {
                        setSuggestionInput(e.target.value)
                        if (option.name && optionSuggestions[option.name] && e.target.value) {
                          setShowSuggestions(option.id)
                        } else {
                          setShowSuggestions(null)
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addOptionValue(option.id, e.target.value)
                        }
                      }}
                      onFocus={() => {
                        setSuggestionInput("")
                        if (option.name && optionSuggestions[option.name]) {
                          setShowSuggestions(option.id)
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow clicking on them
                        setTimeout(() => setShowSuggestions(null), 200)
                      }}
                      className="h-8 text-xs"
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions === option.id && option.name && optionSuggestions[option.name] && (
                      <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                        {/* Quick Add All Button */}
                        <div className="p-2 border-b bg-gray-50">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs bg-transparent h-7"
                            onClick={() => addSuggestedValues(option.id, optionSuggestions[option.name])}
                          >
                            Add all {option.name.toLowerCase()} options
                          </Button>
                        </div>

                        {/* Individual Suggestions */}
                        {optionSuggestions[option.name]
                          .filter((suggestion) => {
                            const existingValues = option.values.map((v) => v.value.toLowerCase())
                            return !existingValues.includes(suggestion.toLowerCase())
                          })
                          .filter((suggestion) =>
                            suggestionInput ? suggestion.toLowerCase().includes(suggestionInput.toLowerCase()) : true,
                          )
                          .map((suggestion) => (
                            <div
                              key={suggestion}
                              className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-xs flex items-center justify-between"
                              onClick={() => addOptionValue(option.id, suggestion)}
                            >
                              <span>{suggestion}</span>
                              <Plus className="h-3 w-3 text-gray-400" />
                            </div>
                          ))}

                        {/* Custom Value Addition - Replace the existing section */}
                        <div className="border-t bg-gray-50">
                          <div
                            className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-xs flex items-center justify-between font-medium text-blue-600"
                            onClick={() => {
                              setShowCustomValueModal(option.id)
                              setCustomValueInput("")
                            }}
                          >
                            <span>+ Add custom value</span>
                            <Plus className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.target.parentElement.parentElement.querySelector("input")
                      addOptionValue(option.id, input.value)
                    }}
                    className="h-8 text-xs px-3"
                  >
                    Add
                  </Button>
                </div>

                {/* Enhanced hint text */}
                {option.name && optionSuggestions[option.name] && option.values.length === 0 && (
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p>💡 Click in the input field to see suggested {option.name.toLowerCase()} options</p>
                    <p>✏️ You can also type any custom value and press Enter to add it</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {/* Add the "Add option" button here, after all option cards */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={addOption} className="gap-2 bg-transparent h-8 text-xs px-3">
            <Plus className="h-3 w-3" />
            Add option
          </Button>
        </div>
      </div>

      {/* Variants Table */}
      {variantData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-gray-700">
              Variants ({variantData.filter((v) => v.active).length} of {variantData.length})
            </Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setBulkEditMode("price")} className="h-7 text-xs px-3">
                Bulk edit prices
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkEditMode("inventory")}
                className="h-7 text-xs px-3"
              >
                Bulk edit inventory
              </Button>
            </div>
          </div>

          {/* Bulk Edit Modal */}
          {bulkEditMode && (
            <Card className="p-3 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-4">
                <Label className="text-xs font-medium">
                  {bulkEditMode === "price" ? "Set price for all variants:" : "Set inventory for all variants:"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={bulkEditMode === "price" ? "0.00" : "0"}
                    className="w-24 h-7 text-xs"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        bulkUpdateVariants(bulkEditMode === "price" ? "price" : "inventoryQuantity", e.target.value)
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={(e) => {
                      const input = e.target.parentElement.querySelector("input")
                      bulkUpdateVariants(bulkEditMode === "price" ? "price" : "inventoryQuantity", input.value)
                    }}
                    className="h-7 text-xs px-3"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkEditMode(null)}
                    className="h-7 text-xs px-3"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Variants Grid */}
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-3 py-2 border-b">
              <div className="grid grid-cols-9 gap-3 text-xs font-medium text-gray-700">
                <div>Image</div>
                <div>Variant</div>
                <div>Price</div>
                <div>Quantity</div>
                <div>SKU</div>
                <div>Barcode</div>
                <div>Weight</div>
                <div>HS Code</div>
                <div>Active</div>
              </div>
            </div>

            <div className="divide-y max-h-80 overflow-y-auto">
              {variantData.map((variant) => (
                <div key={variant.id} className={`px-3 py-2 ${!variant.active ? "bg-gray-50 opacity-60" : ""}`}>
                  <div className="grid grid-cols-9 gap-3 items-center">
                    <div className="flex items-center">
                      {variantImages[variant.id] ? (
                        <div className="relative group">
                          <img
                            src={variantImages[variant.id].url || "/placeholder.svg"}
                            alt={variantImages[variant.id].alt}
                            className="w-8 h-8 object-cover rounded border"
                          />
                          <button
                            onClick={() => removeVariantImage(variant.id)}
                            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowImageSelector(variant.id)}
                          className="w-8 h-8 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-gray-400 transition-colors"
                        >
                          <Plus className="h-3 w-3 text-gray-400" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs font-medium">{variant.title}</div>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">Rs.</span>
                      <Input
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
                        className="pl-6 h-7 text-xs"
                      />
                    </div>
                    <Input
                      value={variant.inventoryQuantity}
                      onChange={(e) => updateVariant(variant.id, "inventoryQuantity", e.target.value)}
                      className="h-7 text-xs"
                      type="number"
                    />
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                      placeholder="SKU"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={variant.barcode}
                      onChange={(e) => updateVariant(variant.id, "barcode", e.target.value)}
                      placeholder="Barcode"
                      className="h-7 text-xs"
                    />
                    <div className="flex gap-1">
                      <Input
                        value={variant.weight}
                        onChange={(e) => updateVariant(variant.id, "weight", e.target.value)}
                        className="h-7 text-xs w-12"
                        type="number"
                        step="0.1"
                      />
                      <Select
                        value={variant.weightUnit}
                        onValueChange={(value) => updateVariant(variant.id, "weightUnit", value)}
                      >
                        <SelectTrigger className="h-7 w-10 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                          <SelectItem value="oz">oz</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input
                      value={variant.harmonizedSystemCode || ""}
                      onChange={(e) => updateVariant(variant.id, "harmonizedSystemCode", e.target.value)}
                      placeholder="HS Code"
                      className="h-7 text-xs"
                    />
                    <Checkbox checked={variant.active} onCheckedChange={() => toggleVariantActive(variant.id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shopify-style Summary */}
          <div className="text-xs text-gray-600 space-y-0.5">
            <p>• {variantData.filter((v) => v.active).length} active variants</p>
            <p>
              •{" "}
              {ShopifyVariantProcessor.hasTrackedVariants(variantData)
                ? "Inventory tracking enabled"
                : "No inventory tracking"}
            </p>
            <p>• Total combinations: {variantData.length}</p>
          </div>
        </div>
      )}

      {/* Image Selector Modal */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Select image for variant: {variantData.find((v) => v.id === showImageSelector)?.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowImageSelector(null)}
                  className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {mockVariantImages.map((image) => (
                  <div
                    key={image.id}
                    className="cursor-pointer group"
                    onClick={() => selectVariantImage(showImageSelector, image)}
                  >
                    <div className="aspect-square border rounded-lg overflow-hidden bg-gray-100 group-hover:border-blue-400 transition-colors">
                      <img
                        src={image.url || "/placeholder.svg"}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-600 truncate text-center">{image.name}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowImageSelector(null)} className="h-7 text-xs px-3">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Value Modal */}
      {showCustomValueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Add custom {options.find((opt) => opt.id === showCustomValueModal)?.name?.toLowerCase() || "option"}{" "}
                value
              </h3>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="custom-value-input" className="text-xs font-medium text-gray-700">
                    Value
                  </Label>
                  <Input
                    id="custom-value-input"
                    value={customValueInput}
                    onChange={(e) => setCustomValueInput(e.target.value)}
                    placeholder={`Enter custom ${options.find((opt) => opt.id === showCustomValueModal)?.name?.toLowerCase() || "option"} value`}
                    className="mt-1 h-8 text-xs"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && customValueInput.trim()) {
                        addOptionValue(showCustomValueModal, customValueInput.trim())
                        setShowCustomValueModal(null)
                        setCustomValueInput("")
                      }
                    }}
                  />
                </div>

                <div className="text-xs text-gray-500">
                  This value will be added to your{" "}
                  {options.find((opt) => opt.id === showCustomValueModal)?.name?.toLowerCase() || "option"} options.
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCustomValueModal(null)
                    setCustomValueInput("")
                  }}
                  className="h-7 text-xs px-3"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (customValueInput.trim()) {
                      addOptionValue(showCustomValueModal, customValueInput.trim())
                      setShowCustomValueModal(null)
                      setCustomValueInput("")
                    }
                  }}
                  disabled={!customValueInput.trim()}
                  className="h-7 text-xs px-3"
                >
                  Add value
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { ShopifyVariantManager }
