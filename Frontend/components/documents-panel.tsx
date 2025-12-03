"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { DocumentUploadDialog } from "@/components/document-upload-dialog"
import { LocalStorage, STORAGE_KEYS } from "@/lib/storage"
import {
  ArrowUpDown,
  Calendar,
  Download,
  Eye,
  FileText,
  Filter,
  Loader2,
  MoreHorizontal,
  Search,
  Share2,
  Upload,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Document {
  id: string
  title: string
  category: string
  description: string
  status: "Pendiente" | "En Revisión" | "Aprobado" | "Rechazado"
  version: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  fileType: string
  fileSize: string
}

export function DocumentsPanel() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadMode, setUploadMode] = useState<"upload" | "create">("upload")
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])

  // Cargar documentos del localStorage al inicializar
  useEffect(() => {
    const savedDocuments = LocalStorage.get<Document[]>(STORAGE_KEYS.DOCUMENTS, [])
    setDocuments(savedDocuments)
  }, [])

  // Guardar documentos en localStorage cuando cambien
  useEffect(() => {
    LocalStorage.set(STORAGE_KEYS.DOCUMENTS, documents)
  }, [documents])

  // Función para abrir el diálogo de subida
  const handleOpenUploadDialog = (mode: "upload" | "create") => {
    setUploadMode(mode)
    setShowUploadDialog(true)
  }

  // Función para manejar la subida exitosa
  const handleUploadSuccess = (documentData: any) => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: documentData.title,
      category: documentData.category,
      description: documentData.description,
      status: "Pendiente",
      version: "1.0",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "Usuario Actual",
      fileType: documentData.file?.type.split("/")[1] || "pdf",
      fileSize: documentData.file ? `${(documentData.file.size / 1024 / 1024).toFixed(1)} MB` : "N/A",
    }

    setDocuments((prev) => [newDoc, ...prev])

    toast({
      title: "Documento agregado",
      description: "El documento ha sido agregado exitosamente.",
      variant: "default",
    })
  }

  // Función para previsualizar un documento
  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document)
    setShowPreviewDialog(true)
  }

  // Función para descargar un documento
  const handleDownloadDocument = (document: Document) => {
    setIsLoading(true)

    // Simular descarga
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Descarga iniciada",
        description: `Descargando "${document.title}"...`,
        variant: "default",
      })
    }, 1000)
  }

  // Función para compartir un documento
  const handleShareDocument = (document: Document) => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        text: document.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles.",
        variant: "default",
      })
    }
  }

  // Función para eliminar un documento
  const handleDeleteDocument = (id: string) => {
    if (confirm("¿Está seguro de eliminar este documento? Esta acción no se puede deshacer.")) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado exitosamente.",
        variant: "default",
      })
    }
  }

  // Filtrar documentos según búsqueda y filtros
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === null || doc.category === categoryFilter
    const matchesStatus = statusFilter === null || doc.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Obtener categorías únicas para el filtro
  const uniqueCategories = Array.from(new Set(documents.map((doc) => doc.category)))
  const uniqueStatuses = Array.from(new Set(documents.map((doc) => doc.status)))

  // Función para obtener el ícono según el tipo de archivo
  const getFileIcon = (fileType: string) => {
    return <FileText className="h-5 w-5 text-blue-500" />
  }

  // Función para obtener el color de badge según estado
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "En Revisión":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "Aprobado":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Rechazado":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Documentos</h2>
          <p className="text-muted-foreground">
            Gestione los documentos relacionados con la seguridad y salud ocupacional
          </p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button variant="outline" onClick={() => handleOpenUploadDialog("create")}>
            <FileText className="mr-2 h-4 w-4" /> Nuevo Documento
          </Button>
          <Button onClick={() => handleOpenUploadDialog("upload")}>
            <Upload className="mr-2 h-4 w-4" /> Subir Documento
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Categoría</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCategoryFilter(null)}>Todas las categorías</DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueCategories.map((category) => (
                <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <ArrowUpDown className="h-4 w-4" />
                <span>Estado</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>Todos los estados</DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueStatuses.map((status) => (
                <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">
              {documents.length === 0 ? "No hay documentos" : "No se encontraron documentos"}
            </p>
            <p className="text-muted-foreground text-center mt-1">
              {documents.length === 0
                ? "Suba o cree un nuevo documento para comenzar"
                : "Intente con otros criterios de búsqueda o filtros"}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => handleOpenUploadDialog("create")}>
                <FileText className="mr-2 h-4 w-4" /> Nuevo Documento
              </Button>
              <Button onClick={() => handleOpenUploadDialog("upload")}>
                <Upload className="mr-2 h-4 w-4" /> Subir Documento
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex items-center justify-center p-6 bg-slate-50 md:w-16">
                  {getFileIcon(document.fileType)}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{document.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{document.description}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <Badge className={getStatusBadgeClass(document.status)}>{document.status}</Badge>
                      <Badge variant="outline">v{document.version}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>{document.category}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Actualizado: {document.updatedAt.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span>Tamaño: {document.fileSize}</span>
                    </div>
                    <div>
                      <span>Creado por: {document.createdBy}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handlePreviewDocument(document)}
                    >
                      <Eye className="h-4 w-4" />
                      <span>Previsualizar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleDownloadDocument(document)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      <span>Descargar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleShareDocument(document)}
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Compartir</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Más opciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenUploadDialog("create")}>
                          Editar documento
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenUploadDialog("upload")}>
                          Subir nueva versión
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteDocument(document.id)}>
                          Eliminar documento
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Diálogo de subida de documento */}
      <DocumentUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUpload={handleUploadSuccess}
      />

      {/* Diálogo de previsualización */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDocument && getFileIcon(selectedDocument.fileType)}
              {selectedDocument?.title}
            </DialogTitle>
            <DialogDescription>{selectedDocument?.description}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm">
              <Badge className={selectedDocument ? getStatusBadgeClass(selectedDocument.status) : ""}>
                {selectedDocument?.status}
              </Badge>
              <Badge variant="outline">v{selectedDocument?.version}</Badge>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Actualizado: {selectedDocument?.updatedAt.toLocaleDateString()}</span>
              </div>
              <div>
                <span>Creado por: {selectedDocument?.createdBy}</span>
              </div>
            </div>

            <ScrollArea className="h-[60vh] border rounded-md">
              <div className="p-4">
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="bg-slate-50 p-20 rounded-md border border-slate-200 mb-4">
                    <FileText className="h-16 w-16 text-slate-500 mx-auto" />
                  </div>
                  <p className="text-center text-muted-foreground">
                    Vista previa del documento: {selectedDocument?.title}
                  </p>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Categoría: {selectedDocument?.category} | Tamaño: {selectedDocument?.fileSize}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Cerrar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => selectedDocument && handleShareDocument(selectedDocument)}
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
              <Button
                className="flex items-center gap-1"
                onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Descargar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
