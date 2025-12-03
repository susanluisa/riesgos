"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, FileText, X, Check } from "lucide-react"

interface DocumentUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (documentData: DocumentData) => void
}

interface DocumentData {
  id?: string
  title: string
  description: string
  category: string
  file: File | null
  tags: string[]
  createdAt?: Date
}

export function DocumentUploadDialog({ isOpen, onClose, onUpload }: DocumentUploadDialogProps) {
  const [documentData, setDocumentData] = useState<DocumentData>({
    title: "",
    description: "",
    category: "Procedimientos",
    file: null,
    tags: [],
  })
  const [isUploading, setIsUploading] = useState(false)
  const [currentTag, setCurrentTag] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [fileError, setFileError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDocumentData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setDocumentData((prev) => ({ ...prev, category: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      validateFile(file)
    }
  }

  const validateFile = (file: File) => {
    setFileError("")
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
    ]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      setFileError("Tipo de archivo no permitido. Formatos soportados: PDF, Word, Excel, TXT, JPG, PNG")
      return false
    }

    if (file.size > maxSize) {
      setFileError("El archivo es demasiado grande. El tamaño máximo es 10MB.")
      return false
    }

    setDocumentData((prev) => ({ ...prev, file }))
    return true
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      validateFile(file)
    }
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !documentData.tags.includes(currentTag.trim())) {
      setDocumentData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setDocumentData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!documentData.title.trim()) {
      toast({
        title: "Error",
        description: "El título del documento es obligatorio",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Simulando carga del archivo
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Añadir ID y fecha de creación
      const completeDocumentData = {
        ...documentData,
        id: `doc-${Date.now()}`,
        createdAt: new Date(),
      }

      onUpload(completeDocumentData)

      // Resetear el formulario
      setDocumentData({
        title: "",
        description: "",
        category: "Procedimientos",
        file: null,
        tags: [],
      })
      setCurrentTag("")
      setFileError("")

      onClose()
    } catch (error) {
      toast({
        title: "Error al subir",
        description: "Ha ocurrido un error al subir el documento",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Nuevo Documento</DialogTitle>
          <DialogDescription>
            Suba documentos relacionados con seguridad, procedimientos o análisis de riesgos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Título del Documento <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={documentData.title}
                onChange={handleChange}
                placeholder="Ej: Protocolo de Seguridad 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={documentData.description}
                onChange={handleChange}
                placeholder="Breve descripción del contenido del documento"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={documentData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Procedimientos">Procedimientos</SelectItem>
                  <SelectItem value="Matrices">Matrices</SelectItem>
                  <SelectItem value="Planes">Planes</SelectItem>
                  <SelectItem value="Registros">Registros</SelectItem>
                  <SelectItem value="Normativas">Normativas</SelectItem>
                  <SelectItem value="Capacitación">Capacitación</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Etiquetas</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Añadir etiqueta"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag} size="sm">
                  Añadir
                </Button>
              </div>

              {documentData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {documentData.tags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-slate-500 hover:text-slate-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Archivo {documentData.file ? "" : <span className="text-red-500">*</span>}</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                } ${documentData.file ? "bg-green-50 border-green-300" : ""}`}
                onClick={triggerFileInput}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                />

                {documentData.file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium">{documentData.file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(documentData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDocumentData((prev) => ({ ...prev, file: null }))
                      }}
                    >
                      Cambiar archivo
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                      <Upload className="h-6 w-6 text-slate-600" />
                    </div>
                    <p className="text-sm font-medium">Haga clic o arrastre un archivo aquí</p>
                    <p className="text-xs text-gray-500 mt-1">Soporta PDF, Word, Excel, TXT, JPG, PNG (máx. 10MB)</p>
                  </div>
                )}
              </div>

              {fileError && <p className="text-sm text-red-500 mt-1">{fileError}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Subir Documento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
