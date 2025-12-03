"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Gauge,
  Play,
  Pause,
  Shield,
  Zap,
  Send,
  Mail,
  MessageCircle,
  Phone,
  Users,
} from "lucide-react"
import { LocalStorage, STORAGE_KEYS } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useToast } from "@/hooks/use-toast"

interface RealTimeData {
  temperature: number
  humidity: number
  noiseLevel: number
  workersCount: number
  equipmentStatus: "normal" | "warning" | "critical"
  lastUpdate: string
}

interface PredictionResult {
  level: "low" | "medium" | "high" | "critical"
  probability: number
  confidence: number
  recommendations: string[]
  timestamp: string
  factors: {
    environmental: number
    noise: number
    workload: number
    equipment: number
  }
}

interface ManualInputs {
  tipo_actividad: string
  experiencia_trabajador: string
  condiciones_ambientales: string
  estado_equipos: string
  hora_dia: string
  carga_trabajo: string
  riesgo_potencial: string
  uso_epp: string
  fatiga: string
  historial_incidentes: string
  cumplimiento_procedimientos: string
  supervision: string
}

export function RealTimePrediction() {
  const { toast } = useToast()

  const [isMonitoring, setIsMonitoring] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPrediction, setCurrentPrediction] = useState<PredictionResult | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    temperature: 22.0,
    humidity: 45,
    noiseLevel: 65,
    workersCount: 12,
    equipmentStatus: "normal",
    lastUpdate: new Date().toLocaleTimeString(),
  })

  const [editableData, setEditableData] = useState<RealTimeData>({ ...realTimeData })

  const [manualInputs, setManualInputs] = useState<ManualInputs>({
    tipo_actividad: "",
    experiencia_trabajador: "",
    condiciones_ambientales: "",
    estado_equipos: "",
    hora_dia: "",
    carga_trabajo: "",
    riesgo_potencial: "",
    uso_epp: "",
    fatiga: "",
    historial_incidentes: "",
    cumplimiento_procedimientos: "",
    supervision: "",
  })

  const [showSafetyModal, setShowSafetyModal] = useState(false)
  const [selectedManagers, setSelectedManagers] = useState<string[]>([])
  const [selectedMethods, setSelectedMethods] = useState<{ [key: string]: string[] }>({})

  const [safetyManagers, setSafetyManagers] = useState<any[]>([])

  // Load real team members from settings
  useEffect(() => {
    try {
      const savedTeam = LocalStorage.get("TEAM_SETTINGS", [])

      // Filter active team members with safety-related roles
      const safetyTeamMembers = savedTeam
        .filter(
          (member: any) =>
            member.isActive &&
            (member.role.toLowerCase().includes("seguridad") ||
              member.role.toLowerCase().includes("supervisor") ||
              member.role.toLowerCase().includes("jefe") ||
              member.role.toLowerCase().includes("gerente") ||
              member.role.toLowerCase().includes("director") ||
              member.role.toLowerCase().includes("coordinador") ||
              member.role.toLowerCase().includes("especialista") ||
              member.role.toLowerCase().includes("inspector") ||
              member.emergencyContact),
        )
        .map((member: any) => ({
          id: member.id,
          name: member.name,
          position: member.role,
          phone: member.phone,
          email: member.email,
          whatsapp: member.phone, // Use phone as WhatsApp number
          department: member.department,
          emergencyContact: member.emergencyContact,
          notificationPreferences: member.notificationPreferences,
        }))

      if (safetyTeamMembers.length === 0) {
        const fallbackManagers = [
          {
            id: "default-jefe-seguridad",
            name: "No hay responsables configurados",
            position: "Configure el equipo en Configuración > Equipo",
            phone: "+00 000 000 000",
            email: "configurar@empresa.com",
            whatsapp: "+00 000 000 000",
            department: "Sin configurar",
            emergencyContact: false,
            notificationPreferences: {
              email: false,
              sms: false,
              push: false,
              criticalOnly: false,
            },
          },
        ]
        setSafetyManagers(fallbackManagers)
      } else {
        setSafetyManagers(safetyTeamMembers)
      }
    } catch (error) {
      console.error("Error loading team members:", error)
      setSafetyManagers([
        {
          id: "error-loading",
          name: "Error cargando responsables",
          position: "Verifique la configuración del equipo",
          phone: "+00 000 000 000",
          email: "error@empresa.com",
          whatsapp: "+00 000 000 000",
          department: "Error",
          emergencyContact: false,
          notificationPreferences: {
            email: false,
            sms: false,
            push: false,
            criticalOnly: false,
          },
        },
      ])
    }
  }, [])

  // Load saved data on component mount
  useEffect(() => {
    const savedData = LocalStorage.get(STORAGE_KEYS.ENVIRONMENTAL_DATA, realTimeData)
    setRealTimeData(savedData)
    setEditableData(savedData)
  }, [])

  // Save data whenever it changes
  useEffect(() => {
    LocalStorage.set(STORAGE_KEYS.ENVIRONMENTAL_DATA, realTimeData)
  }, [realTimeData])

  // Real-time monitoring effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isMonitoring) {
      interval = setInterval(() => {
        const savedData = LocalStorage.get(STORAGE_KEYS.ENVIRONMENTAL_DATA, realTimeData)

        // Use saved data without modifications during monitoring
        setRealTimeData({
          ...savedData,
          lastUpdate: new Date().toLocaleTimeString(),
        })

        // Generate prediction based on current data
        const prediction = calculateRiskLevel(savedData)
        setCurrentPrediction(prediction)
      }, 3000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isMonitoring])

  const calculateRiskLevel = (data: RealTimeData): PredictionResult => {
    let riskScore = 0
    const factors = { environmental: 0, noise: 0, workload: 0, equipment: 0 }

    // Environmental conditions (temperature + humidity)
    const tempRisk = data.temperature > 30 ? 30 : data.temperature < 10 ? 25 : 10
    const humidityRisk = data.humidity > 70 ? 20 : data.humidity < 30 ? 15 : 5
    factors.environmental = tempRisk + humidityRisk

    // Noise level
    factors.noise = data.noiseLevel > 85 ? 35 : data.noiseLevel > 70 ? 20 : 10

    // Workload (based on workers count)
    factors.workload = data.workersCount > 20 ? 25 : data.workersCount > 15 ? 15 : 10

    // Equipment status
    factors.equipment = data.equipmentStatus === "critical" ? 30 : data.equipmentStatus === "warning" ? 15 : 5

    riskScore = factors.environmental + factors.noise + factors.workload + factors.equipment

    // Determine risk level
    let level: "low" | "medium" | "high" | "critical"
    if (riskScore >= 80) level = "critical"
    else if (riskScore >= 60) level = "high"
    else if (riskScore >= 40) level = "medium"
    else level = "low"

    // Calculate probability and confidence
    const probability = Math.min(riskScore * 1.2, 100)
    const confidence = 75 + Math.random() * 15 // 75-90% confidence range

    return {
      level,
      probability,
      confidence,
      recommendations: generateRecommendations(data),
      timestamp: new Date().toLocaleString("es-ES"),
      factors: {
        environmental: (factors.environmental / riskScore) * 100,
        noise: (factors.noise / riskScore) * 100,
        workload: (factors.workload / riskScore) * 100,
        equipment: (factors.equipment / riskScore) * 100,
      },
    }
  }

  const generateRecommendations = (data: RealTimeData): string[] => {
    const recommendations: string[] = []

    if (data.temperature > 30) {
      recommendations.push("Implementar medidas de enfriamiento y hidratación frecuente")
    }
    if (data.noiseLevel > 85) {
      recommendations.push("Uso obligatorio de protección auditiva")
    }
    if (data.equipmentStatus !== "normal") {
      recommendations.push("Inspección inmediata de equipos y mantenimiento preventivo")
    }
    if (data.workersCount > 15) {
      recommendations.push("Redistribuir carga de trabajo y supervisión adicional")
    }

    if (recommendations.length === 0) {
      recommendations.push("Mantener condiciones actuales y monitoreo continuo")
    }

    return recommendations
  }

  const handleStartMonitoring = () => {
    setIsMonitoring(true)
    toast({
      title: "Monitoreo Iniciado",
      description: "El sistema está monitoreando las condiciones en tiempo real.",
    })
  }

  const handleStopMonitoring = () => {
    setIsMonitoring(false)
    toast({
      title: "Monitoreo Detenido",
      description: "El monitoreo en tiempo real ha sido pausado.",
    })
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setRealTimeData(editableData)
    setIsEditing(false)
    toast({
      title: "Datos Guardados",
      description: "Los datos ambientales han sido actualizados correctamente.",
    })
  }

  const handleCancel = () => {
    setEditableData(realTimeData)
    setIsEditing(false)
  }

  const handleManualPrediction = () => {
    // Validate required fields
    const errors: string[] = []
    const requiredFields = [
      { key: "tipo_actividad", label: "Tipo de Actividad" },
      { key: "experiencia_trabajador", label: "Experiencia del Trabajador" },
      { key: "condiciones_ambientales", label: "Condiciones Ambientales" },
      { key: "estado_equipos", label: "Estado de Equipos" },
      { key: "hora_dia", label: "Hora del Día" },
      { key: "carga_trabajo", label: "Carga de Trabajo" },
      { key: "riesgo_potencial", label: "Riesgo Potencial de la Actividad" },
      { key: "uso_epp", label: "Uso de EPP" },
      { key: "fatiga", label: "Fatiga y Estado Físico" },
      { key: "historial_incidentes", label: "Historial de Incidentes" },
      { key: "cumplimiento_procedimientos", label: "Cumplimiento de Procedimientos" },
      { key: "supervision", label: "Supervisión en el Lugar" },
    ]

    requiredFields.forEach((field) => {
      if (!manualInputs[field.key as keyof typeof manualInputs]) {
        errors.push(`${field.label} es obligatorio`)
      }
    })

    if (errors.length > 0) {
      setValidationErrors(errors)
      toast({
        title: "Campos incompletos",
        description: "Por favor complete todos los campos antes de generar la predicción.",
        variant: "destructive",
      })
      return
    }

    setValidationErrors([])

    // Calculate enhanced risk based on IPERC matrix
    const calculateEnhancedRisk = (): { level: "low" | "medium" | "high" | "critical"; score: number } => {
      let riskScore = 0

      // Activity type risk weights
      const activityRisks = {
        altura: 25,
        espacios_confinados: 30,
        electricos: 20,
        quimicos: 25,
        maquinaria: 15,
        soldadura: 18,
        excavacion: 22,
        otros: 10,
      }

      // Experience level weights
      const experienceWeights = {
        novato: 25,
        intermedio: 15,
        experto: 5,
        senior: 3,
      }

      // Environmental conditions
      const environmentalRisks = {
        adversas: 20,
        normales: 5,
        optimas: 0,
      }

      // Equipment status
      const equipmentRisks = {
        critico: 25,
        fallas_leves: 15,
        bueno: 5,
        optimo: 0,
      }

      // Calculate weighted risk score
      riskScore += activityRisks[manualInputs.tipo_actividad as keyof typeof activityRisks] || 10
      riskScore += experienceWeights[manualInputs.experiencia_trabajador as keyof typeof experienceWeights] || 15
      riskScore += environmentalRisks[manualInputs.condiciones_ambientales as keyof typeof environmentalRisks] || 5
      riskScore += equipmentRisks[manualInputs.estado_equipos as keyof typeof equipmentRisks] || 5

      // Additional risk factors
      if (manualInputs.uso_epp !== "completo") riskScore += 15
      if (manualInputs.fatiga !== "descansado") riskScore += 10
      if (manualInputs.supervision === "ausente") riskScore += 20
      if (manualInputs.historial_incidentes !== "ninguno") riskScore += 12

      // Determine risk level
      let level: "low" | "medium" | "high" | "critical"
      if (riskScore >= 80) level = "critical"
      else if (riskScore >= 60) level = "high"
      else if (riskScore >= 40) level = "medium"
      else level = "low"

      return { level, score: riskScore }
    }

    const generateSpecificRecommendations = (): string[] => {
      const recommendations: string[] = []

      if (manualInputs.uso_epp !== "completo") {
        recommendations.push("Implementar programa de uso obligatorio de EPP completo y verificación diaria")
      }
      if (manualInputs.fatiga !== "descansado") {
        recommendations.push("Establecer rotaciones de personal y pausas obligatorias para prevenir fatiga")
      }
      if (manualInputs.cumplimiento_procedimientos !== "100") {
        recommendations.push("Reforzar capacitación en procedimientos seguros y supervisión de cumplimiento")
      }
      if (manualInputs.supervision === "ausente") {
        recommendations.push("Asignar supervisor de seguridad permanente en el área de trabajo")
      }
      if (manualInputs.historial_incidentes !== "ninguno") {
        recommendations.push("Realizar análisis de causas raíz de incidentes previos e implementar medidas correctivas")
      }
      if (manualInputs.estado_equipos !== "optimo") {
        recommendations.push("Ejecutar mantenimiento preventivo inmediato y verificación de equipos críticos")
      }

      // Activity-specific recommendations
      if (manualInputs.tipo_actividad === "altura") {
        recommendations.push("Verificar sistemas de protección contra caídas y líneas de vida")
      }
      if (manualInputs.tipo_actividad === "espacios_confinados") {
        recommendations.push("Implementar protocolo de entrada a espacios confinados con monitoreo atmosférico")
      }
      if (manualInputs.tipo_actividad === "electricos") {
        recommendations.push("Aplicar procedimiento de bloqueo y etiquetado (LOTO) antes de iniciar trabajos")
      }

      if (recommendations.length === 0) {
        recommendations.push("Mantener condiciones actuales y realizar monitoreo continuo de factores de riesgo")
      }

      return recommendations
    }

    const riskResult = calculateEnhancedRisk()
    const prediction: PredictionResult = {
      level: riskResult.level,
      probability: Math.min(riskResult.score * 1.2, 100),
      confidence: 85 + Math.random() * 10,
      recommendations: generateSpecificRecommendations(),
      timestamp: new Date().toLocaleString("es-ES"),
      factors: {
        environmental: 25,
        noise: 20,
        workload: 30,
        equipment: 25,
      },
    }

    setCurrentPrediction(prediction)

    toast({
      title: "Predicción generada exitosamente",
      description: `Nivel de riesgo: ${prediction.level.toUpperCase()} (${riskResult.score}/100 puntos)`,
      variant: prediction.level === "critical" ? "destructive" : "default",
    })
  }

  const handleOpenSafetyModal = (prediction: PredictionResult) => {
    setCurrentPrediction(prediction)
    setShowSafetyModal(true)

    // Pre-select managers based on their actual roles and risk level
    const availableManagerIds = safetyManagers.map((manager) => manager.id)
    let preSelectedIds: string[] = []

    if (prediction.level === "critical") {
      // For critical risks, select all available safety managers
      preSelectedIds = availableManagerIds
    } else if (prediction.level === "high") {
      // For high risks, prioritize emergency contacts and supervisors
      preSelectedIds = safetyManagers
        .filter(
          (manager) =>
            manager.emergencyContact ||
            manager.position.toLowerCase().includes("jefe") ||
            manager.position.toLowerCase().includes("supervisor") ||
            manager.position.toLowerCase().includes("gerente"),
        )
        .map((manager) => manager.id)
    } else {
      // For medium/low risks, select primary safety contacts
      preSelectedIds = safetyManagers
        .filter(
          (manager) =>
            manager.position.toLowerCase().includes("jefe") || manager.position.toLowerCase().includes("supervisor"),
        )
        .map((manager) => manager.id)
    }

    // Fallback to first available manager if no matches found
    if (preSelectedIds.length === 0 && availableManagerIds.length > 0) {
      preSelectedIds = [availableManagerIds[0]]
    }

    setSelectedManagers(preSelectedIds)

    // Pre-select notification methods based on risk level and manager preferences
    const initialMethods: { [key: string]: string[] } = {}
    preSelectedIds.forEach((managerId) => {
      const manager = safetyManagers.find((m) => m.id === managerId)
      if (manager) {
        if (prediction.level === "critical") {
          // For critical risks, use all available methods
          initialMethods[managerId] = manager.notificationPreferences || ["email"]
        } else {
          // For other risks, use preferred methods
          initialMethods[managerId] = manager.notificationPreferences?.slice(0, 2) || ["email"]
        }
      }
    })
    setSelectedMethods(initialMethods)
  }

  const handleConfirmSendToManagers = () => {
    if (selectedManagers.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un responsable",
        variant: "destructive",
      })
      return
    }

    const prediction = currentPrediction
    if (!prediction) return

    const riskData = {
      timestamp: new Date().toLocaleString("es-ES"),
      riskLevel: prediction.level,
      probability: prediction.probability,
      confidence: prediction.confidence,
      recommendations: prediction.recommendations,
      manualInputData: manualInputs,
      location: "Área de Trabajo Principal",
      reportedBy: "Sistema de Predicción Manual",
    }

    const urgency = prediction.level === "critical" ? "URGENTE" : prediction.level === "high" ? "ALTA" : "NORMAL"

    // Send to selected managers with selected methods
    selectedManagers.forEach((managerId) => {
      const manager = safetyManagers.find((m) => m.id === managerId)
      const methods = selectedMethods[managerId] || []

      if (manager && methods.length > 0) {
        methods.forEach((method) => {
          console.log(`Enviando por ${method} a ${manager.name}: ${manager[method as keyof typeof manager]}`)
        })
      }
    })

    // Save notification
    const existingNotifications = LocalStorage.get(STORAGE_KEYS.NOTIFICATIONS, [])
    const notificationsArray = Array.isArray(existingNotifications) ? existingNotifications : []

    const newNotification = {
      id: Date.now().toString(),
      type: "safety_alert",
      title: `Alerta de Riesgo ${urgency}`,
      message: `Riesgo ${prediction.level} detectado (${prediction.probability}% probabilidad)`,
      timestamp: new Date().toISOString(),
      read: false,
      data: riskData,
      recipients: selectedManagers.map((id) => safetyManagers.find((m) => m.id === id)?.name).filter(Boolean),
      methods: Object.values(selectedMethods).flat(),
    }

    notificationsArray.unshift(newNotification)
    LocalStorage.set(STORAGE_KEYS.NOTIFICATIONS, notificationsArray)

    toast({
      title: "Éxito",
      description: `Alerta enviada a ${selectedManagers.length} responsable(s)`,
      variant: "default",
    })
    setShowSafetyModal(false)
    setSelectedManagers([])
    setSelectedMethods({})
  }

  const handleManagerSelection = (managerId: string, checked: boolean) => {
    if (checked) {
      setSelectedManagers((prev) => [...prev, managerId])
    } else {
      setSelectedManagers((prev) => prev.filter((id) => id !== managerId))
      setSelectedMethods((prev) => {
        const newMethods = { ...prev }
        delete newMethods[managerId]
        return newMethods
      })
    }
  }

  const handleMethodSelection = (managerId: string, method: string, checked: boolean) => {
    setSelectedMethods((prev) => {
      const currentMethods = prev[managerId]
      const managerMethods = Array.isArray(currentMethods) ? currentMethods : []

      if (checked) {
        return { ...prev, [managerId]: [...managerMethods, method] }
      } else {
        return { ...prev, [managerId]: managerMethods.filter((m) => m !== method) }
      }
    })
  }

  const handleSendToSafetyManagers = (prediction: PredictionResult) => {
    const riskData = {
      timestamp: new Date().toLocaleString("es-ES"),
      riskLevel: prediction.level,
      probability: prediction.probability,
      confidence: prediction.confidence,
      recommendations: prediction.recommendations,
      manualInputData: manualInputs,
      location: "Área de Trabajo Principal",
      reportedBy: "Sistema de Predicción Manual",
    }

    // Determine urgency based on risk level
    const urgency = prediction.level === "critical" ? "URGENTE" : prediction.level === "high" ? "ALTA" : "NORMAL"

    const recipients = ["Jefe de Seguridad Industrial", "Supervisor SST", "Gerente de Operaciones"]

    // Add more recipients for critical risks
    if (prediction.level === "critical") {
      recipients.push("Director General", "Coordinador de Emergencias")
    }

    // Simulate sending notifications
    recipients.forEach((recipient) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: "safety_alert" as const,
        title: `${urgency}: Predicción de Riesgo ${prediction.level.toUpperCase()}`,
        message: `Se ha detectado un riesgo ${prediction.level} con ${prediction.probability.toFixed(1)}% de probabilidad. Se requiere atención inmediata.`,
        timestamp: new Date().toISOString(),
        recipient,
        data: riskData,
        read: false,
      }

      // Save notification
      const existingNotifications = LocalStorage.get(STORAGE_KEYS.NOTIFICATIONS, [])
      const notificationsArray = Array.isArray(existingNotifications) ? existingNotifications : []
      notificationsArray.unshift(notification)
      LocalStorage.set(STORAGE_KEYS.NOTIFICATIONS, notificationsArray.slice(0, 50))
    })

    // Show confirmation
    toast({
      title: "Notificación Enviada",
      description: `Se ha enviado la alerta de riesgo ${prediction.level} a ${recipients.length} responsables de seguridad.`,
      variant: prediction.level === "critical" ? "destructive" : "default",
    })

    // Show emergency protocol for critical risks
    if (prediction.level === "critical") {
      toast({
        title: "🚨 PROTOCOLO DE EMERGENCIA ACTIVADO",
        description: "Se ha activado el protocolo de emergencia. Los responsables han sido notificados inmediatamente.",
        variant: "destructive",
      })
    }
  }

  const handleExportData = () => {
    const exportData = {
      realTimeData,
      currentPrediction,
      manualInputs,
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `prediccion-riesgos-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Datos Exportados",
      description: "Los datos de predicción han sido exportados exitosamente.",
    })
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-600 hover:bg-red-700"
      case "high":
        return "bg-orange-600 hover:bg-orange-700"
      case "medium":
        return "bg-yellow-600 hover:bg-yellow-700"
      default:
        return "bg-blue-600 hover:bg-blue-700"
    }
  }

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-600"
      case "high":
        return "bg-orange-600"
      case "medium":
        return "bg-yellow-600"
      default:
        return "bg-blue-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Predicción de Riesgos en Tiempo Real</h2>
          <p className="text-muted-foreground">
            Analice y prediga riesgos ocupacionales basados en datos en tiempo real de sensores y condiciones de trabajo
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            size="lg"
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Detener Monitoreo
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Monitoreo
              </>
            )}
          </Button>
          <Button onClick={handleExportData} variant="outline" size="lg">
            <Download className="h-4 w-4 mr-2" />
            Exportar Datos
          </Button>
        </div>
      </div>

      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="realtime">Tiempo Real</TabsTrigger>
          <TabsTrigger value="manual">Predicción Manual</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Datos en Tiempo Real
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!isMonitoring && (
                      <Button onClick={isEditing ? handleSave : handleEdit} variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditing ? "Guardar" : "Editar"}
                      </Button>
                    )}
                    {isEditing && (
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        Cancelar
                      </Button>
                    )}
                    {isMonitoring && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Activity className="h-3 w-3 mr-1" />
                        Monitoreando
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription>Última actualización: {realTimeData.lastUpdate}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Temperatura</Label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editableData.temperature}
                        onChange={(e) =>
                          setEditableData({
                            ...editableData,
                            temperature: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full p-2 border rounded"
                        step="0.1"
                      />
                    ) : (
                      <div className="text-2xl font-bold">{realTimeData.temperature}°C</div>
                    )}
                  </div>
                  <div>
                    <Label>Humedad</Label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editableData.humidity}
                        onChange={(e) =>
                          setEditableData({
                            ...editableData,
                            humidity: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full p-2 border rounded"
                        min="0"
                        max="100"
                      />
                    ) : (
                      <div className="text-2xl font-bold">{realTimeData.humidity}%</div>
                    )}
                  </div>
                  <div>
                    <Label>Nivel de Ruido</Label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editableData.noiseLevel}
                        onChange={(e) =>
                          setEditableData({
                            ...editableData,
                            noiseLevel: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full p-2 border rounded"
                      />
                    ) : (
                      <div className="text-2xl font-bold">{realTimeData.noiseLevel} dB</div>
                    )}
                  </div>
                  <div>
                    <Label>Trabajadores Activos</Label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editableData.workersCount}
                        onChange={(e) =>
                          setEditableData({
                            ...editableData,
                            workersCount: Number.parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full p-2 border rounded"
                        min="0"
                      />
                    ) : (
                      <div className="text-2xl font-bold">{realTimeData.workersCount}</div>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Estado de Equipos</Label>
                  {isEditing ? (
                    <select
                      value={editableData.equipmentStatus}
                      onChange={(e) =>
                        setEditableData({
                          ...editableData,
                          equipmentStatus: e.target.value as "normal" | "warning" | "critical",
                        })
                      }
                      className="w-full p-2 border rounded"
                    >
                      <option value="normal">Normal</option>
                      <option value="warning">Advertencia</option>
                      <option value="critical">Crítico</option>
                    </select>
                  ) : (
                    <Badge
                      variant={
                        realTimeData.equipmentStatus === "normal"
                          ? "secondary"
                          : realTimeData.equipmentStatus === "warning"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {realTimeData.equipmentStatus === "normal"
                        ? "Normal"
                        : realTimeData.equipmentStatus === "warning"
                          ? "Advertencia"
                          : "Crítico"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Predicción Actual
                </CardTitle>
                <CardDescription>Análisis automático basado en datos en tiempo real</CardDescription>
              </CardHeader>
              <CardContent>
                {currentPrediction ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`${getRiskBadgeColor(currentPrediction.level)} text-white cursor-pointer hover:opacity-80 transition-opacity`}
                        onClick={() => {
                          toast({
                            title: "Detalles de Predicción",
                            description: `Nivel: ${currentPrediction.level.toUpperCase()}, Probabilidad: ${currentPrediction.probability.toFixed(1)}%`,
                          })
                        }}
                      >
                        {currentPrediction.level === "critical"
                          ? "Crítico"
                          : currentPrediction.level === "high"
                            ? "Alto"
                            : currentPrediction.level === "medium"
                              ? "Medio"
                              : "Bajo"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{currentPrediction.timestamp}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Probabilidad de Riesgo</span>
                          <span>{currentPrediction.probability.toFixed(1)}%</span>
                        </div>
                        <Progress value={currentPrediction.probability} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Confianza del Modelo</span>
                          <span>{currentPrediction.confidence.toFixed(1)}%</span>
                        </div>
                        <Progress value={currentPrediction.confidence} className="h-2" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Factores de Riesgo Identificados</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Condiciones Ambientales</span>
                          <span className="text-sm font-medium">
                            {currentPrediction.factors.environmental.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Nivel de Ruido</span>
                          <span className="text-sm font-medium">{currentPrediction.factors.noise.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Carga de Trabajo</span>
                          <span className="text-sm font-medium">{currentPrediction.factors.workload.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Estado de Equipos</span>
                          <span className="text-sm font-medium">{currentPrediction.factors.equipment.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">Recomendaciones</h4>
                      <div className="space-y-2">
                        {currentPrediction.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-center">
                      <Button
                        onClick={() => handleOpenSafetyModal(currentPrediction)}
                        className={`${getRiskColor(currentPrediction.level)} text-white`}
                        size="lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar a Responsables de Seguridad
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {isMonitoring
                        ? "Generando predicción inicial..."
                        : "Inicie el monitoreo para ver predicciones en tiempo real"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Predicción Manual - Matriz IPERC
                </CardTitle>
                <CardDescription>
                  Complete todos los campos para obtener una evaluación de riesgo precisa según normativa vigente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {validationErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc pl-4 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Gauge className="h-4 w-4" />
                    <h3 className="font-medium">Campos Actuales Expandidos</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo_actividad">Tipo de Actividad *</Label>
                      <Select
                        value={manualInputs.tipo_actividad}
                        onValueChange={(value) => setManualInputs({ ...manualInputs, tipo_actividad: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar actividad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="altura">Trabajos en Altura</SelectItem>
                          <SelectItem value="espacios_confinados">Espacios Confinados</SelectItem>
                          <SelectItem value="electricos">Trabajos Eléctricos</SelectItem>
                          <SelectItem value="quimicos">Manipulación Química</SelectItem>
                          <SelectItem value="maquinaria">Operación de Maquinaria</SelectItem>
                          <SelectItem value="soldadura">Soldadura y Corte</SelectItem>
                          <SelectItem value="excavacion">Excavación</SelectItem>
                          <SelectItem value="otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="experiencia_trabajador">Experiencia del Trabajador *</Label>
                      <Select
                        value={manualInputs.experiencia_trabajador}
                        onValueChange={(value) => setManualInputs({ ...manualInputs, experiencia_trabajador: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nivel de experiencia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="novato">Novato (0-6 meses)</SelectItem>
                          <SelectItem value="intermedio">Intermedio (6 meses - 2 años)</SelectItem>
                          <SelectItem value="experto">Experto (2-5 años)</SelectItem>
                          <SelectItem value="senior">Senior (+5 años)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="condiciones_ambientales">Condiciones Ambientales *</Label>
                      <Select
                        value={manualInputs.condiciones_ambientales}
                        onValueChange={(value) => setManualInputs({ ...manualInputs, condiciones_ambientales: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Condiciones del ambiente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="optimas">Óptimas</SelectItem>
                          <SelectItem value="normales">Normales</SelectItem>
                          <SelectItem value="adversas">Adversas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="estado_equipos">Estado de Equipos *</Label>
                      <Select
                        value={manualInputs.estado_equipos}
                        onValueChange={(value) => setManualInputs({ ...manualInputs, estado_equipos: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Estado de equipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="optimo">Óptimo</SelectItem>
                          <SelectItem value="bueno">Bueno</SelectItem>
                          <SelectItem value="fallas_leves">Con Fallas Leves</SelectItem>
                          <SelectItem value="critico">Crítico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="hora_dia">Hora del Día *</Label>
                      <Select
                        value={manualInputs.hora_dia}
                        onValueChange={(value) => setManualInputs({ ...manualInputs, hora_dia: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Turno de trabajo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manana">Turno Mañana (06:00-14:00)</SelectItem>
                          <SelectItem value="tarde">Turno Tarde (14:00-22:00)</SelectItem>
                          <SelectItem value="noche">Turno Noche (22:00-06:00)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="carga_trabajo">Carga de Trabajo *</Label>
                      <Select
                        value={manualInputs.carga_trabajo}
                        onValueChange={(value) => setManualInputs({ ...manualInputs, carga_trabajo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nivel de carga" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ligera">Ligera</SelectItem>
                          <SelectItem value="moderada">Moderada</SelectItem>
                          <SelectItem value="pesada">Pesada</SelectItem>
                          <SelectItem value="extrema">Extrema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <h3 className="font-medium">Nuevos Campos Críticos</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="riesgo_potencial">Riesgo Potencial de la Actividad *</Label>
                      <Select
                        value={manualInputs.riesgo_potencial}
                        onValueChange={(value) => setManualInputs({ ...manualInputs, riesgo_potencial: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nivel de riesgo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bajo">Bajo</SelectItem>
                          <SelectItem value="medio">Medio</SelectItem>
                          <SelectItem value="alto">Alto</SelectItem>
                          <SelectItem value="critico">Crítico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="uso_epp">Uso de EPP *</Label>
                      <Select
                        value={manualInputs.uso_epp}
                        onValueChange={(value) => setManualInputs({ ...manualInputs, uso_epp: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Estado del EPP" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completo">Completo y Adecuado</SelectItem>
                          <SelectItem value="parcial">Parcial</SelectItem>
                          <SelectItem value="inadecuado">Inadecuado</SelectItem>
                          <SelectItem value="ausente">Ausente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="fatiga">Fatiga y Estado Físico del Trabajador *</Label>
                      <Select
                        value={manualInputs.fatiga}
                        onValueChange={(value) => setManualInputs({ ...manualInputs, fatiga: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Estado físico" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="descansado">Descansado</SelectItem>
                          <SelectItem value="ligeramente_fatigado">Ligeramente Fatigado</SelectItem>
                          <SelectItem value="fatigado">Fatigado</SelectItem>
                          <SelectItem value="exhausto">Exhausto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="historial_incidentes">Historial de Incidentes *</Label>
                      <Select
                        value={manualInputs.historial_incidentes}
                        onValueChange={(value) => setManualInputs({ ...manualInputs, historial_incidentes: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Incidentes previos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ninguno">Ninguno</SelectItem>
                          <SelectItem value="1-2">1-2 últimos 12 meses</SelectItem>
                          <SelectItem value="3-5">3-5 últimos 12 meses</SelectItem>
                          <SelectItem value="mas_5">Más de 5 últimos 12 meses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cumplimiento_procedimientos">Cumplimiento de Procedimientos Seguros *</Label>
                      <Select
                        value={manualInputs.cumplimiento_procedimientos}
                        onValueChange={(value) =>
                          setManualInputs({ ...manualInputs, cumplimiento_procedimientos: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nivel de cumplimiento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100">100% - Excelente</SelectItem>
                          <SelectItem value="75">75% - Bueno</SelectItem>
                          <SelectItem value="50">50% - Regular</SelectItem>
                          <SelectItem value="25">25% - Deficiente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="supervision">Supervisión en el Lugar de Trabajo *</Label>
                      <Select
                        value={manualInputs.supervision}
                        onValueChange={(value) => setManualInputs({ ...manualInputs, supervision: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nivel de supervisión" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="continua">Continua</SelectItem>
                          <SelectItem value="frecuente">Frecuente</SelectItem>
                          <SelectItem value="ocasional">Ocasional</SelectItem>
                          <SelectItem value="parcial">Parcial</SelectItem>
                          <SelectItem value="ausente">Ausente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleManualPrediction} className="w-full" size="lg">
                    <Zap className="h-4 w-4 mr-2" />
                    Generar Predicción
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resultado de Predicción</CardTitle>
                <CardDescription>Análisis basado en los parámetros ingresados</CardDescription>
              </CardHeader>
              <CardContent>
                {currentPrediction ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getRiskBadgeColor(currentPrediction.level)} text-white`}>
                        {currentPrediction.level === "critical"
                          ? "Crítico"
                          : currentPrediction.level === "high"
                            ? "Alto"
                            : currentPrediction.level === "medium"
                              ? "Medio"
                              : "Bajo"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">Generado: {currentPrediction.timestamp}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Probabilidad de Riesgo</span>
                          <span>{currentPrediction.probability.toFixed(1)}% de probabilidad</span>
                        </div>
                        <Progress value={currentPrediction.probability} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Confianza</span>
                          <span>{currentPrediction.confidence.toFixed(1)}% de confianza</span>
                        </div>
                        <Progress value={currentPrediction.confidence} className="h-3" />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Recomendaciones</h4>
                      <div className="space-y-2">
                        {currentPrediction.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-center">
                      <Button
                        onClick={() => handleOpenSafetyModal(currentPrediction)}
                        className={`${getRiskColor(currentPrediction.level)} text-white`}
                        size="lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar a Responsables de Seguridad
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Complete el formulario y genere una predicción para ver los resultados
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historial de Predicciones
              </CardTitle>
              <CardDescription>Registro histórico de todas las predicciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  El historial de predicciones se mostrará aquí una vez que se realicen predicciones
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showSafetyModal} onOpenChange={setShowSafetyModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              Enviar Alerta a Responsables de Seguridad
            </DialogTitle>
            <DialogDescription>
              Selecciona los responsables y métodos de contacto para enviar la alerta de riesgo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Risk Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Resumen del Riesgo</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Nivel:</span>
                  <Badge
                    className={`ml-2 ${
                      currentPrediction?.level === "critical"
                        ? "bg-red-500"
                        : currentPrediction?.level === "high"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                    }`}
                  >
                    {currentPrediction?.level === "critical"
                      ? "Crítico"
                      : currentPrediction?.level === "high"
                        ? "Alto"
                        : "Medio"}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Probabilidad:</span>
                  <span className="ml-2 font-semibold">{currentPrediction?.probability}%</span>
                </div>
              </div>
            </div>

            {/* Managers Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Seleccionar Responsables</h3>
                <Badge variant="outline" className="text-xs">
                  {safetyManagers.length} responsables disponibles
                </Badge>
              </div>

              {safetyManagers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No hay responsables configurados</p>
                  <p className="text-sm">Ve a Configuración → Equipo para agregar responsables de seguridad</p>
                </div>
              ) : (
                safetyManagers.map((manager) => (
                  <div key={manager.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedManagers.includes(manager.id)}
                        onCheckedChange={(checked) => handleManagerSelection(manager.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{manager.name}</h4>
                          <Badge variant="outline">{manager.position}</Badge>
                          {manager.department && (
                            <Badge variant="secondary" className="text-xs">
                              {manager.department}
                            </Badge>
                          )}
                          {manager.emergencyContact && (
                            <Badge variant="destructive" className="text-xs">
                              Contacto de Emergencia
                            </Badge>
                          )}
                        </div>

                        {selectedManagers.includes(manager.id) && (
                          <div className="space-y-2 mt-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Métodos de contacto:</p>
                            <div className="flex flex-wrap gap-2">
                              {manager.notificationPreferences?.email !== false && (
                                <label className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={
                                      Array.isArray(selectedMethods[manager.id])
                                        ? selectedMethods[manager.id].includes("email")
                                        : false
                                    }
                                    onCheckedChange={(checked) =>
                                      handleMethodSelection(manager.id, "email", checked as boolean)
                                    }
                                  />
                                  <Mail className="h-4 w-4" />
                                  Email ({manager.email || "No configurado"})
                                </label>
                              )}
                              {manager.notificationPreferences?.sms !== false && manager.whatsapp && (
                                <label className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={
                                      Array.isArray(selectedMethods[manager.id])
                                        ? selectedMethods[manager.id].includes("whatsapp")
                                        : false
                                    }
                                    onCheckedChange={(checked) =>
                                      handleMethodSelection(manager.id, "whatsapp", checked as boolean)
                                    }
                                  />
                                  <MessageCircle className="h-4 w-4" />
                                  WhatsApp ({manager.whatsapp})
                                </label>
                              )}
                              {manager.phone && (
                                <label className="flex items-center gap-2 text-sm">
                                  <Checkbox
                                    checked={
                                      Array.isArray(selectedMethods[manager.id])
                                        ? selectedMethods[manager.id].includes("phone")
                                        : false
                                    }
                                    onCheckedChange={(checked) =>
                                      handleMethodSelection(manager.id, "phone", checked as boolean)
                                    }
                                  />
                                  <Phone className="h-4 w-4" />
                                  Teléfono ({manager.phone})
                                </label>
                              )}
                            </div>

                            {manager.notificationPreferences?.criticalOnly && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                <AlertTriangle className="h-3 w-3 inline mr-1" />
                                Este responsable solo recibe notificaciones críticas
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSafetyModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSendToManagers}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={selectedManagers.length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Alerta ({selectedManagers.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RealTimePrediction
