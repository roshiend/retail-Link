"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, LinkIcon, ImageIcon, Heading1, Heading2, Undo, Redo } from "lucide-react"
import { useState, useCallback } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  tabIndex?: number
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [linkUrl, setLinkUrl] = useState("")
  const [linkOpen, setLinkOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [imageOpen, setImageOpen] = useState(false)

  const addLink = useCallback(() => {
    if (editor && linkUrl) {
      // Check if the URL has a protocol, if not add https://
      const url = linkUrl.match(/^https?:\/\//) ? linkUrl : `https://${linkUrl}`

      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()

      setLinkUrl("")
      setLinkOpen(false)
    }
  }, [editor, linkUrl])

  const addImage = useCallback(() => {
    if (editor && imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()

      setImageUrl("")
      setImageOpen(false)
    }
  }, [editor, imageUrl])

  return (
    <div className="border border-input rounded-t-md p-1 bg-background flex flex-wrap gap-1 items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={editor?.isActive("bold") ? "bg-muted" : ""}
        type="button"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={editor?.isActive("italic") ? "bg-muted" : ""}
        type="button"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor?.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
        type="button"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor?.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        type="button"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={editor?.isActive("bulletList") ? "bg-muted" : ""}
        type="button"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={editor?.isActive("orderedList") ? "bg-muted" : ""}
        type="button"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Popover open={linkOpen} onOpenChange={setLinkOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className={editor?.isActive("link") ? "bg-muted" : ""} type="button">
            <LinkIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Add Link</h3>
            <Input
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addLink()
                }
              }}
            />
            <div className="flex justify-between">
              {editor?.isActive("link") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run()
                    setLinkOpen(false)
                  }}
                  type="button"
                >
                  Remove Link
                </Button>
              )}
              <Button size="sm" onClick={addLink} className="ml-auto" type="button">
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={imageOpen} onOpenChange={setImageOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" type="button">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Add Image</h3>
            <Input
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addImage()
                }
              }}
            />
            <Button size="sm" onClick={addImage} className="ml-auto" type="button">
              Insert Image
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          type="button"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          type="button"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your description...",
  tabIndex,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-md max-w-full",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="border border-input rounded-md overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="p-3 min-h-[200px] prose prose-sm max-w-none focus-within:outline-none"
        tabIndex={tabIndex}
      />
    </div>
  )
}
