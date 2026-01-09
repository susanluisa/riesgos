"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Laptop, Moon, Sun } from "lucide-react"
import { Settings } from "../settings-model"

type GeneralSettingsTabProps = {
  settings: Settings["general"]
  onChange: (changes: Partial<Settings["general"]>) => void
  onThemeChange: (theme: string) => void
  onSave: () => void
  isSaving: boolean
  hasUnsavedChanges: boolean
}

export function GeneralSettingsTab({
  settings,
  onChange,
  onThemeChange,
  onSave,
  isSaving,
  hasUnsavedChanges,
}: GeneralSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuraciones Generales</CardTitle>
        <CardDescription>Gestiona tus preferencias generales de la aplicacion.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nombre de la Empresa</Label>
            <Input id="company-name" value={settings.companyName} onChange={(e) => onChange({ companyName: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select value={settings.language} onValueChange={(value) => onChange({ language: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Espanol">Espanol</SelectItem>
                <SelectItem value="Ingles">Ingles</SelectItem>
                <SelectItem value="Frances">Frances</SelectItem>
                <SelectItem value="Aleman">Aleman</SelectItem>
                <SelectItem value="Chino">Chino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Zona Horaria</Label>
            <Select value={settings.timezone} onValueChange={(value) => onChange({ timezone: value })}>
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
            <Label htmlFor="auto-save">Guardado Automatico</Label>
            <p className="text-sm text-muted-foreground">Guardar cambios automaticamente mientras trabajas</p>
          </div>
          <Switch id="auto-save" checked={settings.autoSave} onCheckedChange={(checked) => onChange({ autoSave: checked })} />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Tema</Label>
          <div className="flex items-center space-x-4">
            <Button
              variant={settings.theme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => onThemeChange("light")}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Claro
            </Button>
            <Button
              variant={settings.theme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => onThemeChange("dark")}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Oscuro
            </Button>
            <Button
              variant={settings.theme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => onThemeChange("system")}
              className="flex items-center gap-2"
            >
              <Laptop className="h-4 w-4" />
              Sistema
            </Button>
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
