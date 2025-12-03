"use client"

import { logger } from "@/lib/logger"
import { useState, useEffect, useCallback } from "react"
import { Bell, X, AlertTriangle, CheckCircle2, Info, Clock, Skull, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LocalStorage, STORAGE_KEYS } from "@/lib/storage"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error" | "critical"
  timestamp: Date
  read: boolean
  link?: string
  scenario?: {
    id: string
    title: string
    riskLevel: string
    sector: string
  }
  sentTo?: string[]
  priority: "low" | "medium" | "high" | "critical"
}

interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  isActive: boolean
  notificationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
    criticalOnly: boolean
  }
  emergencyContact: boolean
  lastActive: Date
}

interface NotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  criticalOnly: boolean
  autoSendToResponsibles: boolean
  sendToAll: boolean
  soundEnabled: boolean
  desktopNotifications: boolean
}

export function RealTimeNotifications() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotificationDetails, setShowNotificationDetails] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    criticalOnly: false,
    autoSendToResponsibles: true,
    sendToAll: false,
    soundEnabled: true,
    desktopNotifications: true,
  })

  // Cargar configuraciones y equipo desde localStorage
  useEffect(() => {
    try {
      // Cargar configuraciones generales
      const savedSettings = LocalStorage.get(STORAGE_KEYS.SETTINGS, {})
      if (savedSettings.notifications) {
        setNotificationSettings(savedSettings.notifications)
      }

      // Cargar equipo de seguridad
      const savedTeam = LocalStorage.get("TEAM_SETTINGS", [])
      setTeamMembers(savedTeam)

      // Cargar notificaciones existentes
      const savedNotifications = LocalStorage.get("NOTIFICATIONS", [])
      if (savedNotifications.length > 0) {
        const parsedNotifications = savedNotifications.map((notif: any) => ({
          ...notif,
          timestamp: new Date(notif.timestamp),
        }))
        setNotifications(parsedNotifications)
      } else {
        // Crear notificaciones iniciales si no existen
        const initialNotifications = createInitialNotifications()
        setNotifications(initialNotifications)
        LocalStorage.set("NOTIFICATIONS", initialNotifications)
      }
    } catch (error) {
      logger.error("Error cargando datos:", error)
    }
  }, [])

  const createInitialNotifications = (): Notification[] => [
    {
      id: "notif-001",
      title: "Nuevo riesgo detectado",
      message: "Se ha detectado un nuevo riesgo de nivel alto en el área de perforación.",
      type: "warning",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      priority: "high",
      scenario: {
        id: "scen-001",
        title: "Exposición a polvo de sílice en perforación subterránea",
        riskLevel: "Alto",
        sector: "Minería",
      },
      sentTo: teamMembers
        .filter((m) => m.isActive)
        .slice(0, 2)
        .map((m) => m.name),
    },
    {
      id: "notif-002",
      title: "Informe generado",
      message: "El informe mensual de seguridad ha sido generado y está listo para su revisión.",
      type: "success",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      priority: "medium",
      link: "/reports/monthly",
    },
    {
      id: "notif-003",
      title: "Mantenimiento programado",
      message: "El sistema estará en mantenimiento el día 15/05/2025 de 22:00 a 23:00 hrs.",
      type: "info",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true,
      priority: "low",
    },
  ]

  // Función para actualizar el contador de no leídos
  const updateUnreadCount = useCallback(() => {
    const count = notifications.filter((n) => !n.read).length
    setUnreadCount(count)
  }, [notifications])

  // Simular notificaciones entrantes
  useEffect(() => {
    updateUnreadCount()

    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        // 20% de probabilidad
        const types: Notification["type"][] = ["info", "warning", "success", "error", "critical"]
        const randomType = types[Math.floor(Math.random() * types.length)]

        // Filtrar según configuraciones
        if (notificationSettings.criticalOnly && randomType !== "critical" && randomType !== "error") {
          return
        }

        const scenarioData =
          randomType === "warning" || randomType === "error" || randomType === "critical"
            ? {
                id: `scen-${Math.floor(Math.random() * 1000)}`,
                title: getRandomScenarioTitle(),
                riskLevel: randomType === "critical" ? "Mortal" : randomType === "error" ? "Alto" : "Medio",
                sector: getRandomSector(),
              }
            : undefined

        // Determinar destinatarios basados en configuración y preferencias del equipo
        const eligibleMembers = teamMembers.filter((member) => {
          if (!member.isActive) return false
          if (member.notificationPreferences.criticalOnly && randomType !== "critical" && randomType !== "error")
            return false
          return true
        })

        const notifiedRecipients = notificationSettings.autoSendToResponsibles
          ? notificationSettings.sendToAll
            ? eligibleMembers.map((m) => m.name)
            : randomType === "critical" || randomType === "error"
              ? eligibleMembers.filter((m) => m.emergencyContact).map((m) => m.name)
              : eligibleMembers.slice(0, 2).map((m) => m.name)
          : []

        const newNotification: Notification = {
          id: `notif-${Date.now()}`,
          title: getRandomTitle(randomType),
          message: getRandomMessage(randomType, scenarioData?.title),
          type: randomType,
          timestamp: new Date(),
          read: false,
          priority: randomType === "critical" ? "critical" : randomType === "error" ? "high" : "medium",
          link: randomType === "success" ? "/reports/latest" : undefined,
          scenario: scenarioData,
          sentTo: notifiedRecipients,
        }

        setNotifications((prev) => {
          const updated = [newNotification, ...prev].slice(0, 50)
          LocalStorage.set("NOTIFICATIONS", updated)
          return updated
        })

        setUnreadCount((prev) => prev + 1)

        // Mostrar notificación de escritorio si está habilitada
        if (
          notificationSettings.desktopNotifications &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: "/favicon.ico",
            tag: newNotification.id,
          })
        }

        // Reproducir sonido si está habilitado
        if (notificationSettings.soundEnabled && (randomType === "critical" || randomType === "error")) {
          // Crear un sonido simple usando Web Audio API
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

            oscillator.start()
            oscillator.stop(audioContext.currentTime + 0.2)
          } catch (error) {
            logger.info("No se pudo reproducir el sonido de notificación")
          }
        }

        // Mostrar toast para notificaciones importantes
        if (randomType === "critical" || randomType === "error") {
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: randomType === "critical" ? "destructive" : "default",
          })
        }
      }
    }, 15000) // Cada 15 segundos

    return () => clearInterval(interval)
  }, [toast, notificationSettings, teamMembers, updateUnreadCount])

  useEffect(() => {
    updateUnreadCount()
  }, [notifications, updateUnreadCount])

  const getRandomScenarioTitle = () => {
    const scenarios = [
      "Exposición a radiación en laboratorio",
      "Trabajo en altura en torres de telecomunicaciones",
      "Manipulación de sustancias químicas corrosivas",
      "Operación de maquinaria pesada sin protección",
      "Espacios confinados en planta de tratamiento",
      "Exposición a ruido industrial prolongado",
      "Riesgo eléctrico en subestación",
      "Manipulación manual de cargas pesadas",
    ]
    return scenarios[Math.floor(Math.random() * scenarios.length)]
  }

  const getRandomSector = () => {
    const sectores = ["Minería", "Construcción", "Manufactura", "Telecomunicaciones", "Salud", "Energía"]
    return sectores[Math.floor(Math.random() * sectores.length)]
  }

  const getRandomTitle = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return "Actualización del sistema"
      case "warning":
        return "Advertencia de seguridad"
      case "success":
        return "Operación completada"
      case "error":
        return "Riesgo detectado"
      case "critical":
        return "¡ALERTA DE RIESGO MORTAL!"
      default:
        return "Notificación"
    }
  }

  const getRandomMessage = (type: Notification["type"], scenarioTitle?: string) => {
    switch (type) {
      case "info":
        return "Se ha actualizado el módulo de análisis de riesgos a la versión 2.5.0."
      case "warning":
        return scenarioTitle
          ? `Se ha detectado un nivel de riesgo medio en el escenario "${scenarioTitle}". Se requiere revisión.`
          : "Se ha detectado un nivel elevado de partículas en el área de trituración."
      case "success":
        return "El entrenamiento del modelo de predicción ha finalizado con éxito."
      case "error":
        return scenarioTitle
          ? `Se ha detectado un riesgo alto en el escenario "${scenarioTitle}". Se requiere acción inmediata.`
          : "Error al procesar los datos del último monitoreo de calidad del aire."
      case "critical":
        return scenarioTitle
          ? `¡ALERTA! Se ha detectado un riesgo MORTAL en el escenario "${scenarioTitle}". Evacuar el área inmediatamente y activar protocolo de emergencia.`
          : "Se ha detectado un riesgo con potencial de fatalidad en el área de excavación. Se requiere acción inmediata."
      default:
        return "Nueva notificación del sistema."
    }
  }

  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map((notif) => ({ ...notif, read: true }))
    setNotifications(updatedNotifications)
    LocalStorage.set("NOTIFICATIONS", updatedNotifications)
    setUnreadCount(0)
  }, [notifications])

  const markAsRead = useCallback(
    (id: string) => {
      const updatedNotifications = notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      setNotifications(updatedNotifications)
      LocalStorage.set("NOTIFICATIONS", updatedNotifications)
      setUnreadCount((prev) => Math.max(0, prev - 1))
    },
    [notifications],
  )

  const deleteNotification = useCallback(
    (id: string) => {
      const notif = notifications.find((n) => n.id === id)
      const updatedNotifications = notifications.filter((notif) => notif.id !== id)
      setNotifications(updatedNotifications)
      LocalStorage.set("NOTIFICATIONS", updatedNotifications)

      if (notif && !notif.read) {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1))
      }
    },
    [notifications],
  )

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "critical":
        return <Skull className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "Ahora mismo"
    if (diffMins < 60) return `Hace ${diffMins} min`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Hace ${diffHours} h`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `Hace ${diffDays} d`

    return date.toLocaleDateString()
  }

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification)
    setShowNotificationDetails(true)

    // Marcar como leída al ver detalles
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  const handleSendTestNotification = () => {
    const scenarioData = {
      id: `scen-test-${Date.now()}`,
      title: "Escenario de prueba - Exposición a radiación",
      riskLevel: "Alto",
      sector: "Laboratorio",
    }

    const testNotification: Notification = {
      id: `notif-test-${Date.now()}`,
      title: "🧪 Notificación de prueba",
      message: `Esta es una notificación de prueba del sistema. Se ha enviado según la configuración actual.`,
      type: "warning",
      timestamp: new Date(),
      read: false,
      priority: "medium",
      scenario: scenarioData,
      sentTo: teamMembers.filter((m) => m.isActive).map((m) => m.name),
    }

    const updatedNotifications = [testNotification, ...notifications]
    setNotifications(updatedNotifications)
    LocalStorage.set("NOTIFICATIONS", updatedNotifications)
    setUnreadCount((prev) => prev + 1)

    // Mostrar notificación de escritorio si está habilitada
    if (
      notificationSettings.desktopNotifications &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(testNotification.title, {
        body: testNotification.message,
        icon: "/favicon.ico",
      })
    }

    toast({
      title: "✅ Notificación de prueba enviada",
      description: `Se ha enviado a ${testNotification.sentTo?.length || 0} miembros del equipo.`,
    })

    setShowSettingsDialog(false)
  }

  const handleUpdateSettings = () => {
    // Guardar configuraciones actualizadas
    const currentSettings = LocalStorage.get(STORAGE_KEYS.SETTINGS, {})
    const updatedSettings = {
      ...currentSettings,
      notifications: notificationSettings,
    }
    LocalStorage.set(STORAGE_KEYS.SETTINGS, updatedSettings)

    toast({
      title: "✅ Configuración actualizada",
      description: "Las preferencias de notificaciones han sido guardadas.",
    })

    setShowSettingsDialog(false)
  }

  return (
    <div className="relative" data-notifications-panel>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} no leídas)` : ""}`}
      >
        <Bell className="h-[1.2rem] w-[1.2rem]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 sm:w-96 z-50 shadow-lg border-2">
          <div className="p-4 flex items-center justify-between border-b bg-slate-50">
            <div className="font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificaciones
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
                  Marcar todo como leído
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowSettingsDialog(true)}
                aria-label="Configuración de notificaciones"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar panel de notificaciones"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No hay notificaciones</p>
                <p className="text-sm">Las nuevas notificaciones aparecerán aquí</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 relative transition-colors ${
                      !notification.read ? "bg-blue-50/50 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-medium ${!notification.read ? "text-black" : "text-gray-900"}`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                notification.priority === "critical"
                                  ? "bg-red-100 text-red-800 border-red-300"
                                  : notification.priority === "high"
                                    ? "bg-orange-100 text-orange-800 border-orange-300"
                                    : notification.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                      : "bg-gray-100 text-gray-800 border-gray-300"
                              }`}
                            >
                              {notification.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-50 hover:opacity-100"
                              onClick={() => deleteNotification(notification.id)}
                              aria-label="Eliminar notificación"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>

                        {notification.scenario && (
                          <div className="mt-2 bg-slate-100 p-2 rounded-md text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Escenario:</span>
                              <Badge
                                className={
                                  notification.scenario.riskLevel === "Mortal"
                                    ? "bg-black text-white"
                                    : notification.scenario.riskLevel === "Alto"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-amber-100 text-amber-800"
                                }
                              >
                                {notification.scenario.riskLevel}
                              </Badge>
                            </div>
                            <p className="mt-1 line-clamp-1 font-medium">{notification.scenario.title}</p>
                            <p className="text-muted-foreground mt-1">Sector: {notification.scenario.sector}</p>
                          </div>
                        )}

                        {notification.sentTo && notification.sentTo.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>Enviado a: {notification.sentTo.slice(0, 2).join(", ")}</span>
                            {notification.sentTo.length > 2 && <span>y {notification.sentTo.length - 2} más</span>}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => handleViewDetails(notification)}
                            aria-label="Ver detalles de la notificación"
                          >
                            Ver detalles
                          </Button>

                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => markAsRead(notification.id)}
                              aria-label="Marcar como leído"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Marcar como leído
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {notification.type === "critical" && (
                      <div className="absolute top-0 right-0 w-2 h-full bg-red-600 rounded-r"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t bg-slate-50 text-center">
            <Button variant="ghost" size="sm" className="text-xs w-full" aria-label="Ver todas las notificaciones">
              Ver historial completo
            </Button>
          </div>
        </Card>
      )}

      {/* Diálogo de detalles de notificación */}
      <Dialog open={showNotificationDetails} onOpenChange={setShowNotificationDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {selectedNotification && getNotificationIcon(selectedNotification.type)}
              <DialogTitle>{selectedNotification?.title}</DialogTitle>
              <Badge
                variant="outline"
                className={`${
                  selectedNotification?.priority === "critical"
                    ? "bg-red-100 text-red-800"
                    : selectedNotification?.priority === "high"
                      ? "bg-orange-100 text-orange-800"
                      : selectedNotification?.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {selectedNotification?.priority}
              </Badge>
            </div>
            <DialogDescription>
              {selectedNotification?.timestamp.toLocaleString()} •{selectedNotification?.read ? " Leída" : " No leída"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-md">
              <p className="text-sm">{selectedNotification?.message}</p>
            </div>

            {selectedNotification?.scenario && (
              <div className="border rounded-md p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Detalles del escenario</h4>
                  <Badge
                    className={
                      selectedNotification.scenario.riskLevel === "Mortal"
                        ? "bg-black text-white"
                        : selectedNotification.scenario.riskLevel === "Alto"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }
                  >
                    {selectedNotification.scenario.riskLevel}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Título</p>
                  <p className="text-sm">{selectedNotification.scenario.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Sector</p>
                  <p className="text-sm">{selectedNotification.scenario.sector}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ID del escenario</p>
                  <p className="text-sm text-muted-foreground">{selectedNotification.scenario.id}</p>
                </div>
              </div>
            )}

            {selectedNotification?.sentTo && selectedNotification.sentTo.length > 0 && (
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-3">Notificación enviada a:</h4>
                <div className="space-y-2">
                  {teamMembers
                    .filter((m) => selectedNotification.sentTo?.includes(m.name))
                    .map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {member.notificationPreferences.email && (
                            <Badge variant="outline" className="text-xs">
                              Email
                            </Badge>
                          )}
                          {member.notificationPreferences.sms && (
                            <Badge variant="outline" className="text-xs">
                              SMS
                            </Badge>
                          )}
                          {member.notificationPreferences.push && (
                            <Badge variant="outline" className="text-xs">
                              Push
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationDetails(false)}>
              Cerrar
            </Button>
            {selectedNotification?.scenario && <Button>Ver escenario completo</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de configuración de notificaciones */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Configuración de notificaciones</DialogTitle>
            <DialogDescription>Personaliza cómo y cuándo recibir notificaciones de riesgos</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Canales de notificación</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Notificaciones por email</Label>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, email: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications">Notificaciones por SMS</Label>
                  <Switch
                    id="sms-notifications"
                    checked={notificationSettings.sms}
                    onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, sms: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Notificaciones push</Label>
                  <Switch
                    id="push-notifications"
                    checked={notificationSettings.push}
                    onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, push: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="desktop-notifications">Notificaciones de escritorio</Label>
                  <Switch
                    id="desktop-notifications"
                    checked={notificationSettings.desktopNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, desktopNotifications: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Configuración de envío</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="critical-only">Solo notificaciones críticas y de alto riesgo</Label>
                  <Switch
                    id="critical-only"
                    checked={notificationSettings.criticalOnly}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, criticalOnly: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-send">Enviar automáticamente a responsables</Label>
                  <Switch
                    id="auto-send"
                    checked={notificationSettings.autoSendToResponsibles}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, autoSendToResponsibles: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="send-all">Enviar a todos los responsables</Label>
                  <Switch
                    id="send-all"
                    checked={notificationSettings.sendToAll}
                    onCheckedChange={(checked) => setNotificationSettings((prev) => ({ ...prev, sendToAll: checked }))}
                    disabled={!notificationSettings.autoSendToResponsibles}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-enabled">Sonido de notificaciones</Label>
                  <Switch
                    id="sound-enabled"
                    checked={notificationSettings.soundEnabled}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, soundEnabled: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Equipo de seguridad activo</h4>
              <div className="border rounded-md divide-y max-h-40 overflow-y-auto">
                {teamMembers
                  .filter((m) => m.isActive)
                  .map((member) => (
                    <div key={member.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {member.emergencyContact && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                            Emergencia
                          </Badge>
                        )}
                        {member.notificationPreferences.criticalOnly && (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                            Solo críticas
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground">Para gestionar el equipo, ve a Configuraciones → Equipo</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendTestNotification} variant="outline">
              Enviar prueba
            </Button>
            <Button onClick={handleUpdateSettings}>Guardar configuración</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
