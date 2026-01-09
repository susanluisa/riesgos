"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import { LocalStorage, STORAGE_KEYS } from "@/lib/storage"
import { logger } from "@/lib/logger"
import { Settings, TeamMember, buildEmptyMemberForm, createMemberPayload, defaultSettings } from "./settings-model"
import { GeneralSettingsTab } from "./tabs/general-tab"
import { NotificationsSettingsTab } from "./tabs/notifications-tab"
import { SecuritySettingsTab } from "./tabs/security-tab"
import { AiSettingsTab } from "./tabs/ai-tab"
import { TeamSettingsTab } from "./tabs/team-tab"

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [newMember, setNewMember] = useState<Partial<TeamMember>>(buildEmptyMemberForm())
  const { setTheme } = useTheme()

  const resetMemberForm = () => setNewMember(buildEmptyMemberForm())

  const closeMemberDialog = () => {
    setShowAddMemberDialog(false)
    setEditingMember(null)
    resetMemberForm()
  }

  const updateSection = <K extends keyof Settings>(section: K, changes: Partial<Settings[K]>) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...changes,
      },
    }))
  }

  useEffect(() => {
    try {
      const savedSettings = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      setSettings(savedSettings)
    } catch (err) {
      logger.error("Error cargando configuraciones:", err)
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones. Se usaran valores por defecto.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && settings.general.theme) {
      setTheme(settings.general.theme)
    }
  }, [isLoading, settings.general.theme, setTheme])

  useEffect(() => {
    if (!isLoading) {
      const savedSettings = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings)
      setHasUnsavedChanges(hasChanges)
    }
  }, [settings, isLoading])

  const handleThemeChange = (newTheme: string) => {
    updateSection("general", { theme: newTheme })
    setTheme(newTheme)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      LocalStorage.set(STORAGE_KEYS.SETTINGS, settings)

      if (settings.notifications.desktopNotifications && "Notification" in window) {
        if (Notification.permission === "default") {
          await Notification.requestPermission()
        }
      }

      setTheme(settings.general.theme)
      LocalStorage.set("TEAM_SETTINGS", settings.team)
      setHasUnsavedChanges(false)

      toast({
        title: "Configuraciones guardadas",
        description: "Todas las configuraciones han sido aplicadas exitosamente.",
      })
    } catch (error) {
      logger.error("Error guardando configuraciones:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones. Intentalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addMember = () => {
    if (!newMember.name || !newMember.email) {
      toast({
        title: "Error",
        description: "Por favor ingresa nombre y email.",
        variant: "destructive",
      })
      return
    }

    const memberToAdd = createMemberPayload(newMember)

    setSettings((prevSettings) => ({
      ...prevSettings,
      team: [...prevSettings.team, memberToAdd],
    }))

    resetMemberForm()
    closeMemberDialog()

    toast({
      title: "Miembro agregado",
      description: `${memberToAdd.name} ha sido agregado al equipo.`,
    })
  }

  const handleRemoveTeamMember = (memberId: string) => {
    const member = settings.team.find((m) => m.id === memberId)
    setSettings((prev) => ({
      ...prev,
      team: prev.team.filter((m) => m.id !== memberId),
    }))

    toast({
      title: "Miembro eliminado",
      description: `${member?.name ?? "Miembro"} ha sido eliminado del equipo.`,
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
      if (settings.notifications.desktopNotifications && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Notificacion de Prueba", {
            body: "Las notificaciones estan funcionando correctamente.",
            icon: "/favicon.ico",
          })
        }
      }

      const activeMembers = settings.team.filter((m) => m.isActive)
      const emailRecipients = activeMembers.filter((m) => m.notificationPreferences.email)
      const smsRecipients = activeMembers.filter((m) => m.notificationPreferences.sms)

      toast({
        title: "Notificacion de prueba enviada",
        description: `Email: ${emailRecipients.length} destinatarios, SMS: ${smsRecipients.length} destinatarios`,
      })
    } catch (error) {
      toast({
        title: "Error en prueba",
        description: "No se pudo enviar la notificacion de prueba.",
        variant: "destructive",
      })
    }
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

      const updatedMember: TeamMember = createMemberPayload(newMember, editingMember)

      setSettings((prev) => ({
        ...prev,
        team: prev.team.map((member) => (member.id === editingMember.id ? updatedMember : member)),
      }))

      toast({
        title: "Miembro actualizado",
        description: `${updatedMember.name} ha sido actualizado exitosamente.`,
      })

      closeMemberDialog()
    } catch (error) {
      logger.error("Error updating member:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el miembro. Intentalo de nuevo.",
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
          <p className="text-muted-foreground">Gestiona la configuracion de tu cuenta y preferencias.</p>
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
          <TabsTrigger value="ai">Configuracion IA</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettingsTab
            settings={settings.general}
            onChange={(changes) => updateSection("general", changes)}
            onThemeChange={handleThemeChange}
            onSave={handleSaveSettings}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsSettingsTab
            settings={settings.notifications}
            onChange={(changes) => updateSection("notifications", changes)}
            onTest={handleTestNotifications}
            onSave={handleSaveSettings}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsTab
            settings={settings.security}
            onChange={(changes) => updateSection("security", changes)}
            onSave={handleSaveSettings}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AiSettingsTab
            settings={settings.ai}
            onChange={(changes) => updateSection("ai", changes)}
            onSave={handleSaveSettings}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </TabsContent>

        <TabsContent value="team">
          <TeamSettingsTab
            team={settings.team}
            newMember={newMember}
            setNewMember={setNewMember}
            editingMember={editingMember}
            dialogOpen={showAddMemberDialog}
            setDialogOpen={setShowAddMemberDialog}
            isSending={isSendingMessage}
            onAddMember={addMember}
            onSaveEditedMember={handleSaveEditedMember}
            onEditMember={handleEditMember}
            onRemoveMember={handleRemoveTeamMember}
            onToggleMemberStatus={handleToggleMemberStatus}
            onCloseDialog={closeMemberDialog}
            onSaveSettings={handleSaveSettings}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
