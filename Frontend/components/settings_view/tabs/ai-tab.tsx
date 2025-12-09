"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Settings } from "../settings-model"

type AiSettingsTabProps = {
  settings: Settings["ai"]
  onChange: (changes: Partial<Settings["ai"]>) => void
  onSave: () => void
  isSaving: boolean
  hasUnsavedChanges: boolean
}

export function AiSettingsTab({ settings, onChange, onSave, isSaving, hasUnsavedChanges }: AiSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuracion IA</CardTitle>
        <CardDescription>Ajusta las preferencias del modelo de IA.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="model-explanations">Explicaciones del modelo</Label>
                <p className="text-sm text-muted-foreground">Mostrar explicaciones de las predicciones</p>
              </div>
              <Switch
                id="model-explanations"
                checked={settings.modelExplanations}
                onCheckedChange={(checked) => onChange({ modelExplanations: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-tuning">Auto ajuste</Label>
                <p className="text-sm text-muted-foreground">Optimizar parametros automaticamente</p>
              </div>
              <Switch id="auto-tuning" checked={settings.autoTuning} onCheckedChange={(checked) => onChange({ autoTuning: checked })} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="feature-importance">Importancia de caracteristicas</Label>
                <p className="text-sm text-muted-foreground">Mostrar importancia de variables</p>
              </div>
              <Switch
                id="feature-importance"
                checked={settings.featureImportance}
                onCheckedChange={(checked) => onChange({ featureImportance: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence-threshold">Umbral de confianza</Label>
              <Input
                id="confidence-threshold"
                type="number"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.confidenceThreshold}
                onChange={(e) => onChange({ confidenceThreshold: Number.parseFloat(e.target.value) || 0.8 })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="retraining-frequency">Frecuencia de reentrenamiento</Label>
          <Select value={settings.retrainingFrequency} onValueChange={(value) => onChange({ retrainingFrequency: value })}>
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
        <Button onClick={onSave} disabled={isSaving || !hasUnsavedChanges}>
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardFooter>
    </Card>
  )
}
