"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { LocalStorage, STORAGE_KEYS } from "@/lib/storage"
import { toast } from "@/components/ui/use-toast"
import { logger } from "@/lib/logger"
import { Settings, TeamMember, defaultSettings } from "../settings-model"

const NOTIFICATIONS_SETTINGS_QUERY_KEY = ["settings", "notifications"]

export function NotificationsSettingsTab() {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Settings["notifications"]>(defaultSettings.notifications)

  const { data: storedNotifications, isLoading } = useQuery<Settings["notifications"]>({
    queryKey: NOTIFICATIONS_SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const stored = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      return stored.notifications
    },
  })

  useEffect(() => {
    if (storedNotifications) {
      setDraft(storedNotifications)
    }
  }, [storedNotifications])

  const saveMutation = useMutation({
    mutationFn: async (next: Settings["notifications"]) => {
      const current = LocalStorage.get<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings)
      const updated = { ...current, notifications: next }
      LocalStorage.set(STORAGE_KEYS.SETTINGS, updated)
      return next
    },
    onSuccess: (data) => {
      queryClient.setQueryData(NOTIFICATIONS_SETTINGS_QUERY_KEY, data)
      toast({
        title: "Configuraciones guardadas",
        description: "Preferencias de notificaciones actualizadas.",
      })
    },
    onError: (err) => {
      logger.error("Error guardando notificaciones:", err)
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones de notificaciones.",
        variant: "destructive",
      })
    },
  })

  const hasUnsavedChanges = useMemo(() => {
    if (!storedNotifications) return false
    return JSON.stringify(draft) !== JSON.stringify(storedNotifications)
  }, [draft, storedNotifications])

  const handleChange = (changes: Partial<Settings["notifications"]>) => {
    setDraft((prev) => ({
      ...prev,
      ...changes,
    }))
  }

  const handleTestNotifications = async () => {
    try {
      if (draft.desktopNotifications && "Notification" in window) {
        if (Notification.permission === "default") {
          await Notification.requestPermission()
        }
        if (Notification.permission === "granted") {
          new Notification("Notificacion de Prueba", {
            body: "Las notificaciones estan funcionando correctamente.",
            icon: "/favicon.ico",
          })
        }
      }

      const team = LocalStorage.get<TeamMember[]>("TEAM_SETTINGS", defaultSettings.team)
      const activeMembers = team.filter((m) => m.isActive)
      const emailRecipients = activeMembers.filter((m) => m.notificationPreferences.email)
      const smsRecipients = activeMembers.filter((m) => m.notificationPreferences.sms)

      toast({
        title: "Notificacion de prueba enviada",
        description: `Email: ${emailRecipients.length} destinatarios, SMS: ${smsRecipients.length} destinatarios`,
      })
    } catch (error) {
      logger.error("Error en prueba de notificaciones:", error)
      toast({
        title: "Error en prueba",
        description: "No se pudo enviar la notificacion de prueba.",
        variant: "destructive",
      })
    }
  }

  if (isLoading && !storedNotifications) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuracion de Notificaciones</CardTitle>
          <CardDescription>Cargando preferencias...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuracion de Notificaciones</CardTitle>
        <CardDescription>Configura como quieres recibir las notificaciones.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Canales de Notificacion</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones via correo electronico</p>
              </div>
              <Switch id="email-notifications" checked={draft.email} onCheckedChange={(checked) => handleChange({ email: checked })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">Notificaciones por SMS</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones via mensaje de texto</p>
              </div>
              <Switch id="sms-notifications" checked={draft.sms} onCheckedChange={(checked) => handleChange({ sms: checked })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notificaciones Push</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones en la aplicacion</p>
              </div>
              <Switch id="push-notifications" checked={draft.push} onCheckedChange={(checked) => handleChange({ push: checked })} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Preferencias Avanzadas</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="security-alerts">Alertas de Seguridad</Label>
                <p className="text-sm text-muted-foreground">Recibir alertas sobre eventos de seguridad</p>
              </div>
              <Switch
                id="security-alerts"
                checked={draft.securityAlerts}
                onCheckedChange={(checked) => handleChange({ securityAlerts: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="model-updates">Actualizaciones de Modelo</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones sobre entrenamiento de modelos</p>
              </div>
              <Switch
                id="model-updates"
                checked={draft.modelTrainingUpdates}
                onCheckedChange={(checked) => handleChange({ modelTrainingUpdates: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="critical-only">Solo Criticas</Label>
                <p className="text-sm text-muted-foreground">Recibir solo notificaciones criticas</p>
              </div>
              <Switch id="critical-only" checked={draft.criticalOnly} onCheckedChange={(checked) => handleChange({ criticalOnly: checked })} />
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Destinatarios</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-send">Auto enviar a responsables</Label>
                <p className="text-sm text-muted-foreground">Enviar automaticamente segun responsable asignado</p>
              </div>
              <Switch
                id="auto-send"
                checked={draft.autoSendToResponsibles}
                onCheckedChange={(checked) => handleChange({ autoSendToResponsibles: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="send-to-all">Enviar a todos</Label>
                <p className="text-sm text-muted-foreground">Enviar copias a todo el equipo de seguridad</p>
              </div>
              <Switch id="send-to-all" checked={draft.sendToAll} onCheckedChange={(checked) => handleChange({ sendToAll: checked })} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Preferencias de sonido</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-enabled">Sonido habilitado</Label>
                <p className="text-sm text-muted-foreground">Activar sonidos para nuevas notificaciones</p>
              </div>
              <Switch id="sound-enabled" checked={draft.soundEnabled} onCheckedChange={(checked) => handleChange({ soundEnabled: checked })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="desktop-notifications">Notificaciones de escritorio</Label>
                <p className="text-sm text-muted-foreground">Habilitar notificaciones del sistema operativo</p>
              </div>
              <Switch
                id="desktop-notifications"
                checked={draft.desktopNotifications}
                onCheckedChange={(checked) => handleChange({ desktopNotifications: checked })}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleTestNotifications}>
          Probar Notificaciones
        </Button>
        <Button onClick={() => saveMutation.mutate(draft)} disabled={saveMutation.isPending || !hasUnsavedChanges}>
          {saveMutation.isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardFooter>
    </Card>
  )
}
