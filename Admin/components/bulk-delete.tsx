"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/lib/api"

interface BulkDeleteProps {
  title: string
  endpoint: string
  shopId: string
  items: any[]
  onSuccess?: () => void
  getItemName?: (item: any) => string
}

export function BulkDelete({ title, endpoint, shopId, items, onSuccess, getItemName }: BulkDeleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [deleting, setDeleting] = useState(false)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map(item => item.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    }
  }

  const handleDelete = async () => {
    if (selectedIds.length === 0) return

    setDeleting(true)
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

      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/${endpoint}/bulk_delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (response.ok) {
        const result = await response.json()
        let description = `Successfully deleted ${result.deleted_count} ${title.toLowerCase()}`
        
        // Handle subcategory counts if present (for categories)
        if (result.subcategories_deleted !== undefined) {
          description += ` and ${result.subcategories_deleted} subcategories`
        }
        
        toast({
          title: "Success",
          description: description,
        })
        setIsOpen(false)
        setSelectedIds([])
        onSuccess?.()
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to delete ${title.toLowerCase()}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete items",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const getDisplayName = (item: any) => {
    if (getItemName) {
      return getItemName(item)
    }
    return item.name || item.title || `Item ${item.id}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={items.length === 0}>
          <Trash2 className="h-4 w-4 mr-2" />
          Bulk Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Delete {title}</DialogTitle>
          <DialogDescription>
            Select the {title.toLowerCase()} you want to delete. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Select Items to Delete</CardTitle>
              <CardDescription>
                {items.length} {title.toLowerCase()} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 p-2 border rounded-md">
                  <Checkbox
                    id="select-all"
                    checked={selectedIds.length === items.length && items.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    Select All ({selectedIds.length} of {items.length})
                  </label>
                </div>
                
                <div className="max-h-64 overflow-y-auto border rounded-md">
                  {items.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No {title.toLowerCase()} available to delete
                    </p>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2 p-2 border-b last:border-b-0 hover:bg-gray-50">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        />
                        <label htmlFor={`item-${item.id}`} className="text-sm flex-1 cursor-pointer">
                          {getDisplayName(item)}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedIds.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-sm text-red-800 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Warning
                </CardTitle>
                <CardDescription className="text-red-700">
                  You are about to delete {selectedIds.length} {title.toLowerCase()}. This action cannot be undone.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={selectedIds.length === 0 || deleting}
          >
            {deleting ? (
              <>
                <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedIds.length} {title.toLowerCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 