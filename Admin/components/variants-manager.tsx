"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, ChevronDown, Edit, Plus, Trash2, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { API_BASE_URL } from "@/lib/api"

// Define types for options and variants
interface OptionType {
  id: string
  name: string
}

interface ProductOption {
  type: string
  values: string[]
}

interface VariantOption {
  name: string
  value: string
}

interface ProductVariant {
  id: string
  title: string
  price: number
  sku: string
  inventory: number
  options: VariantOption[]
  isDeleted?: boolean
}

interface VariantsManagerProps {
  initialOptions?: ProductOption[]
  initialVariants?: ProductVariant[]
  onOptionsChange?: (options: ProductOption[]) => void
  onVariantsChange?: (variants: ProductVariant[]) => void
  shopId?: string | number
}

export function VariantsManager({
  initialOptions = [],
  initialVariants = [],
  onOptionsChange,
  onVariantsChange,
  shopId,
}: VariantsManagerProps) {
  const [optionTypes, setOptionTypes] = useState<OptionType[]>([])
  const [options, setOptions] = useState<ProductOption[]>(initialOptions.length ? initialOptions : [])
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletedVariantIds, setDeletedVariantIds] = useState<Set<string>>(new Set())
  const [newVariant, setNewVariant] = useState<{ [key: string]: string }>({})
  const [unusedValues, setUnusedValues] = useState<{ option: string; values: string[] }[]>([])
  const [showUnusedValuesAlert, setShowUnusedValuesAlert] = useState(false)
  const [isAddVariantDialogOpen, setIsAddVariantDialogOpen] = useState(false)

  // Fetch option types from API
  useEffect(() => {
    const fetchOptionTypes = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/option_type_sets`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token')
            // Note: We can't use toast or router here as they're not available in this component
            // The parent component should handle this
            throw new Error('Session expired')
          }
          throw new Error("Failed to fetch option types")
        }

        const data = await response.json()
        setOptionTypes(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching option types:", err)
        if (err instanceof Error && err.message === 'Session expired') {
          setError("Session expired. Please refresh the page to login again.")
        } else {
          setError("Failed to load option types. Please refresh and try again.")
        }
        // Remove the fallback option types
        setOptionTypes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOptionTypes()
  }, [shopId])

  // Automatically generate variants when options change
  useEffect(() => {
    generateVariants()
  }, [options])

  // Check for unused option values when variants change
  useEffect(() => {
    findUnusedOptionValues()
  }, [variants, options])

  // Notify parent component when options or variants change
  useEffect(() => {
    if (onOptionsChange) {
      onOptionsChange(options)
    }
  }, [options, onOptionsChange])

  useEffect(() => {
    if (onVariantsChange) {
      onVariantsChange(variants)
    }
  }, [variants, onVariantsChange])

  // Find option values that aren't used in any variant
  const findUnusedOptionValues = () => {
    // Only check if we have variants
    if (variants.length === 0) {
      setUnusedValues([])
      setShowUnusedValuesAlert(false)
      return
    }

    const usedValues: { [key: string]: Set<string> } = {}

    // Initialize with all options
    options.forEach((option) => {
      if (option.type) {
        usedValues[option.type] = new Set()
      }
    })

    // Add all values used in variants
    variants.forEach((variant) => {
      variant.options.forEach((opt) => {
        if (usedValues[opt.name]) {
          usedValues[opt.name].add(opt.value)
        }
      })
    })

    // Find unused values
    const unused: { option: string; values: string[] }[] = []

    options.forEach((option) => {
      if (!option.type) return

      const unusedForOption = option.values.filter(
        (value) => value.trim() !== "" && !usedValues[option.type].has(value),
      )

      if (unusedForOption.length > 0) {
        unused.push({
          option: option.type,
          values: unusedForOption,
        })
      }
    })

    setUnusedValues(unused)
    setShowUnusedValuesAlert(unused.length > 0)
  }

  // Add a new option
  const addOption = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission

    // Limit to maximum 3 options
    if (options.length >= 3) {
      return
    }

    setOptions([...options, { type: "", values: [""] }])
  }

  // Handle the initial "Add Variant" button click
  const handleAddVariantClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling to form

    // If no options exist, add the first option
    if (options.length === 0) {
      setOptions([{ type: "", values: [""] }])
    } else if (options.some((option) => option.type && option.values.some((value) => value.trim() !== ""))) {
      // If we have valid options with values, open the dialog
      setIsAddVariantDialogOpen(true)
    } else {
      // Focus on the first empty option type
      const firstEmptyOptionIndex = options.findIndex((option) => !option.type)
      if (firstEmptyOptionIndex >= 0 && document.querySelector(`[data-option-index="${firstEmptyOptionIndex}"]`)) {
        ;(document.querySelector(`[data-option-index="${firstEmptyOptionIndex}"]`) as HTMLElement)?.focus()
      }
    }
  }

  // Remove an option
  const removeOption = (optionIndex: number) => {
    const newOptions = [...options]
    newOptions.splice(optionIndex, 1)
    setOptions(newOptions)
  }

  // Update option type
  const updateOptionType = (optionIndex: number, type: string) => {
    const newOptions = [...options]
    newOptions[optionIndex].type = type
    setOptions(newOptions)
  }

  // Add a value to an option
  const addOptionValue = (optionIndex: number) => {
    const newOptions = [...options]
    newOptions[optionIndex].values.push("")
    setOptions(newOptions)
  }

  // Update option value
  const updateOptionValue = (optionIndex: number, valueIndex: number, value: string) => {
    const newOptions = [...options]
    newOptions[optionIndex].values[valueIndex] = value
    setOptions(newOptions)
  }

  // Handle key press in option value input
  const handleKeyPress = (e: React.KeyboardEvent, optionIndex: number, valueIndex: number) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const newOptions = [...options]
      // Only add new field if current field has a value
      if (newOptions[optionIndex].values[valueIndex].trim() !== "") {
        newOptions[optionIndex].values.push("")
        setOptions(newOptions)
        // Focus will be set by useEffect below
      }
    }
  }

  // Remove a value from an option
  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const newOptions = [...options]
    const valueToRemove = newOptions[optionIndex].values[valueIndex]

    // Don't allow removing the last value field
    if (newOptions[optionIndex].values.length <= 1) {
      // If it has content, just clear it instead of removing
      if (newOptions[optionIndex].values[valueIndex] !== "") {
        newOptions[optionIndex].values[valueIndex] = ""
        setOptions(newOptions)
      }
      return
    }

    // Check if this value is used in any variants
    if (valueToRemove.trim() !== "") {
      const isValueUsed = variants.some((variant) =>
        variant.options.some((opt) => opt.name === newOptions[optionIndex].type && opt.value === valueToRemove),
      )

      if (isValueUsed) {
        alert(`Cannot remove "${valueToRemove}" as it's used in one or more variants.`)
        return
      }
    }

    newOptions[optionIndex].values.splice(valueIndex, 1)
    setOptions(newOptions)
  }

  // Check if an option type is already selected in another dropdown
  const isOptionTypeUsed = (type: string, currentIndex: number) => {
    return options.some((option, index) => index !== currentIndex && option.type === type && type !== "")
  }

  // Generate all possible variants based on options
  const generateVariants = () => {
    // Filter out empty values and options without types
    const validOptions = options
      .filter((option) => option.type !== "")
      .map((option) => ({
        ...option,
        values: option.values.filter((value) => value.trim() !== ""),
      }))
      .filter((option) => option.values.length > 0)

    // Only generate if we have valid options
    if (validOptions.length === 0) {
      setVariants([])
      return
    }

    // Get all possible combinations of option values
    const generateCombinations = (optionIndex: number, currentCombination: VariantOption[] = []): VariantOption[][] => {
      if (optionIndex >= validOptions.length) {
        return [currentCombination]
      }

      const currentOption = validOptions[optionIndex]
      const combinations: VariantOption[][] = []

      for (const value of currentOption.values) {
        const newCombination = [...currentCombination, { name: currentOption.type, value }]
        combinations.push(...generateCombinations(optionIndex + 1, newCombination))
      }

      return combinations
    }

    const optionCombinations = generateCombinations(0)

    // Create variants from combinations
    const newVariants = optionCombinations
      .map((combination) => {
        // Create a unique key for this combination - FIX: Added null checks and default values
        const combinationKey = combination
          .filter((opt) => opt && opt.name && opt.value) // Filter out any invalid options
          .sort((a, b) => {
            // Safe sort with null checks
            const nameA = a?.name || ""
            const nameB = b?.name || ""
            return nameA.localeCompare(nameB)
          })
          .map((opt) => `${opt.name || ""}:${opt.value || ""}`)
          .join("|")

        // If we don't have a valid combination key, skip this variant
        if (!combinationKey) {
          return null
        }

        // Check if this variant was manually deleted
        const variantId = `new-${combinationKey}`
        if (deletedVariantIds.has(variantId)) {
          return null
        }

        // Check if this variant already exists
        const existingVariant = variants.find((variant) => {
          if (!variant.options || variant.options.length !== combination.length) return false

          // Check if all options match
          return combination.every((comb) =>
            variant.options.some((opt) => opt && comb && opt.name === comb.name && opt.value === comb.value),
          )
        })

        if (existingVariant) {
          return existingVariant
        }

        // Create a new variant
        return {
          id: variantId,
          title: combination
            .filter((opt) => opt && opt.value) // Filter out invalid options
            .map((opt) => opt.value)
            .join(" / "),
          price: 0,
          sku: "",
          inventory: 0,
          options: combination,
        }
      })
      .filter(Boolean) as ProductVariant[]

    setVariants(newVariants)
  }

  // Update a variant
  const updateVariant = (index: number, field: string, value: string | number) => {
    const newVariants = [...variants]
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    }
    setVariants(newVariants)
  }

  // Delete a variant
  const deleteVariant = (index: number) => {
    const variantToDelete = variants[index]

    // Add to deleted variants set to prevent regeneration
    setDeletedVariantIds((prev) => {
      const newSet = new Set(prev)
      newSet.add(variantToDelete.id)
      return newSet
    })

    // Remove from variants array
    const newVariants = [...variants]
    newVariants.splice(index, 1)
    setVariants(newVariants)

    // Check for unused option values
    findUnusedOptionValues()
  }

  // Clean up unused option values
  const cleanupUnusedValues = () => {
    const newOptions = [...options]

    unusedValues.forEach(({ option, values }) => {
      const optionIndex = newOptions.findIndex((opt) => opt.type === option)
      if (optionIndex >= 0) {
        newOptions[optionIndex].values = newOptions[optionIndex].values.filter(
          (value) => !values.includes(value) || value === "",
        )
      }
    })

    setOptions(newOptions)
    setUnusedValues([])
    setShowUnusedValuesAlert(false)
  }

  // Add a variant manually
  const addVariantManually = (e: React.MouseEvent) => {
    e.preventDefault()

    // Check if all options have values selected
    const hasAllOptions = options
      .filter((option) => option.type !== "")
      .every((option) => newVariant[option.type] !== undefined)

    if (!hasAllOptions) {
      alert("Please select a value for each option")
      return
    }

    const variantOptions: VariantOption[] = []

    options.forEach((option) => {
      if (option.type && newVariant[option.type]) {
        variantOptions.push({
          name: option.type,
          value: newVariant[option.type],
        })
      }
    })

    // Check if this variant already exists
    const variantExists = variants.some((variant) => {
      if (variant.options.length !== variantOptions.length) return false

      // Check if all options match
      return variantOptions.every((newOpt) =>
        variant.options.some((opt) => opt.name === newOpt.name && opt.value === newOpt.value),
      )
    })

    if (variantExists) {
      alert("This variant already exists")
      return
    }

    const newVariantItem: ProductVariant = {
      id: `manual-${Date.now()}`,
      title: variantOptions.map((opt) => opt.value).join(" / "),
      price: 0,
      sku: "",
      inventory: 0,
      options: variantOptions,
    }

    setVariants([...variants, newVariantItem])
    setNewVariant({})
    setIsAddVariantDialogOpen(false)
  }

  // Focus reference for the last added input field
  const lastInputRef = useRef<HTMLInputElement>(null)

  // Focus the last input field when a new one is added
  useEffect(() => {
    if (lastInputRef.current) {
      lastInputRef.current.focus()
    }
  }, [options])

  return (
    <div className="space-y-6">
      {options.length === 0 ? (
        // Show simplified UI when no options exist
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">No variants added yet</h3>
          <p className="text-muted-foreground mb-4">Add variants like size, color, or material to your product.</p>
          <Button onClick={handleAddVariantClick} type="button" className="inline-flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Add Option
          </Button>
        </div>
      ) : (
        // Show full variant management UI when options exist
        <>
          <div className="text-sm font-medium mb-2">Options</div>

          {options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-4 py-3 border-t border-gray-100">
              <div className="w-56 flex items-center gap-2">
                <Select
                  value={option.type}
                  onValueChange={(value) => updateOptionType(optionIndex, value)}
                  disabled={isLoading}
                >
                  <SelectTrigger data-option-index={optionIndex}>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    {optionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name} disabled={isOptionTypeUsed(type.name, optionIndex)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    removeOption(optionIndex)
                  }}
                  className="h-9 w-9"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 flex flex-wrap gap-2">
                {option.values.map((value, valueIndex) => {
                  const isLastEmptyField =
                    valueIndex === option.values.length - 1 && value === "" && option.values.some((v) => v !== "")

                  const showDeleteButton = value !== "" || option.values.length > 1

                  return (
                    <div key={valueIndex} className="flex items-center">
                      <Input
                        ref={
                          optionIndex === options.length - 1 && valueIndex === option.values.length - 1
                            ? lastInputRef
                            : null
                        }
                        value={value}
                        onChange={(e) => updateOptionValue(optionIndex, valueIndex, e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, optionIndex, valueIndex)}
                        placeholder="Value"
                        className="w-40"
                      />

                      {showDeleteButton && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.preventDefault()
                            removeOptionValue(optionIndex, valueIndex)
                          }}
                          className="h-9 w-9"
                          type="button"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={addOption} className="mt-4" type="button" disabled={options.length >= 3}>
              <Plus className="mr-2 h-4 w-4" />
              Add option {options.length >= 3 ? "(Max reached)" : ""}
            </Button>

            {variants.length > 0 && (
              <Button onClick={handleAddVariantClick} type="button" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            )}
          </div>

          {showUnusedValuesAlert && (
            <Alert variant="warning" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unused option values detected</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  {unusedValues.map((item, i) => (
                    <div key={i}>
                      <span className="font-medium">{item.option}:</span> {item.values.join(", ")}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={cleanupUnusedValues} type="button">
                  Remove unused values
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Separator className="my-4" />

          <Dialog open={isAddVariantDialogOpen} onOpenChange={setIsAddVariantDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Variant</DialogTitle>
                <DialogDescription>Create a custom variant by selecting option values.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {options
                  .filter((option) => option.type !== "")
                  .map((option, index) => (
                    <div key={index} className="grid grid-cols-4 items-center gap-4">
                      <label className="text-right font-medium">{option.type}:</label>
                      <div className="col-span-3">
                        <Select
                          onValueChange={(value) => setNewVariant({ ...newVariant, [option.type]: value })}
                          value={newVariant[option.type] || ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${option.type}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {option.values
                              .filter((value) => value.trim() !== "")
                              .map((value, i) => (
                                <SelectItem key={i} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
              </div>

              <DialogFooter>
                <Button onClick={addVariantManually} type="button">
                  Add Variant
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {variants.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Variants ({variants.length})</div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Inventory</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((variant, index) => (
                      <TableRow key={variant.id}>
                        <TableCell className="font-medium">{variant.title}</TableCell>
                        <TableCell>
                          <div className="relative w-24">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="pl-7"
                              value={variant.price}
                              onChange={(e) => updateVariant(index, "price", Number.parseFloat(e.target.value))}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="SKU"
                            value={variant.sku}
                            onChange={(e) => updateVariant(index, "sku", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Quantity"
                            className="w-24"
                            value={variant.inventory}
                            onChange={(e) => updateVariant(index, "inventory", Number.parseInt(e.target.value))}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0" type="button">
                                <span className="sr-only">Open menu</span>
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.preventDefault()
                                  // Edit functionality would go here
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={(e) => {
                                  e.preventDefault()
                                  deleteVariant(index)
                                }}
                              >
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
            </div>
          )}
        </>
      )}
    </div>
  )
}