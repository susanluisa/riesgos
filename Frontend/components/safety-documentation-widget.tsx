"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DocumentUploadDialog } from "@/components/document-upload-dialog"
import { BookOpen, Calendar, Download, FileText, Filter, Folder, FolderOpen, Search, Upload, User } from "lucide-react"

export function SafetyDocumentationWidget() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Mock data for documents
  const documents = [
    {
      id: "doc-001",
      title: "Procedimiento de Trabajo Seguro - Perforación",
      category: "Procedimientos",
      date: "2023-04-15",
      author: "Carlos Mendoza",
      version: "2.1",
      status: "Aprobado",
      description:
        "Procedimiento detallado para realizar trabajos de perforación de manera segura, incluyendo verificaciones previas, EPP requerido y medidas de control.",
    },
    {
      id: "doc-002",
      title: "Matriz IPERC - Área de Trituración",
      category: "Matrices",
      date: "2023-03-22",
      author: "Maria Rodriguez",
      version: "1.3",
      status: "Aprobado",
      description:
        "Identificación de Peligros, Evaluación de Riesgos y Controles para el área de trituración de mineral.",
    },
    {
      id: "doc-003",
      title: "Plan de Respuesta a Emergencias",
      category: "Planes",
      date: "2023-02-10",
      author: "Juan Perez",
      version: "3.0",
      status: "Aprobado",
      description:
        "Plan integral de respuesta ante emergencias, incluyendo evacuación, primeros auxilios y comunicación.",
    },
    {
      id: "doc-004",
      title: "Registro de Capacitación - Uso de EPP",
      category: "Registros",
      date: "2023-05-05",
      author: "Ana Gomez",
      version: "1.0",
      status: "Pendiente",
      description: "Registro de asistencia y evaluación de la capacitación sobre uso correcto de EPP.",
    },
    {
      id: "doc-005",
      title: "Inspección Mensual de Seguridad - Abril 2023",
      category: "Inspecciones",
      date: "2023-05-02",
      author: "Carlos Mendoza",
      version: "1.0",
      status: "Aprobado",
      description: "Resultados de la inspección mensual de seguridad realizada en todas las áreas operativas.",
    },
    {
      id: "doc-006",
      title: "Análisis de Trabajo Seguro - Mantenimiento de Equipos",
      category: "Análisis",
      date: "2023-04-28",
      author: "Maria Rodriguez",
      version: "1.1",
      status: "En Revisión",
      description:
        "Análisis detallado de los riesgos asociados a las tareas de mantenimiento de equipos y maquinaria pesada.",
    },
    {
      id: "doc-007",
      title: "Programa Anual de Seguridad y Salud Ocupacional",
      category: "Programas",
      date: "2023-01-15",
      author: "Juan Perez",
      version: "1.0",
      status: "Aprobado",
      description:
        "Programa que establece los objetivos, metas y actividades en materia de seguridad y salud ocupacional para el año 2023.",
    },
  ]

  // Filter documents based on search query and selected category
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === null || doc.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = [...new Set(documents.map((doc) => doc.category))]

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aprobado":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aprobado</Badge>
      case "En Revisión":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">En Revisión</Badge>
      case "Pendiente":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pendiente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Mock regulations data
  const regulations = [
    {
      id: "reg-001",
      title: "Ley 29783 - Ley de Seguridad y Salud en el Trabajo",
      date: "2011-08-20",
      description:
        "Ley que establece el marco normativo para la prevención de riesgos laborales en el Perú, promoviendo una cultura de prevención.",
      link: "#",
    },
    {
      id: "reg-002",
      title: "DS 024-2016-EM - Reglamento de Seguridad y Salud Ocupacional en Minería",
      date: "2016-07-28",
      description:
        "Reglamento que establece normas para la gestión de la Seguridad y Salud Ocupacional en las actividades mineras.",
      link: "#",
    },
    {
      id: "reg-003",
      title: "RM 312-2011-MINSA - Protocolos de Exámenes Médico Ocupacionales",
      date: "2011-04-25",
      description:
        "Establece los protocolos de exámenes médicos ocupacionales y guías de diagnóstico para las actividades laborales.",
      link: "#",
    },
    {
      id: "reg-004",
      title: "D.A. N.º 349-2024/MINSA - Vigilancia de la Salud de los Trabajadores",
      date: "2024-01-15",
      description:
        "Directiva administrativa que establece los lineamientos para la vigilancia de la salud de los trabajadores con riesgo de exposición a COVID-19 y otras enfermedades respiratorias.",
      link: "#",
    },
    {
      id: "reg-005",
      title: "DS 005-2012-TR - Reglamento de la Ley 29783",
      date: "2012-04-25",
      description:
        "Reglamento que desarrolla la Ley 29783, estableciendo disposiciones para su aplicación en todos los sectores económicos.",
      link: "#",
    },
  ]

  const handleDocumentUploadSuccess = () => {
    // Aquí podrías actualizar la lista de documentos
    // En una aplicación real, esto podría implicar una llamada a la API
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Documentación de Seguridad</h2>
          <p className="text-muted-foreground">
            Acceda a procedimientos, matrices IPERC, planes y normativas de seguridad
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            <span>Subir Documento</span>
          </Button>
          <Button className="flex items-center gap-2" onClick={() => setCreateDialogOpen(true)}>
            <FileText className="h-4 w-4" />
            <span>Nuevo Documento</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="documents">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            <span>Documentos Internos</span>
          </TabsTrigger>
          <TabsTrigger value="regulations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Normativas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Documentos de Seguridad</CardTitle>
              <CardDescription>
                Procedimientos, matrices, planes y registros del sistema de gestión de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium flex-shrink-0">Categoría:</span>
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Todas
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8 border rounded-md">
                      <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No se encontraron documentos</h3>
                      <p className="text-sm text-muted-foreground">Intente con otros términos de búsqueda o filtros</p>
                    </div>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <Card key={doc.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{doc.title}</CardTitle>
                            {getStatusBadge(doc.status)}
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <Badge variant="outline">{doc.category}</Badge>
                            <span>Versión {doc.version}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm">{doc.description}</p>
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              <span>{doc.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(doc.date)}</span>
                            </div>
                          </div>
                          <div className="pt-2 flex justify-between items-center">
                            <Button variant="outline" size="sm">
                              Ver Documento
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <Download className="h-3.5 w-3.5" />
                              <span>Descargar</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulations">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Normativas y Regulaciones</CardTitle>
              <CardDescription>
                Leyes, decretos y resoluciones aplicables a la seguridad y salud ocupacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {regulations.map((reg) => (
                    <div key={reg.id} className="space-y-3">
                      <div>
                        <h3 className="text-lg font-medium">{reg.title}</h3>
                        <p className="text-sm text-muted-foreground">Publicado: {formatDate(reg.date)}</p>
                      </div>
                      <p className="text-sm">{reg.description}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Ver Texto Completo
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Download className="h-3.5 w-3.5" />
                          <span>Descargar PDF</span>
                        </Button>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo para subir documentos */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        mode="upload"
        onSuccess={handleDocumentUploadSuccess}
      />

      {/* Diálogo para crear documentos */}
      <DocumentUploadDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={handleDocumentUploadSuccess}
      />
    </div>
  )
}
