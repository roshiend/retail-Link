"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, FolderOpen, ArrowLeft } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { CsvUpload } from "@/components/csv-upload"

interface Category {
  id: number
  name: string
  code: string
  description?: string
  active: boolean
}

interface Subcategory {
  id: number
  name: string
  code: string
  description?: string
  active: boolean
  category_id: number
}

export default function SubcategoriesPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.id as string
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const fields = [
    { name: "category_id", label: "Category", type: "select" as const, required: true, options: categories },
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "code", label: "Code", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "active", label: "Active", type: "switch" as const },
  ]

  const templateFields = ["name", "code", "description", "active"]

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
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0])
        }
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
    }
  }

  const fetchSubcategories = async () => {
    if (!selectedCategory) return

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

      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${selectedCategory.id}/subcategories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubcategories(data)
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch subcategories')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch subcategories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [shopId])

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories()
    }
  }, [selectedCategory])

  const handleCreate = async () => {
    const categoryId = formData.category_id || selectedCategory?.id
    if (!categoryId) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      })
      return
    }

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

      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${categoryId}/subcategories`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subcategory created successfully",
        })
        setIsCreateDialogOpen(false)
        setFormData({})
        // Update selected category if it changed
        if (categoryId !== selectedCategory?.id) {
          const newCategory = categories.find(c => c.id === categoryId)
          setSelectedCategory(newCategory || null)
        } else {
          fetchSubcategories()
        }
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to create subcategory")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subcategory",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async () => {
    if (!editingSubcategory || !selectedCategory) return

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

      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${selectedCategory.id}/subcategories/${editingSubcategory.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subcategory updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingSubcategory(null)
        setFormData({})
        fetchSubcategories()
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update subcategory")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subcategory",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!selectedCategory) return

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

      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/categories/${selectedCategory.id}/subcategories/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subcategory deleted successfully",
        })
        fetchSubcategories()
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete subcategory")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete subcategory",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory)
    setFormData({
      name: subcategory.name,
      code: subcategory.code,
      description: subcategory.description || "",
      active: subcategory.active,
    })
    setIsEditDialogOpen(true)
  }

  const renderField = (field: any) => {
    switch (field.type) {
      case "select":
        return (
          <Select
            value={formData[field.name]?.toString() || selectedCategory?.id?.toString() || ""}
            onValueChange={(value) => setFormData({ ...formData, [field.name]: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option: Category) => (
                <SelectItem key={option.id} value={option.id.toString()}>
                  {option.name} ({option.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "textarea":
        return (
          <Textarea
            id={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.name}
              checked={formData[field.name] || false}
              onCheckedChange={(checked) => setFormData({ ...formData, [field.name]: checked })}
            />
            <Label htmlFor={field.name}>{field.label}</Label>
          </div>
        )
      default:
        return (
          <Input
            id={field.name}
            type="text"
            value={formData[field.name] || ""}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
    }
  }

  const filteredSubcategories = subcategories.filter(subcategory =>
    subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subcategory.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div>Loading...</div>
  }

  if (categories.length === 0) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">No Categories Found</h2>
          <p className="text-muted-foreground">You need to create categories first before adding subcategories.</p>
          <Button 
            onClick={() => router.push(`/shop/${shopId}/settings/categories`)}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to Categories
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/shop/${shopId}/settings/categories`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Subcategories</h2>
          <p className="text-muted-foreground">Manage subcategories for your product categories</p>
        </div>
      </div>

      {selectedCategory && (
        <>
          <div className="flex items-center justify-between">
            <div>
            </div>
            <div className="flex items-center space-x-2">
              <CsvUpload
                title="Subcategories"
                endpoint={`categories/${selectedCategory.id}/subcategories`}
                shopId={shopId}
                templateFields={templateFields}
                onSuccess={fetchSubcategories}
              />
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subcategory
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Create Subcategory</DialogTitle>
                    <DialogDescription>
                      Add a new subcategory. You can select which category it belongs to.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                    {fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name}>
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                  <DialogFooter className="flex-shrink-0">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Subcategories</CardTitle>
              <CardDescription>
                Manage subcategories for {selectedCategory.name}. You can create, edit, and delete items.
              </CardDescription>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subcategories..."
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubcategories.map((subcategory) => (
                    <TableRow key={subcategory.id}>
                      <TableCell className="font-mono">{subcategory.code}</TableCell>
                      <TableCell className="font-medium">{subcategory.name}</TableCell>
                      <TableCell>{subcategory.description || "-"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          subcategory.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {subcategory.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(subcategory)}
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
                                  This action cannot be undone. This will permanently delete the subcategory.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(subcategory.id)}>
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Edit Subcategory</DialogTitle>
                <DialogDescription>
                  Update the subcategory information.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                {fields.filter(field => field.name !== 'category_id').map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
              <DialogFooter className="flex-shrink-0">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate}>Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
} 