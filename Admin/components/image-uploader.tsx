"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImagePlus, Trash2, Upload } from "lucide-react"

export function ImageUploader() {
  const [images, setImages] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newImages = Array.from(e.dataTransfer.files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  // Remove an image
  const removeImage = (index: number) => {
    const newImages = [...images]
    URL.revokeObjectURL(newImages[index]) // Clean up the URL object
    newImages.splice(index, 1)
    setImages(newImages)
  }

  // Open file dialog when clicking on the drag area
  const handleAreaClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer ${
          dragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleAreaClick}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div
            className={`rounded-full p-3 transition-colors duration-200 ${dragging ? "bg-primary/20" : "bg-primary/10"}`}
          >
            <Upload className={`h-6 w-6 ${dragging ? "text-primary" : "text-primary/80"}`} />
          </div>
          <h3 className="text-lg font-medium">Drag & drop your images here</h3>
          <p className="text-sm text-muted-foreground">or click anywhere in this area to browse files</p>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Uploaded Images ({images.length})</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((image, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <img
                  src={image || "/placeholder.svg"}
                  alt={`Product image ${index + 1}`}
                  className="h-32 w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
            <Card
              className="relative h-32 border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              onClick={handleAreaClick}
            >
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
              <span className="sr-only">Add more images</span>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
