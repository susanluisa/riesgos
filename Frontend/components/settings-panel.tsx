"use client"

import { logger } from "@/lib/logger"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import { LocalStorage, STORAGE_KEYS } from "@/lib/storage"
import {
  Moon,
  Sun,
  Laptop,
  Plus,
  Trash2,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  MessageCircle,
  Send,
  Edit,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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

interface Settings {
  general: {
    language: string
    autoSave: boolean
    theme: string
    companyName: string
    timezone: string
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    modelTrainingUpdates: boolean
    securityAlerts: boolean
    criticalOnly: boolean
    autoSendToResponsibles: boolean
    sendToAll: boolean
    soundEnabled: boolean
    desktopNotifications: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    dataEncryption: boolean
    passwordPolicy: string
    ipWhitelist: string[]
    auditLog: boolean
  }
  ai: {
    modelExplanations: boolean
    autoTuning: boolean
    featureImportance: boolean
    confidenceThreshold: number
    retrainingFrequency: string
  }
  team: TeamMember[]
}

const defaultSettings: Settings = {
  general: {
    language: "Español",
    autoSave: true,
    theme: "system",
    companyName: "Mi Empresa",
    timezone: "America/Santiago",
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    modelTrainingUpdates: true,
    securityAlerts: true,
    criticalOnly: false,
    autoSendToResponsibles: true,
    sendToAll: false,
    soundEnabled: true,
    desktopNotifications: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    dataEncryption: true,
    passwordPolicy: "medium",
    ipWhitelist: [],
    auditLog: true,
  },
  ai: {
    modelExplanations: true,
    autoTuning: false,
    featureImportance: true,
    confidenceThreshold: 0.8,
    retrainingFrequency: "weekly",
  },
  team: [
    {
      id: "user-001",
      name: "Cristian Omar",
      email: "cristianomar@gmail.com",
      phone: "+56912345678",
      role: "Jefe de Seguridad",
      department: "Seguridad Industrial",
      isActive: true,
      notificationPreferences: {
        email: true,
        sms: true,
        push: true,
        criticalOnly: false,
      },
      emergencyContact: true,
      lastActive: new Date(),
    },
    {
      id: "user-002",
      name: "María López",
      email: "mlopez@empresa.com",
      phone: "+56987654321",
      role: "Supervisor de Seguridad",
      department: "Seguridad Industrial",
      isActive: true,
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
        criticalOnly: false,
      },
      emergencyContact: true,
      lastActive: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: "user-003",
      name: "Carlos Rodríguez",
      email: "crodriguez@empresa.com",
      phone: "+56911223344",
      role: "Coordinador de Emergencias",
      department: "Emergencias",
      isActive: true,
      notificationPreferences: {
        email: true,
        sms: true,
        push: true,
        criticalOnly: true,
      },
      emergencyContact: true,
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
  ],
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [messageType, setMessageType] = useState<"sms" | "whatsapp">("sms")
  const [customMessage, setCustomMessage] = useState("")
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    isActive: true,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
      criticalOnly: false,
    },
    emergencyContact: false,
  })
  const { theme, setTheme } = useTheme()

  // Cargar configuraciones desde localStorage al montar el componente
  useEffect(() => {
    try {
      const savedSettings = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      setSettings(savedSettings)
    } catch (err) {
      logger.error("Error cargando configuraciones:", err)
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones. Se usarán valores por defecto.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Sincronizar tema cuando cambia
  useEffect(() => {
    if (!isLoading && settings.general.theme) {
      setTheme(settings.general.theme)
    }
  }, [isLoading, settings.general.theme, setTheme])

  // Detectar cambios no guardados
  useEffect(() => {
    if (!isLoading) {
      const savedSettings = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings)
      setHasUnsavedChanges(hasChanges)
    }
  }, [settings, isLoading])

  const handleThemeChange = (newTheme: string) => {
    setSettings((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        theme: newTheme,
      },
    }))
    setTheme(newTheme)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Simular delay de guardado
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Guardar en localStorage
      LocalStorage.set(STORAGE_KEYS.SETTINGS, settings)

      // Aplicar configuraciones de notificaciones
      if (settings.notifications.desktopNotifications && "Notification" in window) {
        if (Notification.permission === "default") {
          await Notification.requestPermission()
        }
      }

      // Aplicar configuraciones de tema
      setTheme(settings.general.theme)

      // Guardar configuraciones del equipo en un storage separado
      LocalStorage.set("TEAM_SETTINGS", settings.team)

      setHasUnsavedChanges(false)

      toast({
        title: "✅ Configuraciones guardadas",
        description: "Todas las configuraciones han sido aplicadas exitosamente.",
      })
    } catch (error) {
      logger.error("Error guardando configuraciones:", error)
      toast({
        title: "❌ Error",
        description: "No se pudieron guardar las configuraciones. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Función simplificada para agregar miembro
  const addMember = () => {
    logger.info("=== INICIANDO AGREGAR MIEMBRO ===")
    logger.info("Datos del nuevo miembro:", newMember)

    // Validación mínima
    if (!newMember.name) {
      logger.info("Error: Falta nombre")
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre",
        variant: "destructive",
      })
      return
    }

    if (!newMember.email) {
      logger.info("Error: Falta email")
      toast({
        title: "Error",
        description: "Por favor ingresa un email",
        variant: "destructive",
      })
      return
    }

    logger.info("Validación pasada, creando miembro...")

    // Crear miembro simple
    const nuevoMiembro: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone || "+56900000000",
      role: newMember.role || "Miembro del Equipo",
      department: newMember.department || "Seguridad",
      isActive: true,
      notificationPreferences: {
        email: true,
        sms: true,
        push: true,
        criticalOnly: false,
      },
      emergencyContact: false,
      lastActive: new Date(),
    }

    logger.info("Miembro creado:", nuevoMiembro)

    // Actualizar estado
    setSettings((prevSettings) => {
      const nuevosSettings = {
        ...prevSettings,
        team: [...prevSettings.team, nuevoMiembro],
      }
      logger.info("Nuevos settings:", nuevosSettings)
      return nuevosSettings
    })

    // Limpiar formulario
    setNewMember({
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      isActive: true,
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
        criticalOnly: false,
      },
      emergencyContact: false,
    })

    // Cerrar diálogo
    setShowAddMemberDialog(false)

    // Mostrar éxito
    toast({
      title: "✅ ¡Miembro agregado!",
      description: `${nuevoMiembro.name} ha sido agregado al equipo`,
    })

    logger.info("=== MIEMBRO AGREGADO EXITOSAMENTE ===")
  }

  const handleRemoveTeamMember = (memberId: string) => {
    const member = settings.team.find((m) => m.id === memberId)
    setSettings((prev) => ({
      ...prev,
      team: prev.team.filter((m) => m.id !== memberId),
    }))

    toast({
      title: "Miembro eliminado",
      description: `${member?.name} ha sido eliminado del equipo.`,
    })
  }

  const handleToggleMemberStatus = (memberId: string) => {
    setSettings((prev) => ({
      ...prev,
      team: prev.team.map((member) => (member.id === memberId ? { ...member, isActive: !member.isActive } : member)),
    }))
  }

  const handleTestNotifications = async () => {
    try {
      // Probar notificación de escritorio
      if (settings.notifications.desktopNotifications && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("🔔 Notificación de Prueba", {
            body: "Las notificaciones están funcionando correctamente.",
            icon: "/favicon.ico",
          })
        }
      }

      // Simular envío de email/SMS
      const activeMembers = settings.team.filter((m) => m.isActive)
      const emailRecipients = activeMembers.filter((m) => m.notificationPreferences.email)
      const smsRecipients = activeMembers.filter((m) => m.notificationPreferences.sms)

      toast({
        title: "🧪 Notificación de prueba enviada",
        description: `Email: ${emailRecipients.length} destinatarios, SMS: ${smsRecipients.length} destinatarios`,
      })
    } catch (error) {
      toast({
        title: "Error en prueba",
        description: "No se pudo enviar la notificación de prueba.",
        variant: "destructive",
      })
    }
  }

  const getDefaultMessage = () => {
    return `¡Hola ${newMember.name || "[Nombre]"}! 👋

Has sido agregado al equipo de seguridad industrial de ${settings.general.companyName}.

📧 Email registrado: ${newMember.email || "[Email]"}
📱 Teléfono: ${newMember.phone || "[Teléfono]"}
🏢 Rol: ${newMember.role || "[Rol]"}

Recibirás notificaciones importantes sobre seguridad y emergencias.

¡Bienvenido al equipo! 🛡️

---
Sistema de Gestión de Riesgos
${new Date().toLocaleString("es-CL")}`
  }

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member)
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department: member.department,
      isActive: member.isActive,
      notificationPreferences: { ...member.notificationPreferences },
      emergencyContact: member.emergencyContact,
    })
    setShowAddMemberDialog(true)
  }

  const handleSaveEditedMember = async () => {
    if (!editingMember || !newMember.name || !newMember.email || !newMember.phone || !newMember.role) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSendingMessage(true)

      const updatedMember: TeamMember = {
        ...editingMember,
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone,
        role: newMember.role,
        department: newMember.department || "",
        isActive: newMember.isActive ?? true,
        notificationPreferences: newMember.notificationPreferences || {
          email: true,
          sms: false,
          push: true,
          criticalOnly: false,
        },
        emergencyContact: newMember.emergencyContact || false,
        lastActive: new Date(),
      }

      setSettings((prev) => ({
        ...prev,
        team: prev.team.map((member) => (member.id === editingMember.id ? updatedMember : member)),
      }))

      toast({
        title: "Miembro actualizado",
        description: `${updatedMember.name} ha sido actualizado exitosamente.`,
      })

      setShowAddMemberDialog(false)
      setEditingMember(null)
      setNewMember({
        name: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        isActive: true,
        notificationPreferences: {
          email: true,
          sms: false,
          push: true,
          criticalOnly: false,
        },
        emergencyContact: false,
      })
    } catch (error) {
      console.error("Error updating member:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el miembro. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSendingMessage(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando configuraciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuraciones</h2>
          <p className="text-muted-foreground">Gestiona la configuración de tu cuenta y preferencias.</p>
        </div>
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Cambios sin guardar
            </Badge>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="ai">Configuración IA</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configuraciones Generales</CardTitle>
              <CardDescription>Gestiona tus preferencias generales de la aplicación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nombre de la Empresa</Label>
                  <Input
                    id="company-name"
                    value={settings.general.companyName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, companyName: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, language: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Español">Español</SelectItem>
                      <SelectItem value="Inglés">Inglés</SelectItem>
                      <SelectItem value="Francés">Francés</SelectItem>
                      <SelectItem value="Alemán">Alemán</SelectItem>
                      <SelectItem value="Chino">Chino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, timezone: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Santiago">Santiago (UTC-3)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokio (UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-save">Guardado Automático</Label>
                  <p className="text-sm text-muted-foreground">Guardar cambios automáticamente mientras trabajas</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.general.autoSave}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, autoSave: checked },
                    })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={settings.general.theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange("light")}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Claro
                  </Button>
                  <Button
                    variant={settings.general.theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange("dark")}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Oscuro
                  </Button>
                  <Button
                    variant={settings.general.theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange("system")}
                    className="flex items-center gap-2"
                  >
                    <Laptop className="h-4 w-4" />
                    Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving || !hasUnsavedChanges}>
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>Configura cómo quieres recibir las notificaciones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Canales de Notificación</h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">Recibir notificaciones vía correo electrónico</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, email: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications">Notificaciones por SMS</Label>
                      <p className="text-sm text-muted-foreground">Recibir notificaciones vía mensaje de texto</p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={settings.notifications.sms}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, sms: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Notificaciones Push</Label>
                      <p className="text-sm text-muted-foreground">Recibir notificaciones push en el navegador</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, push: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="desktop-notifications">Notificaciones de Escritorio</Label>
                      <p className="text-sm text-muted-foreground">Mostrar notificaciones en el escritorio</p>
                    </div>
                    <Switch
                      id="desktop-notifications"
                      checked={settings.notifications.desktopNotifications}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, desktopNotifications: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sound-notifications">Sonido de Notificaciones</Label>
                      <p className="text-sm text-muted-foreground">Reproducir sonido al recibir notificaciones</p>
                    </div>
                    <Switch
                      id="sound-notifications"
                      checked={settings.notifications.soundEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, soundEnabled: checked },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Configuración de Envío</h4>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="critical-only">Solo Notificaciones Críticas</Label>
                      <p className="text-sm text-muted-foreground">Recibir solo alertas críticas y de alto riesgo</p>
                    </div>
                    <Switch
                      id="critical-only"
                      checked={settings.notifications.criticalOnly}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, criticalOnly: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-send">Enviar Automáticamente a Responsables</Label>
                      <p className="text-sm text-muted-foreground">Notificar automáticamente al equipo de seguridad</p>
                    </div>
                    <Switch
                      id="auto-send"
                      checked={settings.notifications.autoSendToResponsibles}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, autoSendToResponsibles: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="send-all">Enviar a Todo el Equipo</Label>
                      <p className="text-sm text-muted-foreground">Incluir a todos los miembros activos</p>
                    </div>
                    <Switch
                      id="send-all"
                      checked={settings.notifications.sendToAll}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, sendToAll: checked },
                        })
                      }
                      disabled={!settings.notifications.autoSendToResponsibles}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="model-updates">Actualizaciones de Entrenamiento</Label>
                      <p className="text-sm text-muted-foreground">Notificar sobre progreso de modelos</p>
                    </div>
                    <Switch
                      id="model-updates"
                      checked={settings.notifications.modelTrainingUpdates}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, modelTrainingUpdates: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="security-alerts">Alertas de Seguridad</Label>
                      <p className="text-sm text-muted-foreground">Notificar sobre problemas de seguridad</p>
                    </div>
                    <Switch
                      id="security-alerts"
                      checked={settings.notifications.securityAlerts}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, securityAlerts: checked },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Probar Configuración</h4>
                  <p className="text-sm text-muted-foreground">
                    Envía una notificación de prueba para verificar la configuración
                  </p>
                </div>
                <Button onClick={handleTestNotifications} variant="outline">
                  Enviar Prueba
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving || !hasUnsavedChanges}>
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>Gestiona las preferencias de seguridad de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Autenticación de Dos Factores</Label>
                  <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad a tu cuenta</p>
                </div>
                <Switch
                  id="two-factor"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, twoFactorAuth: checked },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Tiempo de Espera de Sesión (minutos)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min="5"
                  max="120"
                  value={settings.security.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: Number.parseInt(e.target.value) || 30 },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-encryption">Encriptación de Datos</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar encriptación de extremo a extremo para datos sensibles
                  </p>
                </div>
                <Switch
                  id="data-encryption"
                  checked={settings.security.dataEncryption}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, dataEncryption: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="audit-log">Registro de Auditoría</Label>
                  <p className="text-sm text-muted-foreground">
                    Mantener un registro de todas las acciones del sistema
                  </p>
                </div>
                <Switch
                  id="audit-log"
                  checked={settings.security.auditLog}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, auditLog: checked },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-policy">Política de Contraseñas</Label>
                <Select
                  value={settings.security.passwordPolicy}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      security: { ...settings.security, passwordPolicy: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Básica (8 caracteres)</SelectItem>
                    <SelectItem value="medium">Media (8 caracteres + mayúsculas/números)</SelectItem>
                    <SelectItem value="high">Alta (12 caracteres + símbolos especiales)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving || !hasUnsavedChanges}>
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de IA</CardTitle>
              <CardDescription>Configura el comportamiento y explicaciones de la IA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="model-explanations">Explicaciones del Modelo</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar explicaciones detalladas para las predicciones del modelo
                  </p>
                </div>
                <Switch
                  id="model-explanations"
                  checked={settings.ai.modelExplanations}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      ai: { ...settings.ai, modelExplanations: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-tuning">Ajuste Automático de Hiperparámetros</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que el sistema ajuste automáticamente los parámetros del modelo
                  </p>
                </div>
                <Switch
                  id="auto-tuning"
                  checked={settings.ai.autoTuning}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      ai: { ...settings.ai, autoTuning: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="feature-importance">Importancia de Características</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar la importancia de las características en los resultados del modelo
                  </p>
                </div>
                <Switch
                  id="feature-importance"
                  checked={settings.ai.featureImportance}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      ai: { ...settings.ai, featureImportance: checked },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence-threshold">Umbral de Confianza</Label>
                <Input
                  id="confidence-threshold"
                  type="number"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.ai.confidenceThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ai: { ...settings.ai, confidenceThreshold: Number.parseFloat(e.target.value) || 0.8 },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retraining-frequency">Frecuencia de Reentrenamiento</Label>
                <Select
                  value={settings.ai.retrainingFrequency}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      ai: { ...settings.ai, retrainingFrequency: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving || !hasUnsavedChanges}>
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Equipo de Seguridad</CardTitle>
                  <CardDescription>Gestiona los miembros del equipo y sus responsabilidades.</CardDescription>
                </div>
                <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Miembro
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingMember ? "Editar Miembro del Equipo" : "Agregar Miembro del Equipo"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingMember
                          ? "Modifica la información del miembro del equipo de seguridad industrial."
                          : "Agrega un nuevo miembro al equipo de seguridad industrial. Se enviará un mensaje de bienvenida automáticamente."}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Información del miembro */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm">Información del Miembro</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-name">
                              Nombre Completo <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="new-name"
                              value={newMember.name || ""}
                              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                              placeholder="Juan Pérez"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-email">
                              Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="new-email"
                              type="email"
                              value={newMember.email || ""}
                              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                              placeholder="juan@empresa.com"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-phone">
                              Teléfono <span className="text-red-500">*</span> (con código país)
                            </Label>
                            <Input
                              id="new-phone"
                              value={newMember.phone || ""}
                              onChange={(e) => {
                                // Formatear automáticamente para asegurar que tenga el prefijo +
                                let value = e.target.value.trim()
                                if (value && !value.startsWith("+")) {
                                  value = "+" + value
                                }
                                setNewMember({ ...newMember, phone: value })
                              }}
                              placeholder="+56912345678"
                              required
                            />
                            <p className="text-xs text-muted-foreground">
                              Formato: +56912345678 (incluir código de país)
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-role">
                              Rol <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={newMember.role || ""}
                              onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Jefe de Seguridad">Jefe de Seguridad</SelectItem>
                                <SelectItem value="Supervisor de Seguridad">Supervisor de Seguridad</SelectItem>
                                <SelectItem value="Coordinador de Emergencias">Coordinador de Emergencias</SelectItem>
                                <SelectItem value="Especialista en Riesgos">Especialista en Riesgos</SelectItem>
                                <SelectItem value="Inspector de Seguridad">Inspector de Seguridad</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-department">Departamento</Label>
                          <Input
                            id="new-department"
                            value={newMember.department || ""}
                            onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                            placeholder="Seguridad Industrial"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="new-emergency">Contacto de Emergencia</Label>
                          <Switch
                            id="new-emergency"
                            checked={newMember.emergencyContact || false}
                            onCheckedChange={(checked) => setNewMember({ ...newMember, emergencyContact: checked })}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Configuración de mensaje */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm">Mensaje de Bienvenida</h4>
                        <div className="space-y-3">
                          <Label>Tipo de Mensaje</Label>
                          <RadioGroup
                            value={messageType}
                            onValueChange={(value: "sms" | "whatsapp") => setMessageType(value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sms" id="sms" />
                              <Label htmlFor="sms" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                SMS
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="whatsapp" id="whatsapp" />
                              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                WhatsApp
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="custom-message">Mensaje Personalizado (opcional)</Label>
                          <Textarea
                            id="custom-message"
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Deja vacío para usar el mensaje por defecto"
                            rows={4}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Vista Previa del Mensaje</Label>
                          <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                            {customMessage || getDefaultMessage()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          logger.info("Cerrando diálogo")
                          setShowAddMemberDialog(false)
                          setEditingMember(null)
                          setNewMember({
                            name: "",
                            email: "",
                            phone: "",
                            role: "",
                            department: "",
                            isActive: true,
                            notificationPreferences: {
                              email: true,
                              sms: false,
                              push: true,
                              criticalOnly: false,
                            },
                            emergencyContact: false,
                          })
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          if (editingMember) {
                            logger.info("CLICK EN BOTÓN GUARDAR CAMBIOS")
                            handleSaveEditedMember()
                          } else {
                            logger.info("CLICK EN BOTÓN AGREGAR")
                            addMember()
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isSendingMessage}
                      >
                        {isSendingMessage ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {editingMember ? "Guardando..." : "Agregando..."}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            {editingMember ? "Guardar Cambios" : "Agregar y Enviar"}
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.team.map((member) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{member.name}</h4>
                            {member.emergencyContact && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <Shield className="h-3 w-3 mr-1" />
                                Emergencia
                              </Badge>
                            )}
                            <Badge variant={member.isActive ? "default" : "secondary"}>
                              {member.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          <p className="text-sm text-muted-foreground">{member.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                        <Switch checked={member.isActive} onCheckedChange={() => handleToggleMemberStatus(member.id)} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMember(member)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Preferencias de notificación:</span>
                        <div className="flex gap-2">
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
                          {member.notificationPreferences.criticalOnly && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                              Solo Críticas
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Última actividad:</span>
                        <span className="text-xs">{member.lastActive.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={isSaving || !hasUnsavedChanges}>
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
