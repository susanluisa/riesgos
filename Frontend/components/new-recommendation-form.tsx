"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, X, FileText, Plus, Link } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface NewRecommendationFormProps {
  onSave: (recommendation: RecommendationData) => void
  onCancel: () => void
  isEdit?: boolean
  initialData?: RecommendationData
  scenarios?: { id: string; title: string }[]
}

export interface RecommendationData {
  id?: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: string
  implementationSteps: string[]
  resources: string
  estimatedCost: string
  estimatedTime: string
  linkedScenarios: string[]
  attachedDocuments: string[]
  isImplemented: boolean
  createdAt?: Date
  updatedAt?: Date
}

export function NewRecommendationForm({
  onSave,
  onCancel,
  isEdit = false,
  initialData,
  scenarios = [],
}: NewRecommendationFormProps) {
  const [recommendationData, setRecommendationData] = useState<RecommendationData>(
    initialData || {
      title: "",
      description: "",
      priority: "medium",
      category: "preventive",
      implementationSteps: [],
      resources: "",
      estimatedCost: "",
      estimatedTime: "",
      linkedScenarios: [],
      attachedDocuments: [],
      isImplemented: false,
    },
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState("")
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [showScenarioDialog, setShowScenarioDialog] = useState(false)
  const [availableDocuments, setAvailableDocuments] = useState([
    { id: "doc1", title: "Manual de Seguridad 2023" },
    { id: "doc2", title: "Procedimiento de Evacuación" },
    { id: "doc3", title: "Análisis de Riesgos Sector A" },
    { id: "doc4", title: "Protocolo de Emergencias" },
    { id: "doc5", title: "Normativa ISO 45001" },
  ])

  const defaultScenarios = [
    { id: "scenario1", title: "Caída en altura en sector de mantenimiento" },
    { id: "scenario2", title: "Derrame de productos químicos en laboratorio" },
    { id: "scenario3", title: "Incendio en área de almacenamiento" },
    { id: "scenario4", title: "Falla eléctrica en sala de control" },
    { id: "scenario5", title: "Exposición a ruido en zona de producción" },
  ]

  const scenariosList = scenarios.length > 0 ? scenarios : defaultScenarios
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRecommendationData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setRecommendationData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setRecommendationData((prev) => ({ ...prev, isImplemented: checked }))
  }

  const handleAddStep = () => {
    if (currentStep.trim() && !recommendationData.implementationSteps.includes(currentStep.trim())) {
      setRecommendationData((prev) => ({
        ...prev,
        implementationSteps: [...prev.implementationSteps, currentStep.trim()],
      }))
      setCurrentStep("")
    }
  }

  const handleRemoveStep = (stepToRemove: string) => {
    setRecommendationData((prev) => ({
      ...prev,
      implementationSteps: prev.implementationSteps.filter((step) => step !== stepToRemove),
    }))
  }

  const handleAttachDocument = (docId: string) => {
    if (!recommendationData.attachedDocuments.includes(docId)) {
      setRecommendationData((prev) => ({
        ...prev,
        attachedDocuments: [...prev.attachedDocuments, docId],
      }))
    }
  }

  const handleRemoveDocument = (docId: string) => {
    setRecommendationData((prev) => ({
      ...prev,
      attachedDocuments: prev.attachedDocuments.filter((id) => id !== docId),
    }))
  }

  const handleLinkScenario = (scenarioId: string) => {
    if (!recommendationData.linkedScenarios.includes(scenarioId)) {
      setRecommendationData((prev) => ({
        ...prev,
        linkedScenarios: [...prev.linkedScenarios, scenarioId],
      }))
    }
  }

  const handleUnlinkScenario = (scenarioId: string) => {
    setRecommendationData((prev) => ({
      ...prev,
      linkedScenarios: prev.linkedScenarios.filter((id) => id !== scenarioId),
    }))
  }

  const getDocumentTitle = (docId: string) => {
    const doc = availableDocuments.find((d) => d.id === docId)
    return doc ? doc.title : "Documento"
  }

  const getScenarioTitle = (scenarioId: string) => {
    const scenario = scenariosList.find((s) => s.id === scenarioId)
    return scenario ? scenario.title : "Escenario"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recommendationData.title.trim()) {
      toast({
        title: "Error",
        description: "El título de la recomendación es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!recommendationData.description.trim()) {
      toast({
        title: "Error",
        description: "La descripción de la recomendación es obligatoria",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulando procesamiento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Añadir ID y fechas si es nuevo
      const completeRecommendationData = {
        ...recommendationData,
        id: isEdit ? recommendationData.id : `recommendation-${Date.now()}`,
        createdAt: isEdit ? recommendationData.createdAt : new Date(),
        updatedAt: new Date(),
      }

      onSave(completeRecommendationData)

      toast({
        title: isEdit ? "Recomendación actualizada" : "Recomendación creada",
        description: isEdit
          ? "La recomendación se ha actualizado correctamente"
          : "La nueva recomendación se ha creado correctamente",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar la recomendación",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-slate-600"
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Recomendación" : "Nueva Recomendación"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Modifique los detalles de la recomendación existente"
            : "Complete el formulario para crear una nueva recomendación de seguridad"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={recommendationData.title}
                onChange={handleChange}
                placeholder="Ej: Implementar sistema de arnés de seguridad"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={recommendationData.category}
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventive">Preventiva</SelectItem>
                  <SelectItem value="corrective">Correctiva</SelectItem>
                  <SelectItem value="detective">Detectiva</SelectItem>
                  <SelectItem value="protective">Protectiva</SelectItem>
                  <SelectItem value="administrative">Administrativa</SelectItem>
                  <SelectItem value="engineering">Ingeniería</SelectItem>
                  <SelectItem value="training">Capacitación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={recommendationData.description}
                onChange={handleChange}
                placeholder="Describa detalladamente la recomendación y su propósito"
                rows={4}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Prioridad</Label>
              <RadioGroup
                value={recommendationData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-red-600 font-medium">
                    Alta
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-yellow-600 font-medium">
                    Media
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-green-600 font-medium">
                    Baja
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isImplemented" className="flex items-center justify-between">
                <span>Estado de implementación</span>
                <Switch
                  id="isImplemented"
                  checked={recommendationData.isImplemented}
                  onCheckedChange={handleSwitchChange}
                />
              </Label>
              <p className="text-sm text-gray-500">
                {recommendationData.isImplemented
                  ? "Esta recomendación ya ha sido implementada"
                  : "Esta recomendación aún no ha sido implementada"}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Pasos de Implementación</h3>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  value={currentStep}
                  onChange={(e) => setCurrentStep(e.target.value)}
                  placeholder="Añadir paso de implementación"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddStep()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddStep} size="sm">
                  Añadir
                </Button>
              </div>

              {recommendationData.implementationSteps.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {recommendationData.implementationSteps.map((step, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                      <div className="flex items-center">
                        <span className="bg-slate-200 text-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">
                          {index + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(step)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay pasos de implementación definidos</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="resources">Recursos Necesarios</Label>
              <Textarea
                id="resources"
                name="resources"
                value={recommendationData.resources}
                onChange={handleChange}
                placeholder="Ej: Personal capacitado, equipos de protección, etc."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Costo Estimado</Label>
              <Input
                id="estimatedCost"
                name="estimatedCost"
                value={recommendationData.estimatedCost}
                onChange={handleChange}
                placeholder="Ej: $5,000 - $8,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Tiempo Estimado</Label>
              <Input
                id="estimatedTime"
                name="estimatedTime"
                value={recommendationData.estimatedTime}
                onChange={handleChange}
                placeholder="Ej: 2-3 semanas"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Escenarios Vinculados</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowScenarioDialog(true)}>
                <Link className="h-4 w-4 mr-1" /> Vincular
              </Button>
            </div>

            {recommendationData.linkedScenarios.length > 0 ? (
              <div className="space-y-2">
                {recommendationData.linkedScenarios.map((scenarioId) => (
                  <div key={scenarioId} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                    <div className="flex items-center">
                      <span className="text-sm">{getScenarioTitle(scenarioId)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnlinkScenario(scenarioId)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay escenarios vinculados</p>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Documentos Adjuntos</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowDocumentDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> Adjuntar
              </Button>
            </div>

            {recommendationData.attachedDocuments.length > 0 ? (
              <div className="space-y-2">
                {recommendationData.attachedDocuments.map((docId) => (
                  <div key={docId} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-slate-500" />
                      <span className="text-sm">{getDocumentTitle(docId)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(docId)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No hay documentos adjuntos</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Actualizando..." : "Guardando..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? "Actualizar Recomendación" : "Guardar Recomendación"}
              </>
            )}
          </Button>
        </CardFooter>
      </form>

      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adjuntar Documentos</DialogTitle>
            <DialogDescription>Seleccione los documentos que desea adjuntar a esta recomendación.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {availableDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-slate-500" />
                  <span>{doc.title}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleAttachDocument(doc.id)
                    setShowDocumentDialog(false)
                  }}
                  disabled={recommendationData.attachedDocuments.includes(doc.id)}
                >
                  {recommendationData.attachedDocuments.includes(doc.id) ? "Adjuntado" : "Adjuntar"}
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDocumentDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showScenarioDialog} onOpenChange={setShowScenarioDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Vincular Escenarios</DialogTitle>
            <DialogDescription>Seleccione los escenarios que desea vincular a esta recomendación.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {scenariosList.map((scenario) => (
              <div key={scenario.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50">
                <div className="flex items-center">
                  <span>{scenario.title}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleLinkScenario(scenario.id)
                    setShowScenarioDialog(false)
                  }}
                  disabled={recommendationData.linkedScenarios.includes(scenario.id)}
                >
                  {recommendationData.linkedScenarios.includes(scenario.id) ? "Vinculado" : "Vincular"}
                </Button>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowScenarioDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
