"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Helpers locales para estructurar mejor el formulario sin romper API pública
const Section: React.FC<React.PropsWithChildren<{ title: string; description?: string }>> = ({
  title,
  description,
  children,
}) => (
  <Card className="mb-4">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)

const Row: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
  <div className={["grid grid-cols-1 md:grid-cols-2 gap-4", className].filter(Boolean).join(" ")}>{children}</div>
)
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HardHat,
  Loader2,
  FileText,
  Download,
  Skull,
  AlertCircle,
  Share2,
  Printer,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface RiskPredictionFormProps {
  onPredictionSubmit?: (data: any) => void
}

type RiskLevel = "Mortal" | "Alto" | "Medio" | "Bajo"

interface PredictionResult {
  riskLevel: RiskLevel
  probability: number
  factors: string[]
  recommendations: string[]
  impactAreas: string[]
  estimatedCost: string
  timeToImplement: string
  regulatoryFramework: string[]
  riskScore: number
}

export function RiskPredictionForm({ onPredictionSubmit }: RiskPredictionFormProps) {
  const { toast } = useToast()
  const [formTab, setFormTab] = useState("general")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)

  // Datos del formulario
  const [formData, setFormData] = useState({
    sector: "mineria",
    activity: "perforacion",
    workers: "12",
    duration: "8",
    description:
      "Perforación de roca para extracción de mineral en túnel subterráneo con presencia de polvo de sílice.",
    noiseLevel: 75,
    airQuality: 80,
    temperature: "28",
    humidity: "75",
    hazards: {
      chemicals: true,
      dust: true,
      gases: false,
      biological: false,
    },
    mortalRisks: {
      confined_spaces: false,
      heights: false,
      explosive: false,
      high_voltage: false,
    },
    ppe: {
      helmet: true,
      respirator: true,
      gloves: true,
      goggles: true,
      boots: true,
      harness: false,
    },
    engineering: {
      ventilation: false,
      isolation: true,
      guards: true,
      automation: false,
    },
    administrative: {
      training: true,
      rotation: false,
      procedures: true,
      supervision: true,
    },
    additional: "",
  })

  // Manejar cambios en el formulario
  const handleFormChange = useCallback((section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value,
      },
    }))
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }, [])

  const handleSwitchChange = useCallback(
    (section: string, id: string, checked: boolean) => {
      handleFormChange(section, id, checked)
    },
    [handleFormChange],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      // Calcular nivel de riesgo basado en los datos del formulario
      const calculateRiskLevel = (): RiskLevel => {
        // Factores que aumentan el riesgo
        let riskScore = 0

        // Factores de riesgo mortal
        if (formData.mortalRisks.confined_spaces) riskScore += 25
        if (formData.mortalRisks.heights) riskScore += 20
        if (formData.mortalRisks.explosive) riskScore += 30
        if (formData.mortalRisks.high_voltage) riskScore += 25

        // Sustancias peligrosas
        if (formData.hazards.chemicals) riskScore += 15
        if (formData.hazards.dust) riskScore += 10
        if (formData.hazards.gases) riskScore += 15
        if (formData.hazards.biological) riskScore += 10

        // Calidad del aire y ruido
        riskScore += formData.airQuality * 0.2
        riskScore += formData.noiseLevel * 0.1

        // Factores que reducen el riesgo
        if (formData.ppe.respirator) riskScore -= 10
        if (formData.ppe.harness) riskScore -= 15
        if (formData.engineering.ventilation) riskScore -= 20
        if (formData.engineering.automation) riskScore -= 15
        if (formData.administrative.training) riskScore -= 10

        // Normalizar a 0-100
        riskScore = Math.max(0, Math.min(100, riskScore))

        // Determinar nivel de riesgo
        if (riskScore > 80) return "Mortal"
        if (riskScore > 60) return "Alto"
        if (riskScore > 30) return "Medio"
        return "Bajo"
      }

      // Simular API call
      setTimeout(() => {
        const riskLevel = calculateRiskLevel()
        const probability =
          riskLevel === "Mortal" ? 0.85 : riskLevel === "Alto" ? 0.7 : riskLevel === "Medio" ? 0.5 : 0.3

        // Crear resultado de predicción
        const result: PredictionResult = {
          riskLevel,
          probability,
          riskScore: Math.round(probability * 100),
          factors: [
            "Exposición prolongada a polvo de sílice",
            "Falta de ventilación adecuada",
            "Uso inconsistente de EPP respiratorio",
            "Altas concentraciones de partículas respirables",
            "Espacios confinados con deficiencia de oxígeno",
          ],
          recommendations: [
            "Implementar sistema de ventilación industrial con filtros HEPA",
            "Establecer programa de monitoreo de calidad del aire",
            "Capacitar al personal sobre el uso correcto de EPP respiratorio",
            "Realizar exámenes médicos periódicos enfocados en función pulmonar",
            "Instalar sistemas de detección de gases y alarmas automáticas",
          ],
          impactAreas: [
            "Salud respiratoria",
            "Función pulmonar",
            "Sistema cardiovascular",
            "Productividad laboral",
            "Cumplimiento normativo",
          ],
          estimatedCost: "$15,000 - $25,000",
          timeToImplement: "4-6 semanas",
          regulatoryFramework: ["RM 312-2011-MINSA", "DS 024-2016-EM", "Ley 29783", "NIOSH Standard 42 CFR 84"],
        }

        setPredictionResult(result)
        setIsSubmitting(false)

        // Mostrar notificación de riesgo crítico si aplica
        if (result.riskLevel === "Mortal") {
          setTimeout(() => {
            toast({
              title: "¡ALERTA DE RIESGO MORTAL!",
              description: "Se ha detectado un riesgo con potencial de fatalidad. Se requiere acción inmediata.",
              variant: "destructive",
            })
          }, 500)
        }

        if (onPredictionSubmit) {
          onPredictionSubmit(result)
        }
      }, 2000)
    },
    [formData, onPredictionSubmit, toast],
  )

  const resetForm = useCallback(() => {
    setPredictionResult(null)
  }, [])

  const generateDetailedReport = useCallback(() => {
    setShowReportDialog(true)

    // Notificar que el informe está listo
    setTimeout(() => {
      toast({
        title: "Informe generado correctamente",
        description: "El informe detallado ha sido generado y está listo para su descarga.",
        variant: "success",
      })
    }, 1000)
  }, [toast])

  const handleDownloadPDF = useCallback(() => {
    setIsGeneratingPDF(true)

    // Simular generación de PDF
    setTimeout(() => {
      setIsGeneratingPDF(false)
      toast({
        title: "PDF generado correctamente",
        description: "El informe ha sido descargado a su dispositivo.",
        variant: "success",
      })
    }, 2000)
  }, [toast])

  const handleShareReport = useCallback(() => {
    toast({
      title: "Informe compartido",
      description: "El enlace al informe ha sido copiado al portapapeles.",
      variant: "success",
    })
  }, [toast])

  const handlePrintReport = useCallback(() => {
    toast({
      title: "Enviando a impresora",
      description: "El informe se está enviando a la impresora predeterminada.",
      variant: "success",
    })
  }, [toast])

  const handleSendToSafetyManagers = useCallback(() => {
    if (!predictionResult) return

    // Prepare notification data
    const notificationData = {
      type: "risk_assessment",
      priority:
        predictionResult.riskLevel === "Mortal"
          ? "critical"
          : predictionResult.riskLevel === "Alto"
            ? "high"
            : "medium",
      title: `Nueva Evaluación de Riesgo - Nivel ${predictionResult.riskLevel}`,
      message: `Se ha completado una evaluación de riesgo ocupacional con nivel ${predictionResult.riskLevel.toLowerCase()}`,
      data: {
        formData,
        predictionResult,
        timestamp: new Date().toISOString(),
        assessor: "usuario@empresa.com",
      },
      recipients: ["jefe.seguridad@empresa.com", "supervisor.sst@empresa.com", "gerente.operaciones@empresa.com"],
    }

    // Show loading state
    toast({
      title: "Enviando notificación...",
      description: "Preparando datos para enviar a responsables de seguridad.",
    })

    // Simulate API call to send notification
    setTimeout(() => {
      // Success notification
      toast({
        title: "Notificación enviada exitosamente",
        description: `Los datos y recomendaciones han sido enviados a ${notificationData.recipients.length} responsables de seguridad.`,
        variant: "success",
      })

      // If it's a critical risk, show additional alert
      if (predictionResult.riskLevel === "Mortal") {
        setTimeout(() => {
          toast({
            title: "Alerta crítica activada",
            description:
              "Se ha activado el protocolo de emergencia para riesgo mortal. Los responsables han sido notificados inmediatamente.",
            variant: "destructive",
          })
        }, 1000)
      }
    }, 1500)
  }, [formData, predictionResult, toast])

  const getRiskLevelBadge = useCallback((level: RiskLevel) => {
    switch (level) {
      case "Mortal":
        return (
          <Badge className="bg-black text-white hover:bg-black flex items-center gap-1">
            <Skull className="h-3.5 w-3.5" />
            <span>Riesgo Mortal</span>
          </Badge>
        )
      case "Alto":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Alto</Badge>
      case "Medio":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medio</Badge>
      case "Bajo":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Bajo</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }, [])

  // Efecto para cerrar el diálogo con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showReportDialog) {
        setShowReportDialog(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showReportDialog])

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Predicción de Riesgos Ocupacionales</h2>
          <p className="text-muted-foreground">
            Complete el formulario para evaluar los riesgos potenciales en su entorno laboral
          </p>
        </div>
        <Badge className="mt-2 md:mt-0 bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
          <HardHat className="h-3.5 w-3.5" />
          <span>Basado en RM 312-2011-MINSA</span>
        </Badge>
      </div>

      {predictionResult ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultado de la Predicción</span>
              {getRiskLevelBadge(predictionResult.riskLevel)}
            </CardTitle>
            <CardDescription>
              Análisis basado en los factores de riesgo identificados en su entorno laboral
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {predictionResult.riskLevel === "Mortal" && (
              <Alert variant="destructive" className="bg-black border-red-500 text-white">
                <Skull className="h-4 w-4" />
                <AlertTitle>¡ALERTA DE RIESGO MORTAL!</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Se ha detectado un escenario con potencial de fatalidad que requiere acción inmediata.
                  </p>
                  <p className="font-semibold">Acciones requeridas:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Detener inmediatamente todas las operaciones en el área afectada</li>
                    <li>Evacuar al personal no esencial</li>
                    <li>Notificar a la gerencia y al comité de seguridad</li>
                    <li>Implementar medidas de control de emergencia</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Puntuación de Riesgo</h3>
                <span className="font-medium">{predictionResult.riskScore}/100</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    predictionResult.riskLevel === "Mortal"
                      ? "bg-black"
                      : predictionResult.riskLevel === "Alto"
                        ? "bg-red-500"
                        : predictionResult.riskLevel === "Medio"
                          ? "bg-amber-500"
                          : "bg-green-500"
                  }`}
                  style={{ width: `${predictionResult.probability * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Factores de Riesgo Identificados</h3>
              <Alert
                variant={predictionResult.riskLevel === "Mortal" ? "destructive" : "default"}
                className={
                  predictionResult.riskLevel === "Mortal"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Factores Críticos</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {predictionResult.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <h3 className="font-medium mb-2">Recomendaciones</h3>
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Acciones Recomendadas</AlertTitle>
                <AlertDescription className="text-blue-800">
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {predictionResult.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Áreas de Impacto</h3>
                <div className="bg-slate-50 p-3 rounded-md border text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    {predictionResult.impactAreas.map((area, index) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Marco Regulatorio</h3>
                <div className="bg-slate-50 p-3 rounded-md border text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    {predictionResult.regulatoryFramework.map((reg, index) => (
                      <li key={index}>{reg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Costo Estimado de Implementación</h3>
                <div className="bg-slate-50 p-3 rounded-md border text-sm">
                  <p>{predictionResult.estimatedCost}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Tiempo de Implementación</h3>
                <div className="bg-slate-50 p-3 rounded-md border text-sm">
                  <p>{predictionResult.timeToImplement}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <Button variant="outline" onClick={resetForm}>
              Nueva Predicción
            </Button>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                onClick={handleShareReport}
                className="flex items-center gap-1 bg-transparent"
                aria-label="Compartir informe"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Compartir</span>
              </Button>
              <Button
                variant="outline"
                onClick={handlePrintReport}
                className="flex items-center gap-1 bg-transparent"
                aria-label="Imprimir informe"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
              <Button
                onClick={handleSendToSafetyManagers}
                className={`flex items-center gap-2 ${
                  predictionResult?.riskLevel === "Mortal"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : predictionResult?.riskLevel === "Alto"
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                aria-label="Enviar a responsables de seguridad"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Notificar Responsables</span>
                <span className="sm:hidden">Notificar</span>
              </Button>
              <Button onClick={generateDetailedReport} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Generar Informe Detallado</span>
                <span className="sm:hidden">Informe</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Tabs value={formTab} onValueChange={setFormTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="general">Información General</TabsTrigger>
              <TabsTrigger value="environment">Entorno Laboral</TabsTrigger>
              <TabsTrigger value="protection">Protección y Controles</TabsTrigger>
            </TabsList>

            <Card>
              <TabsContent value="general" className="m-0">
                <CardHeader>
                  <CardTitle>Información General</CardTitle>
                  <CardDescription>Proporcione información básica sobre la actividad laboral</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sector">Sector Industrial</Label>
                      <Select
                        value={formData.sector}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, sector: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un sector" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mineria">Minería</SelectItem>
                          <SelectItem value="construccion">Construcción</SelectItem>
                          <SelectItem value="manufactura">Manufactura</SelectItem>
                          <SelectItem value="quimico">Industria Química</SelectItem>
                          <SelectItem value="salud">Salud</SelectItem>
                          <SelectItem value="agricultura">Agricultura</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="activity">Tipo de Actividad</Label>
                      <Select
                        value={formData.activity}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, activity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una actividad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="perforacion">Perforación</SelectItem>
                          <SelectItem value="voladura">Voladura</SelectItem>
                          <SelectItem value="excavacion">Excavación</SelectItem>
                          <SelectItem value="transporte">Transporte de Material</SelectItem>
                          <SelectItem value="procesamiento">Procesamiento de Mineral</SelectItem>
                          <SelectItem value="mantenimiento">Mantenimiento de Equipos</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workers">Número de Trabajadores Expuestos</Label>
                      <Input
                        type="number"
                        id="workers"
                        placeholder="Ej: 25"
                        value={formData.workers}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duración de la Exposición (horas/día)</Label>
                      <Input
                        type="number"
                        id="duration"
                        placeholder="Ej: 8"
                        value={formData.duration}
                        onChange={handleInputChange}
                        min="0"
                        max="24"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción de la Tarea</Label>
                    <Textarea
                      id="description"
                      placeholder="Describa brevemente la tarea o actividad a evaluar"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div></div>
                  <Button type="button" onClick={() => setFormTab("environment")}>
                    Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </TabsContent>

              <TabsContent value="environment" className="m-0">
                <CardHeader>
                  <CardTitle>Entorno Laboral</CardTitle>
                  <CardDescription>Evalúe las condiciones del entorno de trabajo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Nivel de Ruido</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bajo (&lt;70 dB)</span>
                      <span className="text-sm text-muted-foreground">Alto (&gt;100 dB)</span>
                    </div>
                    <Slider
                      value={[formData.noiseLevel]}
                      max={100}
                      step={1}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, noiseLevel: value[0] }))}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Calidad del Aire</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Limpio</span>
                      <span className="text-sm text-muted-foreground">Contaminado</span>
                    </div>
                    <Slider
                      value={[formData.airQuality]}
                      max={100}
                      step={1}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, airQuality: value[0] }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperatura Promedio (°C)</Label>
                      <Input
                        type="number"
                        id="temperature"
                        placeholder="Ej: 25"
                        value={formData.temperature}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="humidity">Humedad Relativa (%)</Label>
                      <Input
                        type="number"
                        id="humidity"
                        placeholder="Ej: 60"
                        value={formData.humidity}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Presencia de Sustancias Peligrosas</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="chemicals"
                          checked={formData.hazards.chemicals}
                          onCheckedChange={(checked) => handleSwitchChange("hazards", "chemicals", checked)}
                        />
                        <Label htmlFor="chemicals">Químicos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="dust"
                          checked={formData.hazards.dust}
                          onCheckedChange={(checked) => handleSwitchChange("hazards", "dust", checked)}
                        />
                        <Label htmlFor="dust">Polvo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="gases"
                          checked={formData.hazards.gases}
                          onCheckedChange={(checked) => handleSwitchChange("hazards", "gases", checked)}
                        />
                        <Label htmlFor="gases">Gases</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="biological"
                          checked={formData.hazards.biological}
                          onCheckedChange={(checked) => handleSwitchChange("hazards", "biological", checked)}
                        />
                        <Label htmlFor="biological">Agentes Biológicos</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Factores de Riesgo Mortal</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="confined_spaces"
                          checked={formData.mortalRisks.confined_spaces}
                          onCheckedChange={(checked) => handleSwitchChange("mortalRisks", "confined_spaces", checked)}
                        />
                        <Label htmlFor="confined_spaces">Espacios Confinados</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="heights"
                          checked={formData.mortalRisks.heights}
                          onCheckedChange={(checked) => handleSwitchChange("mortalRisks", "heights", checked)}
                        />
                        <Label htmlFor="heights">Trabajo en Altura</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="explosive"
                          checked={formData.mortalRisks.explosive}
                          onCheckedChange={(checked) => handleSwitchChange("mortalRisks", "explosive", checked)}
                        />
                        <Label htmlFor="explosive">Materiales Explosivos</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="high_voltage"
                          checked={formData.mortalRisks.high_voltage}
                          onCheckedChange={(checked) => handleSwitchChange("mortalRisks", "high_voltage", checked)}
                        />
                        <Label htmlFor="high_voltage">Alta Tensión</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setFormTab("general")}>
                    Anterior
                  </Button>
                  <Button type="button" onClick={() => setFormTab("protection")}>
                    Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </TabsContent>

              <TabsContent value="protection" className="m-0">
                <CardHeader>
                  <CardTitle>Protección y Controles</CardTitle>
                  <CardDescription>Indique las medidas de protección implementadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Equipos de Protección Personal (EPP)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="helmet"
                          checked={formData.ppe.helmet}
                          onCheckedChange={(checked) => handleSwitchChange("ppe", "helmet", checked)}
                        />
                        <Label htmlFor="helmet">Casco de Seguridad</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="respirator"
                          checked={formData.ppe.respirator}
                          onCheckedChange={(checked) => handleSwitchChange("ppe", "respirator", checked)}
                        />
                        <Label htmlFor="respirator">Protección Respiratoria</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="gloves"
                          checked={formData.ppe.gloves}
                          onCheckedChange={(checked) => handleSwitchChange("ppe", "gloves", checked)}
                        />
                        <Label htmlFor="gloves">Guantes de Protección</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="goggles"
                          checked={formData.ppe.goggles}
                          onCheckedChange={(checked) => handleSwitchChange("ppe", "goggles", checked)}
                        />
                        <Label htmlFor="goggles">Gafas de Seguridad</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="boots"
                          checked={formData.ppe.boots}
                          onCheckedChange={(checked) => handleSwitchChange("ppe", "boots", checked)}
                        />
                        <Label htmlFor="boots">Calzado de Seguridad</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="harness"
                          checked={formData.ppe.harness}
                          onCheckedChange={(checked) => handleSwitchChange("ppe", "harness", checked)}
                        />
                        <Label htmlFor="harness">Arnés de Seguridad</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Controles de Ingeniería</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="ventilation"
                          checked={formData.engineering.ventilation}
                          onCheckedChange={(checked) => handleSwitchChange("engineering", "ventilation", checked)}
                        />
                        <Label htmlFor="ventilation">Ventilación Adecuada</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isolation"
                          checked={formData.engineering.isolation}
                          onCheckedChange={(checked) => handleSwitchChange("engineering", "isolation", checked)}
                        />
                        <Label htmlFor="isolation">Aislamiento de Fuentes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="guards"
                          checked={formData.engineering.guards}
                          onCheckedChange={(checked) => handleSwitchChange("engineering", "guards", checked)}
                        />
                        <Label htmlFor="guards">Guardas de Protección</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="automation"
                          checked={formData.engineering.automation}
                          onCheckedChange={(checked) => handleSwitchChange("engineering", "automation", checked)}
                        />
                        <Label htmlFor="automation">Automatización de Procesos</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Controles Administrativos</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="training"
                          checked={formData.administrative.training}
                          onCheckedChange={(checked) => handleSwitchChange("administrative", "training", checked)}
                        />
                        <Label htmlFor="training">Capacitación Regular</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="rotation"
                          checked={formData.administrative.rotation}
                          onCheckedChange={(checked) => handleSwitchChange("administrative", "rotation", checked)}
                        />
                        <Label htmlFor="rotation">Rotación de Personal</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="procedures"
                          checked={formData.administrative.procedures}
                          onCheckedChange={(checked) => handleSwitchChange("administrative", "procedures", checked)}
                        />
                        <Label htmlFor="procedures">Procedimientos Documentados</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="supervision"
                          checked={formData.administrative.supervision}
                          onCheckedChange={(checked) => handleSwitchChange("administrative", "supervision", checked)}
                        />
                        <Label htmlFor="supervision">Supervisión Constante</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additional">Información Adicional Relevante</Label>
                    <Textarea
                      id="additional"
                      placeholder="Indique cualquier otra información que considere relevante para la evaluación"
                      rows={3}
                      value={formData.additional}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setFormTab("environment")}>
                    Anterior
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Evaluar Riesgo"
                    )}
                  </Button>
                </CardFooter>
              </TabsContent>
            </Card>
          </Tabs>
        </form>
      )}

      {/* Diálogo de Informe Detallado */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informe Detallado de Evaluación de Riesgos
            </DialogTitle>
            <DialogDescription>
              Análisis completo de los riesgos identificados y recomendaciones de mitigación
            </DialogDescription>
          </DialogHeader>

          {predictionResult && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6 py-4">
                {/* Encabezado del informe */}
                <div className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold">Evaluación de Riesgos Ocupacionales</h2>
                      <p className="text-sm text-muted-foreground">
                        Generado el{" "}
                        {new Date().toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>{getRiskLevelBadge(predictionResult.riskLevel)}</div>
                  </div>
                </div>

                {/* Resumen ejecutivo */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Resumen Ejecutivo</h3>
                  <p>
                    La evaluación de riesgos ha identificado un nivel de riesgo{" "}
                    <strong>{predictionResult.riskLevel.toLowerCase()}</strong> en el entorno laboral analizado, con una
                    puntuación de riesgo de <strong>{predictionResult.riskScore}/100</strong>.
                    {predictionResult.riskLevel === "Mortal" && (
                      <span className="text-red-600 font-semibold">
                        {" "}
                        Este nivel de riesgo representa una amenaza inmediata para la vida y requiere acción urgente.
                      </span>
                    )}
                  </p>

                  <div className="bg-slate-50 p-4 rounded-md border mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Sector:</p>
                        <p>Minería</p>
                      </div>
                      <div>
                        <p className="font-medium">Actividad:</p>
                        <p>Perforación</p>
                      </div>
                      <div>
                        <p className="font-medium">Trabajadores expuestos:</p>
                        <p>12</p>
                      </div>
                      <div>
                        <p className="font-medium">Duración de exposición:</p>
                        <p>8 horas/día</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Factores de riesgo */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Factores de Riesgo Identificados</h3>
                  <p>
                    Se han identificado los siguientes factores de riesgo críticos que contribuyen a la evaluación
                    general:
                  </p>

                  <div className="mt-2 space-y-3">
                    {predictionResult.factors.map((factor, index) => (
                      <div key={index} className="bg-slate-50 p-3 rounded-md border">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex-shrink-0 rounded-full p-1 ${
                              index < 2 ? "bg-red-100" : index < 4 ? "bg-amber-100" : "bg-blue-100"
                            }`}
                          >
                            <AlertCircle
                              className={`h-3 w-3 ${
                                index < 2 ? "text-red-600" : index < 4 ? "text-amber-600" : "text-blue-600"
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium">{factor}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {index === 0 &&
                                "Factor crítico con alta probabilidad de causar daños graves a la salud respiratoria."}
                              {index === 1 &&
                                "Aumenta significativamente la exposición a partículas dañinas y reduce la calidad del aire respirable."}
                              {index === 2 &&
                                "Reduce la efectividad de las medidas de protección y aumenta la exposición a contaminantes."}
                              {index === 3 &&
                                "Supera los límites permisibles establecidos en la normativa RM 312-2011-MINSA."}
                              {index === 4 &&
                                "Presenta riesgo de asfixia y exposición a gases tóxicos en áreas con ventilación limitada."}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Análisis de impacto */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Análisis de Impacto</h3>
                  <p>Los riesgos identificados pueden tener los siguientes impactos en diferentes áreas:</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {predictionResult.impactAreas.map((area, index) => (
                      <div key={index} className="bg-slate-50 p-3 rounded-md border">
                        <p className="font-medium">{area}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {area === "Salud respiratoria" &&
                            "Riesgo de desarrollar enfermedades respiratorias crónicas como silicosis y EPOC."}
                          {area === "Función pulmonar" &&
                            "Disminución progresiva de la capacidad pulmonar y eficiencia respiratoria."}
                          {area === "Sistema cardiovascular" &&
                            "Mayor esfuerzo cardíaco debido a la reducción de oxígeno en sangre."}
                          {area === "Productividad laboral" &&
                            "Reducción del rendimiento y aumento del ausentismo por problemas de salud."}
                          {area === "Cumplimiento normativo" &&
                            "Incumplimiento de regulaciones que puede resultar en sanciones y clausuras."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan de acción */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Plan de Acción Recomendado</h3>
                  <p>Basado en los riesgos identificados, se recomienda implementar las siguientes medidas:</p>

                  <div className="mt-3 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Medidas Inmediatas (0-7 días)</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>
                          <p className="font-medium">Detener operaciones en áreas críticas</p>
                          <p className="text-sm text-muted-foreground">
                            Suspender temporalmente las actividades en zonas con mayor concentración de contaminantes.
                          </p>
                        </li>
                        <li>
                          <p className="font-medium">Proporcionar EPP respiratorio de alta eficiencia</p>
                          <p className="text-sm text-muted-foreground">
                            Distribuir respiradores con filtros P100 certificados para todos los trabajadores expuestos.
                          </p>
                        </li>
                        <li>
                          <p className="font-medium">Implementar monitoreo continuo de calidad del aire</p>
                          <p className="text-sm text-muted-foreground">
                            Instalar sensores de partículas y gases con alarmas automáticas.
                          </p>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Medidas a Corto Plazo (8-30 días)</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {predictionResult.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index}>
                            <p className="font-medium">{rec}</p>
                            <p className="text-sm text-muted-foreground">
                              {index === 0 &&
                                "Diseñar e instalar sistemas de extracción localizada y ventilación general con capacidad adecuada."}
                              {index === 1 &&
                                "Establecer puntos de muestreo y frecuencia de mediciones según estándares internacionales."}
                              {index === 2 &&
                                "Desarrollar programa de capacitación con evaluaciones prácticas y teóricas."}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Medidas a Mediano Plazo (1-3 meses)</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {predictionResult.recommendations.slice(3).map((rec, index) => (
                          <li key={index}>
                            <p className="font-medium">{rec}</p>
                            <p className="text-sm text-muted-foreground">
                              {index === 0 &&
                                "Coordinar con servicios médicos especializados para evaluaciones periódicas específicas."}
                              {index === 1 &&
                                "Implementar tecnología de detección automática con sistemas de alerta temprana."}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Análisis de costos y plazos */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Análisis de Costos y Plazos</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="bg-slate-50 p-4 rounded-md border">
                      <h4 className="font-medium mb-2">Costos Estimados</h4>
                      <p className="text-lg font-bold">{predictionResult.estimatedCost}</p>
                      <Separator className="my-3" />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Sistemas de ventilación:</span>
                          <span>$8,000 - $12,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Equipos de monitoreo:</span>
                          <span>$3,500 - $5,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>EPP especializado:</span>
                          <span>$2,000 - $3,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Capacitación:</span>
                          <span>$1,500 - $2,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Otros:</span>
                          <span>$2,000</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-md border">
                      <h4 className="font-medium mb-2">Cronograma de Implementación</h4>
                      <p className="text-lg font-bold">{predictionResult.timeToImplement}</p>
                      <Separator className="my-3" />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Medidas inmediatas:</span>
                          <span>1-7 días</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Instalación de ventilación:</span>
                          <span>2-3 semanas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Programa de monitoreo:</span>
                          <span>2 semanas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Capacitación completa:</span>
                          <span>3-4 semanas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Evaluación de efectividad:</span>
                          <span>6 semanas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marco regulatorio */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Marco Regulatorio Aplicable</h3>
                  <p>Las siguientes normativas y regulaciones son aplicables a los riesgos identificados:</p>

                  <div className="mt-3 space-y-3">
                    {predictionResult.regulatoryFramework.map((reg, index) => (
                      <div key={index} className="bg-slate-50 p-3 rounded-md border">
                        <p className="font-medium">{reg}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {reg === "RM 312-2011-MINSA" &&
                            "Establece los protocolos de exámenes médico ocupacionales y guías de diagnóstico para actividades con exposición a polvo de sílice."}
                          {reg === "DS 024-2016-EM" &&
                            "Reglamento de Seguridad y Salud Ocupacional en Minería que establece los estándares para control de riesgos respiratorios."}
                          {reg === "Ley 29783" &&
                            "Ley de Seguridad y Salud en el Trabajo que establece la obligación de implementar medidas preventivas."}
                          {reg === "NIOSH Standard 42 CFR 84" &&
                            "Estándar internacional para la certificación de respiradores y equipos de protección respiratoria."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conclusiones */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Conclusiones</h3>
                  <div className="bg-slate-50 p-4 rounded-md border">
                    <p>
                      La evaluación de riesgos ha identificado un nivel de riesgo{" "}
                      <strong>{predictionResult.riskLevel.toLowerCase()}</strong> que
                      {predictionResult.riskLevel === "Mortal"
                        ? " requiere acción inmediata para prevenir posibles fatalidades."
                        : predictionResult.riskLevel === "Alto"
                          ? " requiere atención prioritaria para prevenir daños graves a la salud."
                          : " debe ser atendido para mejorar las condiciones de seguridad."}
                    </p>
                    <p className="mt-2">
                      La implementación de las medidas recomendadas permitirá reducir significativamente el nivel de
                      riesgo y cumplir con los requisitos regulatorios aplicables. Se recomienda realizar una nueva
                      evaluación después de implementar las medidas para verificar su efectividad.
                    </p>
                    <p className="mt-2">
                      Este informe ha sido generado por el Sistema de Predicción de Riesgos Ocupacionales basado en
                      modelos de aprendizaje automático entrenados con datos históricos de incidentes y evaluaciones de
                      riesgo.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cerrar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShareReport} className="flex items-center gap-2 bg-transparent">
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
              <Button variant="outline" onClick={handlePrintReport} className="flex items-center gap-2 bg-transparent">
                <Printer className="h-4 w-4" />
                Imprimir
              </Button>
              <Button className="flex items-center gap-2" onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
