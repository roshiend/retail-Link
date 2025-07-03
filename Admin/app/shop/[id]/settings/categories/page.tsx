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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Search, FolderOpen, Folder } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"
import { useParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"

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

export default function CategoriesPage() {
  const params = useParams()
  const shopId = params.id as string
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] = useState(false)
  const [isCreateSubcategoryDialogOpen, setIsCreateSubcategoryDialogOpen] = useState(false)
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false)
  const [isEditSubcategoryDialogOpen, setIsEditSubcategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [categoryFormData, setCategoryFormData] = useState<Record<string, any>>({})
  const [subcategoryFormData, setSubcategoryFormData] = useState<Record<string, any>>({})

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [shopId])

  const handleCreateCategory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryFormData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category created successfully",
        })
        setIsCreateCategoryDialogOpen(false)
        setCategoryFormData({})
        fetchCategories()
      } else {
        throw new Error("Failed to create category")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    }
  }

  const handleCreateSubcategory = async () => {
    if (!selectedCategoryId) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${selectedCategoryId}/subcategories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subcategoryFormData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subcategory created successfully",
        })
        setIsCreateSubcategoryDialogOpen(false)
        setSubcategoryFormData({})
        fetchCategories()
      } else {
        throw new Error("Failed to create subcategory")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subcategory",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryFormData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category updated successfully",
        })
        setIsEditCategoryDialogOpen(false)
        setEditingCategory(null)
        setCategoryFormData({})
        fetchCategories()
      } else {
        throw new Error("Failed to update category")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${editingSubcategory.category_id}/subcategories/${editingSubcategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subcategoryFormData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subcategory updated successfully",
        })
        setIsEditSubcategoryDialogOpen(false)
        setEditingSubcategory(null)
        setSubcategoryFormData({})
        fetchCategories()
      } else {
        throw new Error("Failed to update subcategory")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subcategory",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Category deleted successfully",
        })
        fetchCategories()
      } else {
        throw new Error("Failed to delete category")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubcategory = async (categoryId: number, subcategoryId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${categoryId}/subcategories/${subcategoryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subcategory deleted successfully",
        })
        fetchCategories()
      } else {
        throw new Error("Failed to delete subcategory")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subcategory",
        variant: "destructive",
      })
    }
  }

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      code: category.code,
      description: category.description || "",
      active: category.active,
    })
    setIsEditCategoryDialogOpen(true)
  }

  const openEditSubcategoryDialog = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory)
    setSubcategoryFormData({
      name: subcategory.name,
      code: subcategory.code,
      description: subcategory.description || "",
      active: subcategory.active,
    })
    setIsEditSubcategoryDialogOpen(true)
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
          <h2 className="text-2xl font-bold tracking-tight">Categories & Subcategories</h2>
          <p className="text-muted-foreground">Organize products with categories and subcategories</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCreateCategoryDialogOpen} onOpenChange={setIsCreateCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize your products.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={categoryFormData.name || ""}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    placeholder="Enter category name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={categoryFormData.code || ""}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value })}
                    placeholder="Enter category code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={categoryFormData.description || ""}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    placeholder="Enter category description"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={categoryFormData.active || false}
                    onCheckedChange={(checked) => setCategoryFormData({ ...categoryFormData, active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCategory}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateSubcategoryDialogOpen} onOpenChange={setIsCreateSubcategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Subcategory
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Subcategory</DialogTitle>
                <DialogDescription>
                  Add a new subcategory to a category.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={selectedCategoryId || ""}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory-name">Name *</Label>
                  <Input
                    id="subcategory-name"
                    value={subcategoryFormData.name || ""}
                    onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                    placeholder="Enter subcategory name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory-code">Code *</Label>
                  <Input
                    id="subcategory-code"
                    value={subcategoryFormData.code || ""}
                    onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, code: e.target.value })}
                    placeholder="Enter subcategory code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategory-description">Description</Label>
                  <Textarea
                    id="subcategory-description"
                    value={subcategoryFormData.description || ""}
                    onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                    placeholder="Enter subcategory description"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="subcategory-active"
                    checked={subcategoryFormData.active || false}
                    onCheckedChange={(checked) => setSubcategoryFormData({ ...subcategoryFormData, active: checked })}
                  />
                  <Label htmlFor="subcategory-active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateSubcategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSubcategory}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            Manage your categories and subcategories. You can create, edit, and delete items.
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
                  <TableCell>{category.subcategories?.length || 0}</TableCell>
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
                        onClick={() => openEditCategoryDialog(category)}
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
                            <AlertDialogAction onClick={() => handleDeleteCategory(category.id)}>
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

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={categoryFormData.name || ""}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Code *</Label>
              <Input
                id="edit-code"
                value={categoryFormData.code || ""}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value })}
                placeholder="Enter category code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={categoryFormData.description || ""}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                placeholder="Enter category description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={categoryFormData.active || false}
                onCheckedChange={(checked) => setCategoryFormData({ ...categoryFormData, active: checked })}
              />
              <Label htmlFor="edit-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subcategory Dialog */}
      <Dialog open={isEditSubcategoryDialogOpen} onOpenChange={setIsEditSubcategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Update the subcategory information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-subcategory-name">Name *</Label>
              <Input
                id="edit-subcategory-name"
                value={subcategoryFormData.name || ""}
                onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                placeholder="Enter subcategory name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subcategory-code">Code *</Label>
              <Input
                id="edit-subcategory-code"
                value={subcategoryFormData.code || ""}
                onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, code: e.target.value })}
                placeholder="Enter subcategory code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-subcategory-description">Description</Label>
              <Textarea
                id="edit-subcategory-description"
                value={subcategoryFormData.description || ""}
                onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                placeholder="Enter subcategory description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-subcategory-active"
                checked={subcategoryFormData.active || false}
                onCheckedChange={(checked) => setSubcategoryFormData({ ...subcategoryFormData, active: checked })}
              />
              <Label htmlFor="edit-subcategory-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSubcategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSubcategory}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 