"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, X, FileText, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface NewScenarioFormProps {
  onSave: (scenario: ScenarioData) => void
  onCancel: () => void
  isEdit?: boolean
  initialData?: ScenarioData
}

export interface ScenarioData {
  id?: string
  title: string
  description: string
  sector: string
  location: string
  riskLevel: number
  impactLevel: number
  probabilityLevel: number
  controlMeasures: string[]
  responsiblePersons: string[]
  attachedDocuments: string[]
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export function NewScenarioForm({ onSave, onCancel, isEdit = false, initialData }: NewScenarioFormProps) {
  const [scenarioData, setScenarioData] = useState<ScenarioData>(
    initialData || {
      title: "",
      description: "",
      sector: "production",
      location: "",
      riskLevel: 5,
      impactLevel: 5,
      probabilityLevel: 5,
      controlMeasures: [],
      responsiblePersons: [],
      attachedDocuments: [],
      isActive: true,
    },
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentMeasure, setCurrentMeasure] = useState("")
  const [currentPerson, setCurrentPerson] = useState("")
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [availableDocuments, setAvailableDocuments] = useState([
    { id: "doc1", title: "Manual de Seguridad 2023" },
    { id: "doc2", title: "Procedimiento de Evacuación" },
    { id: "doc3", title: "Análisis de Riesgos Sector A" },
    { id: "doc4", title: "Protocolo de Emergencias" },
    { id: "doc5", title: "Normativa ISO 45001" },
  ])

  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setScenarioData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setScenarioData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setScenarioData((prev) => ({ ...prev, [name]: value[0] }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setScenarioData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleAddMeasure = () => {
    if (currentMeasure.trim() && !scenarioData.controlMeasures.includes(currentMeasure.trim())) {
      setScenarioData((prev) => ({
        ...prev,
        controlMeasures: [...prev.controlMeasures, currentMeasure.trim()],
      }))
      setCurrentMeasure("")
    }
  }

  const handleRemoveMeasure = (measureToRemove: string) => {
    setScenarioData((prev) => ({
      ...prev,
      controlMeasures: prev.controlMeasures.filter((measure) => measure !== measureToRemove),
    }))
  }

  const handleAddPerson = () => {
    if (currentPerson.trim() && !scenarioData.responsiblePersons.includes(currentPerson.trim())) {
      setScenarioData((prev) => ({
        ...prev,
        responsiblePersons: [...prev.responsiblePersons, currentPerson.trim()],
      }))
      setCurrentPerson("")
    }
  }

  const handleRemovePerson = (personToRemove: string) => {
    setScenarioData((prev) => ({
      ...prev,
      responsiblePersons: prev.responsiblePersons.filter((person) => person !== personToRemove),
    }))
  }

  const handleAttachDocument = (docId: string) => {
    if (!scenarioData.attachedDocuments.includes(docId)) {
      setScenarioData((prev) => ({
        ...prev,
        attachedDocuments: [...prev.attachedDocuments, docId],
      }))
    }
  }

  const handleRemoveDocument = (docId: string) => {
    setScenarioData((prev) => ({
      ...prev,
      attachedDocuments: prev.attachedDocuments.filter((id) => id !== docId),
    }))
  }

  const getDocumentTitle = (docId: string) => {
    const doc = availableDocuments.find((d) => d.id === docId)
    return doc ? doc.title : "Documento"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!scenarioData.title.trim()) {
      toast({
        title: "Error",
        description: "El título del escenario es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (!scenarioData.description.trim()) {
      toast({
        title: "Error",
        description: "La descripción del escenario es obligatoria",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulando procesamiento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Añadir ID y fechas si es nuevo
      const completeScenarioData = {
        ...scenarioData,
        id: isEdit ? scenarioData.id : `scenario-${Date.now()}`,
        createdAt: isEdit ? scenarioData.createdAt : new Date(),
        updatedAt: new Date(),
      }

      onSave(completeScenarioData)

      toast({
        title: isEdit ? "Escenario actualizado" : "Escenario creado",
        description: isEdit
          ? "El escenario se ha actualizado correctamente"
          : "El nuevo escenario se ha creado correctamente",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar el escenario",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateRiskColor = (level: number) => {
    if (level <= 3) return "bg-green-100 text-green-800"
    if (level <= 6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Escenario de Riesgo" : "Nuevo Escenario de Riesgo"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Modifique los detalles del escenario de riesgo existente"
            : "Complete el formulario para crear un nuevo escenario de riesgo"}
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
                value={scenarioData.title}
                onChange={handleChange}
                placeholder="Ej: Caída en altura en sector de mantenimiento"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select value={scenarioData.sector} onValueChange={(value) => handleSelectChange("sector", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Producción</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="logistics">Logística</SelectItem>
                  <SelectItem value="administration">Administración</SelectItem>
                  <SelectItem value="laboratory">Laboratorio</SelectItem>
                  <SelectItem value="warehouse">Almacén</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
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
                value={scenarioData.description}
                onChange={handleChange}
                placeholder="Describa detalladamente el escenario de riesgo"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                name="location"
                value={scenarioData.location}
                onChange={handleChange}
                placeholder="Ej: Edificio A, Planta 2, Sector Norte"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive" className="flex items-center justify-between">
                <span>Estado activo</span>
                <Switch id="isActive" checked={scenarioData.isActive} onCheckedChange={handleSwitchChange} />
              </Label>
              <p className="text-sm text-gray-500">
                {scenarioData.isActive
                  ? "Este escenario está activo y será considerado en las evaluaciones de riesgo"
                  : "Este escenario está inactivo y no será considerado en las evaluaciones"}
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t">
            <h3 className="text-lg font-medium">Evaluación de Riesgo</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="probabilityLevel">Probabilidad</Label>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${calculateRiskColor(
                      scenarioData.probabilityLevel,
                    )}`}
                  >
                    {scenarioData.probabilityLevel}/10
                  </span>
                </div>
                <Slider
                  id="probabilityLevel"
                  min={1}
                  max={10}
                  step={1}
                  value={[scenarioData.probabilityLevel]}
                  onValueChange={(value) => handleSliderChange("probabilityLevel", value)}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Improbable</span>
                  <span>Muy probable</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="impactLevel">Impacto</Label>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${calculateRiskColor(
                      scenarioData.impactLevel,
                    )}`}
                  >
                    {scenarioData.impactLevel}/10
                  </span>
                </div>
                <Slider
                  id="impactLevel"
                  min={1}
                  max={10}
                  step={1}
                  value={[scenarioData.impactLevel]}
                  onValueChange={(value) => handleSliderChange("impactLevel", value)}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Leve</span>
                  <span>Catastrófico</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="riskLevel">Nivel de Riesgo Global</Label>
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${calculateRiskColor(
                      Math.round((scenarioData.probabilityLevel + scenarioData.impactLevel) / 2),
                    )}`}
                  >
                    {Math.round((scenarioData.probabilityLevel + scenarioData.impactLevel) / 2)}/10
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full ${
                      scenarioData.riskLevel <= 3
                        ? "bg-green-500"
                        : scenarioData.riskLevel <= 6
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{
                      width: `${(Math.round((scenarioData.probabilityLevel + scenarioData.impactLevel) / 2) / 10) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Bajo</span>
                  <span>Medio</span>
                  <span>Alto</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Medidas de Control</h3>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  value={currentMeasure}
                  onChange={(e) => setCurrentMeasure(e.target.value)}
                  placeholder="Añadir medida de control"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddMeasure()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddMeasure} size="sm">
                  Añadir
                </Button>
              </div>

              {scenarioData.controlMeasures.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {scenarioData.controlMeasures.map((measure, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                      <span className="text-sm">{measure}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMeasure(measure)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay medidas de control definidas</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Responsables</h3>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  value={currentPerson}
                  onChange={(e) => setCurrentPerson(e.target.value)}
                  placeholder="Añadir persona responsable"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddPerson()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddPerson} size="sm">
                  Añadir
                </Button>
              </div>

              {scenarioData.responsiblePersons.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {scenarioData.responsiblePersons.map((person, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                      <span className="text-sm">{person}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePerson(person)}
                        className="text-slate-500 hover:text-slate-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No hay responsables definidos</p>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Documentos Adjuntos</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowDocumentDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> Adjuntar
              </Button>
            </div>

            {scenarioData.attachedDocuments.length > 0 ? (
              <div className="space-y-2">
                {scenarioData.attachedDocuments.map((docId) => (
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
                {isEdit ? "Actualizar Escenario" : "Guardar Escenario"}
              </>
            )}
          </Button>
        </CardFooter>
      </form>

      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adjuntar Documentos</DialogTitle>
            <DialogDescription>Seleccione los documentos que desea adjuntar a este escenario.</DialogDescription>
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
                  disabled={scenarioData.attachedDocuments.includes(doc.id)}
                >
                  {scenarioData.attachedDocuments.includes(doc.id) ? "Adjuntado" : "Adjuntar"}
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
    </Card>
  )
}
