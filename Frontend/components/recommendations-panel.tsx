"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { FileUploader } from "@/components/file-uploader"
import { LocalStorage, STORAGE_KEYS } from "@/lib/storage"
import { CheckCircle2, Edit, FileText, Loader2, Plus, Save, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Recommendation {
  id: string
  title: string
  description: string
  category: string
  priority: "Baja" | "Media" | "Alta" | "Crítica"
  status: "Pendiente" | "En Progreso" | "Completada" | "Rechazada"
  createdAt: Date
  updatedAt: Date
  documents?: string[]
  assignedTo?: string[]
}

export function RecommendationsPanel() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("existing")
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentRecommendation, setCurrentRecommendation] = useState<Recommendation | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [assignedPersons, setAssignedPersons] = useState<string[]>([])

  // Estado para la nueva recomendación
  const [newRecommendation, setNewRecommendation] = useState<Omit<Recommendation, "id" | "createdAt" | "updatedAt">>({
    title: "",
    description: "",
    category: "",
    priority: "Media",
    status: "Pendiente",
  })

  // Lista de personas disponibles para asignar
  const availablePersons = [
    "Juan Pérez",
    "María López",
    "Carlos Rodríguez",
    "Ana García",
    "Luis Torres",
    "Patricia Mendoza",
  ]

  // Cargar recomendaciones del localStorage al inicializar
  useEffect(() => {
    const savedRecommendations = LocalStorage.get<Recommendation[]>(STORAGE_KEYS.RECOMMENDATIONS, [])
    // Convertir fechas de string a Date
    const parsedRecommendations = savedRecommendations.map((rec) => ({
      ...rec,
      createdAt: new Date(rec.createdAt),
      updatedAt: new Date(rec.updatedAt),
    }))
    setRecommendations(parsedRecommendations)
  }, [])

  // Guardar recomendaciones en localStorage cuando cambien
  useEffect(() => {
    LocalStorage.set(STORAGE_KEYS.RECOMMENDATIONS, recommendations)
  }, [recommendations])

  // Función para manejar cambios en el formulario de nueva recomendación
  const handleNewRecommendationChange = (field: keyof typeof newRecommendation, value: any) => {
    setNewRecommendation((prev) => ({ ...prev, [field]: value }))
  }

  // Función para crear una nueva recomendación
  const handleCreateRecommendation = () => {
    // Validación básica
    if (!newRecommendation.title || !newRecommendation.description || !newRecommendation.category) {
      toast({
        title: "Campos incompletos",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulación de envío a API
    setTimeout(() => {
      const newId = `rec-${Date.now()}`
      const now = new Date()

      const createdRecommendation: Recommendation = {
        ...newRecommendation,
        id: newId,
        createdAt: now,
        updatedAt: now,
        documents: uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.name) : undefined,
        assignedTo: assignedPersons.length > 0 ? assignedPersons : undefined,
      }

      setRecommendations((prev) => [createdRecommendation, ...prev])

      // Notificar a responsables de seguridad
      notifySecurityResponsibles(createdRecommendation)

      // Resetear formulario
      setNewRecommendation({
        title: "",
        description: "",
        category: "",
        priority: "Media",
        status: "Pendiente",
      })
      setUploadedFiles([])
      setAssignedPersons([])

      setIsSubmitting(false)

      toast({
        title: "Recomendación creada",
        description: "La recomendación ha sido creada exitosamente.",
        variant: "default",
      })

      // Cambiar a la pestaña de recomendaciones existentes
      setActiveTab("existing")
    }, 1500)
  }

  // Función para notificar a responsables de seguridad
  const notifySecurityResponsibles = (recommendation: Recommendation) => {
    // Simulación de envío de notificaciones
    const securityResponsibles = [
      { id: "user-001", name: "Juan Pérez", email: "jperez@empresa.com", phone: "+51987654321" },
      { id: "user-002", name: "María López", email: "mlopez@empresa.com", phone: "+51987654322" },
      { id: "user-003", name: "Carlos Rodríguez", email: "crodriguez@empresa.com", phone: "+51987654323" },
    ]

    // Solo notificar para recomendaciones de alta prioridad o críticas
    if (recommendation.priority === "Alta" || recommendation.priority === "Crítica") {
      toast({
        title: "Notificaciones enviadas",
        description: `Se han enviado notificaciones a ${securityResponsibles.length} responsables de seguridad.`,
        variant: "default",
      })
    }

    // Notificar a las personas asignadas
    if (recommendation.assignedTo && recommendation.assignedTo.length > 0) {
      toast({
        title: "Asignaciones enviadas",
        description: `Se han enviado notificaciones a ${recommendation.assignedTo.length} personas asignadas.`,
        variant: "default",
      })
    }
  }

  // Función para abrir el diálogo de edición
  const handleEditRecommendation = (recommendation: Recommendation) => {
    setCurrentRecommendation(recommendation)
    setAssignedPersons(recommendation.assignedTo || [])
    setEditDialogOpen(true)
  }

  // Función para actualizar una recomendación
  const handleUpdateRecommendation = () => {
    if (!currentRecommendation) return

    setIsSubmitting(true)

    // Actualizar con las personas asignadas
    const updatedRecommendation = {
      ...currentRecommendation,
      assignedTo: assignedPersons.length > 0 ? assignedPersons : undefined,
    }

    // Simulación de actualización
    setTimeout(() => {
      setRecommendations((prev) =>
        prev.map((r) => (r.id === updatedRecommendation.id ? { ...updatedRecommendation, updatedAt: new Date() } : r)),
      )

      setIsSubmitting(false)
      setEditDialogOpen(false)

      toast({
        title: "Recomendación actualizada",
        description: "La recomendación ha sido actualizada exitosamente.",
        variant: "default",
      })

      // Notificar si la prioridad es alta o crítica
      if (updatedRecommendation.priority === "Alta" || updatedRecommendation.priority === "Crítica") {
        notifySecurityResponsibles(updatedRecommendation)
      }
    }, 1500)
  }

  // Función para eliminar una recomendación
  const handleDeleteRecommendation = (id: string) => {
    // Confirmación antes de eliminar
    if (confirm("¿Está seguro de eliminar esta recomendación? Esta acción no se puede deshacer.")) {
      setRecommendations((prev) => prev.filter((r) => r.id !== id))

      toast({
        title: "Recomendación eliminada",
        description: "La recomendación ha sido eliminada exitosamente.",
        variant: "default",
      })
    }
  }

  // Función para manejar la subida de archivos
  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)

    toast({
      title: "Archivos cargados",
      description: `Se han cargado ${files.length} archivo(s) correctamente.`,
      variant: "default",
    })
  }

  // Función para manejar la asignación de personas
  const handleAssignPerson = (person: string) => {
    if (assignedPersons.includes(person)) {
      setAssignedPersons((prev) => prev.filter((p) => p !== person))
    } else {
      setAssignedPersons((prev) => [...prev, person])
    }
  }

  // Función para obtener el color de badge según prioridad
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Baja":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Media":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Alta":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      case "Crítica":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  // Función para obtener el color de badge según estado
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-slate-100 text-slate-800 hover:bg-slate-100"
      case "En Progreso":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Completada":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Rechazada":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold">Recomendaciones</h2>
          <p className="text-muted-foreground">Gestione las recomendaciones para mitigar los riesgos identificados</p>
        </div>
        <Button className="mt-2 md:mt-0" onClick={() => setActiveTab("new")}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Recomendación
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Recomendaciones Existentes</TabsTrigger>
          <TabsTrigger value="new">Nueva Recomendación</TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No hay recomendaciones</p>
                <p className="text-muted-foreground text-center mt-1">
                  Cree una nueva recomendación para comenzar a gestionar las medidas de control
                </p>
                <Button className="mt-4" onClick={() => setActiveTab("new")}>
                  <Plus className="mr-2 h-4 w-4" /> Nueva Recomendación
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((recommendation) => (
                <Card key={recommendation.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{recommendation.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getPriorityBadgeClass(recommendation.priority)}>
                          {recommendation.priority}
                        </Badge>
                        <Badge className={getStatusBadgeClass(recommendation.status)}>{recommendation.status}</Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Categoría: {recommendation.category} | Creada: {recommendation.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{recommendation.description}</p>

                    <div className="mt-3 space-y-3">
                      {recommendation.assignedTo && recommendation.assignedTo.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Asignado a:</p>
                          <div className="flex flex-wrap gap-2">
                            {recommendation.assignedTo.map((person, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {person}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {recommendation.documents && recommendation.documents.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Documentos asociados:</p>
                          <div className="flex flex-wrap gap-2">
                            {recommendation.documents.map((doc, index) => (
                              <Badge key={index} variant="outline" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDeleteRecommendation(recommendation.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                    <Button size="sm" onClick={() => handleEditRecommendation(recommendation)}>
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nueva Recomendación</CardTitle>
              <CardDescription>Complete la información para registrar una nueva recomendación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título de la Recomendación</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Implementación de sistema de ventilación"
                    value={newRecommendation.title}
                    onChange={(e) => handleNewRecommendationChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={newRecommendation.category}
                    onValueChange={(value) => handleNewRecommendationChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="EPP">Equipos de Protección Personal</SelectItem>
                      <SelectItem value="Capacitación">Capacitación</SelectItem>
                      <SelectItem value="Procedimientos">Procedimientos</SelectItem>
                      <SelectItem value="Monitoreo">Monitoreo</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción de la Recomendación</Label>
                <Textarea
                  id="description"
                  placeholder="Describa detalladamente la recomendación"
                  rows={4}
                  value={newRecommendation.description}
                  onChange={(e) => handleNewRecommendationChange("description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select
                    value={newRecommendation.priority}
                    onValueChange={(value: any) => handleNewRecommendationChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baja">Baja</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Crítica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={newRecommendation.status}
                    onValueChange={(value: any) => handleNewRecommendationChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En Progreso">En Progreso</SelectItem>
                      <SelectItem value="Completada">Completada</SelectItem>
                      <SelectItem value="Rechazada">Rechazada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Asignar a</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                  {availablePersons.map((person) => (
                    <div key={person} className="flex items-center space-x-2">
                      <Switch
                        id={`assign-${person.replace(/\s+/g, "-").toLowerCase()}`}
                        checked={assignedPersons.includes(person)}
                        onCheckedChange={() => handleAssignPerson(person)}
                      />
                      <Label htmlFor={`assign-${person.replace(/\s+/g, "-").toLowerCase()}`}>{person}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Documentos Asociados</Label>
                <FileUploader
                  onFilesUploaded={handleFileUpload}
                  acceptedFileTypes={[".pdf", ".docx", ".xlsx", ".jpg", ".png"]}
                  maxFileSizeMB={10}
                  multiple={true}
                />
                {uploadedFiles.length > 0 && (
                  <div className="text-sm text-muted-foreground mt-1">{uploadedFiles.length} archivo(s) cargado(s)</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="notify" defaultChecked={true} />
                  <Label htmlFor="notify">Notificar a responsables de seguridad</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Las notificaciones se enviarán automáticamente para recomendaciones de prioridad Alta o Crítica
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("existing")}>
                Cancelar
              </Button>
              <Button onClick={handleCreateRecommendation} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Recomendación
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Diálogo de edición */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Recomendación</DialogTitle>
            <DialogDescription>Actualice la información de la recomendación</DialogDescription>
          </DialogHeader>

          {currentRecommendation && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Título de la Recomendación</Label>
                  <Input
                    id="edit-title"
                    value={currentRecommendation.title}
                    onChange={(e) => setCurrentRecommendation({ ...currentRecommendation, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoría</Label>
                  <Select
                    value={currentRecommendation.category}
                    onValueChange={(value) => setCurrentRecommendation({ ...currentRecommendation, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="EPP">Equipos de Protección Personal</SelectItem>
                      <SelectItem value="Capacitación">Capacitación</SelectItem>
                      <SelectItem value="Procedimientos">Procedimientos</SelectItem>
                      <SelectItem value="Monitoreo">Monitoreo</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción de la Recomendación</Label>
                <Textarea
                  id="edit-description"
                  rows={4}
                  value={currentRecommendation.description}
                  onChange={(e) => setCurrentRecommendation({ ...currentRecommendation, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Prioridad</Label>
                  <Select
                    value={currentRecommendation.priority}
                    onValueChange={(value: any) =>
                      setCurrentRecommendation({ ...currentRecommendation, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baja">Baja</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Crítica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select
                    value={currentRecommendation.status}
                    onValueChange={(value: any) =>
                      setCurrentRecommendation({ ...currentRecommendation, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En Progreso">En Progreso</SelectItem>
                      <SelectItem value="Completada">Completada</SelectItem>
                      <SelectItem value="Rechazada">Rechazada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Asignar a</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                  {availablePersons.map((person) => (
                    <div key={person} className="flex items-center space-x-2">
                      <Switch
                        id={`edit-assign-${person.replace(/\s+/g, "-").toLowerCase()}`}
                        checked={assignedPersons.includes(person)}
                        onCheckedChange={() => handleAssignPerson(person)}
                      />
                      <Label htmlFor={`edit-assign-${person.replace(/\s+/g, "-").toLowerCase()}`}>{person}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="edit-notify" defaultChecked={true} />
                  <Label htmlFor="edit-notify">Notificar cambios a responsables de seguridad</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRecommendation} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
