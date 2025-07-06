"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/lib/api"
import { useRouter } from "next/navigation"

interface CsvUploadProps {
  title: string
  endpoint: string
  shopId: string
  templateFields: string[]
  onSuccess?: () => void
}

export function CsvUpload({ title, endpoint, shopId, templateFields, onSuccess }: CsvUploadProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      parseCsv(selectedFile)
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive",
      })
    }
  }

  const parseCsv = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, ''))
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers?.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })
      setPreview(data.slice(0, 5)) // Show first 5 rows as preview
    }
    reader.readAsText(file)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
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

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE_URL}/api/v1/shops/${shopId}/${endpoint}/bulk_upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        let description = `Successfully uploaded ${result.created_count} ${title.toLowerCase()}`
        
        // Handle subcategory counts if present (for categories)
        if (result.subcategories_created !== undefined || result.subcategories_updated !== undefined) {
          const subCreated = result.subcategories_created || 0
          const subUpdated = result.subcategories_updated || 0
          if (subCreated > 0 || subUpdated > 0) {
            description += ` with ${subCreated} new and ${subUpdated} updated subcategories`
          }
        }
        
        toast({
          title: "Success",
          description: description,
        })
        setIsOpen(false)
        setFile(null)
        setPreview([])
        onSuccess?.()
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        toast({
          title: "Session Expired",
          description: "Redirecting to login...",
          variant: "destructive",
        })
        router.push('/')
        return
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to upload ${title.toLowerCase()}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const downloadTemplate = () => {
    const headers = templateFields.join(',')
    const sampleData = templateFields.map(field => {
      switch (field) {
        case 'name': return 'Sample Name'
        case 'code': return '001'
        case 'description': return 'Sample Description'
        case 'contact_email': return 'email@example.com'
        case 'contact_phone': return '+1234567890'
        case 'website': return 'https://example.com'
        case 'address': return '123 Main St'
        case 'city': return 'New York'
        case 'state': return 'NY'
        case 'postal_code': return '10001'
        case 'country': return 'USA'
        case 'phone': return '+1234567890'
        case 'email': return 'location@example.com'
        case 'active': return 'true'
        case 'primary': return 'false'
        // Category and subcategory fields
        case 'category_name': return 'Electronics'
        case 'category_code': return '001'
        case 'category_description': return 'Electronic devices and gadgets'
        case 'category_active': return 'true'
        case 'subcategory_name': return 'Smartphones'
        case 'subcategory_code': return '001'
        case 'subcategory_description': return 'Mobile phones and smartphones'
        case 'subcategory_active': return 'true'
        default: return 'Sample Value'
      }
    }).join(',')
    
    const csvContent = `${headers}\n${sampleData}`
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase()}_template.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Upload {title}</DialogTitle>
          <DialogDescription>
            {title === "Categories" 
              ? "Upload a CSV file to create multiple categories and subcategories at once. Each row can include both category and subcategory information."
              : `Upload a CSV file to create multiple ${title.toLowerCase()} at once.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Download Template</CardTitle>
              <CardDescription>
                Download the CSV template to see the required format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload CSV File</CardTitle>
              <CardDescription>
                Select a CSV file to upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="csv-file">CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>
            </CardContent>
          </Card>

          {preview.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
                <CardDescription>
                  First 5 rows of your CSV file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-white border-b">
                        <tr>
                          {templateFields.map((field) => (
                            <th key={field} className="text-left p-2 font-medium bg-gray-50">
                              {field}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            {templateFields.map((field) => (
                              <td key={field} className="p-2">
                                <div className="max-w-32 truncate" title={row[field] || '-'}>
                                  {row[field] || '-'}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Required Fields</CardTitle>
              <CardDescription>
                Make sure your CSV includes these columns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {templateFields.map((field) => (
                  <span
                    key={field}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <FileText className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {title}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 