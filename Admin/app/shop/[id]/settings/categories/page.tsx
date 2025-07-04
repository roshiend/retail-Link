"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, FolderOpen, Folder, X } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"
import { useParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { CsvUpload } from "@/components/csv-upload"

interface Category {
  id: number
  name: string
  code: string
  description?: string
  active: boolean
  subcategories: Subcategory[]
}

interface Subcategory {
  id: number
  name: string
  code: string
  description?: string
  active: boolean
  category_id: number
}

interface SubcategoryFormData {
  name: string
  code: string
  description: string
  active: boolean
}

export default function CategoriesPage() {
  const params = useParams()
  const shopId = params.id as string
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState<Record<string, any>>({})
  const [subcategoriesFormData, setSubcategoriesFormData] = useState<SubcategoryFormData[]>([])
  const [editingSubcategories, setEditingSubcategories] = useState<Subcategory[]>([])

  const categoryFields = [
    { name: "name", label: "Category Name", type: "text" as const, required: true },
    { name: "code", label: "Category Code", type: "text" as const, required: true },
    { name: "description", label: "Category Description", type: "textarea" as const },
    { name: "active", label: "Category Active", type: "switch" as const },
  ]

  const subcategoryFields = [
    { name: "name", label: "Subcategory Name", type: "text" as const, required: true },
    { name: "code", label: "Subcategory Code", type: "text" as const, required: true },
    { name: "description", label: "Subcategory Description", type: "textarea" as const },
    { name: "active", label: "Subcategory Active", type: "switch" as const },
  ]

  const templateFields = ["category_name", "category_code", "category_description", "category_active", "subcategory_name", "subcategory_code", "subcategory_description", "subcategory_active"]

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch categories')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [shopId])

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        })
        return
      }

      // First, create the category
      const categoryResponse = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(categoryFormData),
      })

      if (!categoryResponse.ok) {
        const errorData = await categoryResponse.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create category")
      }

      const createdCategory = await categoryResponse.json()
      let subcategoriesCreated = 0

      // Then create subcategories if any
      if (subcategoriesFormData.length > 0) {
        for (const subcategoryData of subcategoriesFormData) {
          const subcategoryResponse = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${createdCategory.id}/subcategories`, {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(subcategoryData),
          })

          if (subcategoryResponse.ok) {
            subcategoriesCreated++
          }
        }
      }

      toast({
        title: "Success",
        description: `Category created successfully${subcategoriesCreated > 0 ? ` with ${subcategoriesCreated} subcategories` : ''}`,
      })
      
      setIsCreateDialogOpen(false)
      setCategoryFormData({})
      setSubcategoriesFormData([])
      fetchCategories()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingCategory) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        })
        return
      }

      // First, update the category
      const categoryResponse = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(categoryFormData),
      })

      if (!categoryResponse.ok) {
        const errorData = await categoryResponse.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update category")
      }

      let subcategoriesUpdated = 0
      let subcategoriesCreated = 0

      // Then handle subcategory updates
      if (editingSubcategories.length > 0) {
        for (const subcategory of editingSubcategories) {
          if (subcategory.id === 0) {
            // Create new subcategory
            const subcategoryResponse = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${editingCategory.id}/subcategories`, {
              method: "POST",
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                name: subcategory.name,
                code: subcategory.code,
                description: subcategory.description,
                active: subcategory.active
              }),
            })

            if (subcategoryResponse.ok) {
              subcategoriesCreated++
            }
          } else {
            // Update existing subcategory
            const subcategoryResponse = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${editingCategory.id}/subcategories/${subcategory.id}`, {
              method: "PUT",
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                name: subcategory.name,
                code: subcategory.code,
                description: subcategory.description,
                active: subcategory.active
              }),
            })

            if (subcategoryResponse.ok) {
              subcategoriesUpdated++
            }
          }
        }
      }

      const successMessage = `Category updated successfully${
        subcategoriesCreated > 0 || subcategoriesUpdated > 0 
          ? ` (${subcategoriesCreated} new, ${subcategoriesUpdated} updated subcategories)` 
          : ''
      }`

      toast({
        title: "Success",
        description: successMessage,
      })
      
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      setCategoryFormData({})
      setEditingSubcategories([])
      fetchCategories()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
        fetchCategories()
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete category")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      code: category.code,
      description: category.description || "",
      active: category.active,
    })
    // Load existing subcategories for editing
    setEditingSubcategories(category.subcategories || [])
    setIsEditDialogOpen(true)
  }

  const addSubcategory = () => {
    setSubcategoriesFormData([
      ...subcategoriesFormData,
      {
        name: "",
        code: "",
        description: "",
        active: true
      }
    ])
  }

  const removeSubcategory = (index: number) => {
    setSubcategoriesFormData(subcategoriesFormData.filter((_, i) => i !== index))
  }

  const updateSubcategory = (index: number, field: string, value: any) => {
    const updated = [...subcategoriesFormData]
    updated[index] = { ...updated[index], [field]: value }
    setSubcategoriesFormData(updated)
  }

  const addEditingSubcategory = () => {
    setEditingSubcategories([
      ...editingSubcategories,
      {
        id: 0, // Temporary ID for new subcategory
        name: "",
        code: "",
        description: "",
        active: true,
        category_id: editingCategory?.id || 0
      }
    ])
  }

  const removeEditingSubcategory = (index: number) => {
    setEditingSubcategories(editingSubcategories.filter((_, i) => i !== index))
  }

  const updateEditingSubcategory = (index: number, field: string, value: any) => {
    const updated = [...editingSubcategories]
    updated[index] = { ...updated[index], [field]: value }
    setEditingSubcategories(updated)
  }

  const renderField = (field: any, data: Record<string, any>, onChange: (field: string, value: any) => void) => {
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.name}
            value={data[field.name] || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.name}
              checked={data[field.name] || false}
              onCheckedChange={(checked) => onChange(field.name, checked)}
            />
            <Label htmlFor={field.name}>{field.label}</Label>
          </div>
        )
      default:
        return (
          <Input
            id={field.name}
            type="text"
            value={data[field.name] || ""}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage your product categories and subcategories</p>
        </div>
        <div className="flex items-center space-x-2">
          <CsvUpload
            title="Categories"
            endpoint="categories"
            shopId={shopId}
            templateFields={templateFields}
            onSuccess={fetchCategories}
          />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>
                  Create a new category. You can optionally add subcategories at the same time.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                {/* Category Fields */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Category Information</CardTitle>
                    <CardDescription>Basic information for the new category</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {categoryFields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name}>
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {renderField(field, categoryFormData, (fieldName, value) => 
                          setCategoryFormData({ ...categoryFormData, [fieldName]: value })
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Subcategories Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Subcategories (Optional)</CardTitle>
                        <CardDescription>Add subcategories to this category</CardDescription>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={addSubcategory}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Subcategory
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subcategoriesFormData.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No subcategories added yet. Click "Add Subcategory" to add one.
                      </p>
                    ) : (
                      subcategoriesFormData.map((subcategory, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Subcategory {index + 1}</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSubcategory(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subcategoryFields.map((field) => (
                              <div key={field.name} className="space-y-2">
                                <Label htmlFor={`${field.name}-${index}`}>
                                  {field.label} {field.required && <span className="text-red-500">*</span>}
                                </Label>
                                {renderField(field, subcategory, (fieldName, value) => 
                                  updateSubcategory(index, fieldName, value)
                                )}
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
              <DialogFooter className="flex-shrink-0">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            Manage your categories. You can create, edit, and delete items.
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Subcategories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-mono">{category.code}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || "-"}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      {category.subcategories?.length || 0} subcategories
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      category.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {category.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the category and all its subcategories.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information and manage its subcategories.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 overflow-y-auto flex-1 pr-2">
            {/* Category Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Information</CardTitle>
                <CardDescription>Update basic information for the category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {renderField(field, categoryFormData, (fieldName, value) => 
                      setCategoryFormData({ ...categoryFormData, [fieldName]: value })
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Subcategories Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Subcategories</CardTitle>
                    <CardDescription>Manage subcategories for this category</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addEditingSubcategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subcategory
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingSubcategories.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No subcategories. Click "Add Subcategory" to add one.
                  </p>
                ) : (
                  editingSubcategories.map((subcategory, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">
                          {subcategory.id === 0 ? 'New Subcategory' : `Subcategory ${index + 1}`}
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeEditingSubcategory(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subcategoryFields.map((field) => (
                          <div key={field.name} className="space-y-2">
                            <Label htmlFor={`${field.name}-${index}`}>
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </Label>
                            {renderField(field, subcategory, (fieldName, value) => 
                              updateEditingSubcategory(index, fieldName, value)
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 