"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Settings } from "../settings-model"

type SecuritySettingsTabProps = {
  settings: Settings["security"]
  onChange: (changes: Partial<Settings["security"]>) => void
  onSave: () => void
  isSaving: boolean
  hasUnsavedChanges: boolean
}

export function SecuritySettingsTab({ settings, onChange, onSave, isSaving, hasUnsavedChanges }: SecuritySettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seguridad</CardTitle>
        <CardDescription>Configura la seguridad de tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Autenticacion de Dos Factores</Label>
              <p className="text-sm text-muted-foreground">Protege tu cuenta con 2FA</p>
            </div>
            <Switch
              id="two-factor"
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => onChange({ twoFactorAuth: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Tiempo de Sesion (minutos)</Label>
            <Input
              id="session-timeout"
              type="number"
              min="5"
              max="240"
              value={settings.sessionTimeout}
              onChange={(e) => onChange({ sessionTimeout: Number.parseInt(e.target.value, 10) || 30 })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-encryption">Cifrado de Datos</Label>
              <p className="text-sm text-muted-foreground">Cifrar datos sensibles en reposo</p>
            </div>
            <Switch
              id="data-encryption"
              checked={settings.dataEncryption}
              onCheckedChange={(checked) => onChange({ dataEncryption: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-policy">Politica de Contrasenas</Label>
            <Select value={settings.passwordPolicy} onValueChange={(value) => onChange({ passwordPolicy: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ip-whitelist">Lista Blanca de IPs</Label>
            <Input
              id="ip-whitelist"
              placeholder="192.168.1.1, 10.0.0.1"
              value={settings.ipWhitelist.join(", ")}
              onChange={(e) =>
                onChange({
                  ipWhitelist: e.target.value
                    .split(",")
                    .map((ip) => ip.trim())
                    .filter(Boolean),
                })
              }
            />
            <p className="text-xs text-muted-foreground">Separar por comas</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="audit-log">Registro de Auditoria</Label>
              <p className="text-sm text-muted-foreground">Guardar log de actividades</p>
            </div>
            <Switch id="audit-log" checked={settings.auditLog} onCheckedChange={(checked) => onChange({ auditLog: checked })} />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onSave} disabled={isSaving || !hasUnsavedChanges}>
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardFooter>
    </Card>
  )
}
