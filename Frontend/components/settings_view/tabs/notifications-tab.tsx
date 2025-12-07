"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Settings } from "../settings-model"

type NotificationsSettingsTabProps = {
  settings: Settings["notifications"]
  onChange: (changes: Partial<Settings["notifications"]>) => void
  onTest: () => void
  onSave: () => void
  isSaving: boolean
  hasUnsavedChanges: boolean
}

export function NotificationsSettingsTab({
  settings,
  onChange,
  onTest,
  onSave,
  isSaving,
  hasUnsavedChanges,
}: NotificationsSettingsTabProps) {
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
              <Switch
                id="email-notifications"
                checked={settings.email}
                onCheckedChange={(checked) => onChange({ email: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">Notificaciones por SMS</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones via mensaje de texto</p>
              </div>
              <Switch id="sms-notifications" checked={settings.sms} onCheckedChange={(checked) => onChange({ sms: checked })} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notificaciones Push</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones en la aplicacion</p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.push}
                onCheckedChange={(checked) => onChange({ push: checked })}
              />
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
                checked={settings.securityAlerts}
                onCheckedChange={(checked) => onChange({ securityAlerts: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="model-updates">Actualizaciones de Modelo</Label>
                <p className="text-sm text-muted-foreground">Recibir notificaciones sobre entrenamiento de modelos</p>
              </div>
              <Switch
                id="model-updates"
                checked={settings.modelTrainingUpdates}
                onCheckedChange={(checked) => onChange({ modelTrainingUpdates: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="critical-only">Solo Criticas</Label>
                <p className="text-sm text-muted-foreground">Recibir solo notificaciones criticas</p>
              </div>
              <Switch
                id="critical-only"
                checked={settings.criticalOnly}
                onCheckedChange={(checked) => onChange({ criticalOnly: checked })}
              />
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
                checked={settings.autoSendToResponsibles}
                onCheckedChange={(checked) => onChange({ autoSendToResponsibles: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="send-to-all">Enviar a todos</Label>
                <p className="text-sm text-muted-foreground">Enviar copias a todo el equipo de seguridad</p>
              </div>
              <Switch id="send-to-all" checked={settings.sendToAll} onCheckedChange={(checked) => onChange({ sendToAll: checked })} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Preferencias de sonido</h4>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-enabled">Sonido habilitado</Label>
                <p className="text-sm text-muted-foreground">Activar sonidos para nuevas notificaciones</p>
              </div>
              <Switch
                id="sound-enabled"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => onChange({ soundEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="desktop-notifications">Notificaciones de escritorio</Label>
                <p className="text-sm text-muted-foreground">Habilitar notificaciones del sistema operativo</p>
              </div>
              <Switch
                id="desktop-notifications"
                checked={settings.desktopNotifications}
                onCheckedChange={(checked) => onChange({ desktopNotifications: checked })}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onTest}>
          Probar Notificaciones
        </Button>
        <Button onClick={onSave} disabled={isSaving || !hasUnsavedChanges}>
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardFooter>
    </Card>
  )
}
